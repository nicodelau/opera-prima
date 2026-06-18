import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log("Resend webhook received:", JSON.stringify(payload, null, 2));

    if (payload.type === "email.received") {
      const emailId = payload.data?.email_id;
      if (!emailId) {
        return NextResponse.json({ error: "Missing email_id in payload.data" }, { status: 400 });
      }

      const recipientEmails: string[] = payload.data.to || [];
      
      // Clean and normalize email addresses (handle formats like "Name <email>" and lowercase them)
      const cleanRecipientEmails = recipientEmails.map((email: string) => {
        const match = email.match(/<(.+?)>/);
        return (match ? match[1] : email).trim().toLowerCase();
      });

      // Find the user in our database who is the recipient of this email (case-insensitive)
      let user = await prisma.user.findFirst({
        where: {
          email: {
            in: cleanRecipientEmails,
            mode: "insensitive",
          },
        },
      });

      // Fallback: if no user matches, assign to the first registered user in the database
      if (!user) {
        user = await prisma.user.findFirst();
      }

      if (!user) {
        console.warn("No users registered in the database. Discarding incoming email.");
        return NextResponse.json({ error: "No users exist in the system" }, { status: 400 });
      }

      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: "RESEND_API_KEY is not defined" }, { status: 500 });
      }

      const resend = new Resend(apiKey);
      
      try {
        const { data: emailData, error } = await resend.emails.receiving.get(emailId);
        
        if (error || !emailData) {
          throw new Error(error?.message || "Failed to fetch email details from Resend API");
        }

        const newEmail = await prisma.email.create({
          data: {
            id: emailId,
            type: "received",
            from: emailData.from || payload.data.from,
            to: emailData.to || payload.data.to,
            subject: emailData.subject || payload.data.subject,
            html: emailData.html || undefined,
            text: emailData.text || undefined,
            userId: user.id,
            createdAt: emailData.created_at ? new Date(emailData.created_at) : new Date(),
          },
        });

        return NextResponse.json({ success: true, email: newEmail });
      } catch (fetchError: any) {
        console.warn("Falling back to payload metadata due to:", fetchError.message);
        
        const newEmail = await prisma.email.create({
          data: {
            id: emailId,
            type: "received",
            from: payload.data.from,
            to: payload.data.to,
            subject: payload.data.subject,
            text: "Full content could not be retrieved. Only metadata received.",
            html: "<p>Full content could not be retrieved. Only metadata received.</p>",
            userId: user.id,
            createdAt: payload.data.created_at ? new Date(payload.data.created_at) : new Date(),
          },
        });

        return NextResponse.json({ success: true, fallback: true, email: newEmail });
      }
    }

    return NextResponse.json({ message: "Webhook processed but ignored" });
  } catch (error: any) {
    console.error("Webhook route error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
