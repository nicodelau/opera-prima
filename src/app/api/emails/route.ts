import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const emails = await prisma.email.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(emails);
  } catch (error: any) {
    console.error("Error loading emails:", error);
    return NextResponse.json({ error: error.message || "Error al cargar correos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { to, subject, body } = await request.json();
    
    if (!to || !subject || !body) {
      return NextResponse.json({ error: "Faltan campos requeridos (to, subject, body)" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "RESEND_API_KEY no está definida en el servidor" }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    
    // We send from the logged-in user's email address
    const fromAddress = session.email;
    const recipients = typeof to === "string" ? [to] : to;

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: recipients,
      subject: subject,
      html: `<div style="font-family: sans-serif; padding: 20px; color: #333;">${body.replace(/\n/g, "<br/>")}</div>`,
      text: body,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Save to Prisma database
    const newEmail = await prisma.email.create({
      data: {
        id: data?.id || `sent-${Date.now()}`,
        type: "sent",
        from: fromAddress,
        to: recipients,
        subject: subject,
        html: `<div style="font-family: sans-serif; padding: 20px; color: #333;">${body.replace(/\n/g, "<br/>")}</div>`,
        text: body,
        userId: session.userId,
      },
    });

    return NextResponse.json({ success: true, email: newEmail });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
  }
}
