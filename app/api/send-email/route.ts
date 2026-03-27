import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// ─── Gmail SMTP transporter ──────────────────────────────────────────────────
// Env vars needed (add to .env.local AND Vercel dashboard):
//   GMAIL_USER        — your Gmail address, e.g. yourteam@gmail.com
//   GMAIL_APP_PASSWORD — 16-char App Password (Google Account → Security → 2-Step → App passwords)
// ─────────────────────────────────────────────────────────────────────────────

function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function POST(request: NextRequest) {
  const transporter = createTransporter();

  if (!transporter) {
    return NextResponse.json(
      {
        error:
          "Email not configured. Add GMAIL_USER and GMAIL_APP_PASSWORD to your environment variables.",
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { to, toName, subject, html, text } = body;

    if (!to || !subject || (!html && !text)) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, and html or text" },
        { status: 400 }
      );
    }

    const fromName = "WESAutoTransport";
    const fromAddress = process.env.GMAIL_USER!;

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: toName ? `"${toName}" <${to}>` : to,
      subject,
      html: html || `<p>${text}</p>`,
      text: text || "",
    });

    return NextResponse.json({ success: true, id: info.messageId }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("Nodemailer error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
