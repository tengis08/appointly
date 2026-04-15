import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body ?? {};

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL;

    if (!receiverEmail) {
      return NextResponse.json(
        { error: "CONTACT_RECEIVER_EMAIL is not configured." },
        { status: 500 }
      );
    }

    const { error } = await resend.emails.send({
      from: "Appointly <hello@appointly.vip>",
      to: [receiverEmail],
      subject: `New Appointly request from ${name}`,
      replyTo: email,
      text: [
        `New contact request from Appointly`,
        ``,
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone || "-"}`,
        `Message: ${message || "-"}`,
      ].join("\n"),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to send email." },
      { status: 500 }
    );
  }
}