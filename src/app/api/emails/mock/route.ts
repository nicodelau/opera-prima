import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { from, subject, body } = await request.json();

    if (!from || !subject || !body) {
      return NextResponse.json({ error: "Faltan datos obligatorios (from, subject, body)" }, { status: 400 });
    }

    const mockEmail = await prisma.email.create({
      data: {
        id: `mock-${Date.now()}`,
        type: "received",
        from: from,
        to: [session.email],
        subject: subject,
        html: `<div style="font-family: sans-serif; padding: 20px; color: #333;">${body.replace(/\n/g, "<br/>")}</div>`,
        text: body,
        userId: session.userId,
      },
    });

    return NextResponse.json({ success: true, email: mockEmail });
  } catch (error: any) {
    console.error("Error creating mock email:", error);
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
  }
}
