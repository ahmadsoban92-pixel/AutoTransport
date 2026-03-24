import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  const resendKey = process.env.RESEND_API_KEY;

  if (!resendKey || resendKey.startsWith("re_your")) {
    return NextResponse.json(
      { error: "Resend API key not configured. Add RESEND_API_KEY to .env.local" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { to, toName, subject, html, text } = body;

    if (!to || !subject || (!html && !text)) {
      return NextResponse.json({ error: "Missing required fields: to, subject, html or text" }, { status: 400 });
    }

    const resend = new Resend(resendKey);

    const fromAddress = process.env.RESEND_FROM_EMAIL || "AutoTransportPro <noreply@autotransportpro.com>";

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject,
      html: html || `<p>${text}</p>`,
      text: text || "",
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
