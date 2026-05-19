// lib/emailService.ts
// Centralised Nodemailer wrapper used by all server-side features.
// Mirrors the Gmail SMTP config already in /api/send-email/route.ts
// but as a reusable service module so individual API routes don't need
// to re-implement the transporter.

import nodemailer from "nodemailer";

function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
}

interface SendMailOptions {
  to:       string;
  toName?:  string;
  subject:  string;
  html:     string;
  text?:    string;
}

/**
 * Send a transactional email via Gmail SMTP.
 * Returns true on success, false if email is not configured or sending fails.
 * Never throws — callers should not have their primary flow interrupted by email failure.
 */
export async function sendMail(opts: SendMailOptions): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn("[emailService] Email not configured — skipping send.");
    return false;
  }
  try {
    const fromAddress = process.env.GMAIL_USER!;
    await transporter.sendMail({
      from: `"WESAutoTransport" <${fromAddress}>`,
      to:   opts.toName ? `"${opts.toName}" <${opts.to}>` : opts.to,
      subject: opts.subject,
      html:    opts.html,
      text:    opts.text ?? "",
    });
    return true;
  } catch (err) {
    console.error("[emailService] Send failed:", err);
    return false;
  }
}

// ─── Email templates ──────────────────────────────────────────────────────────

export function quoteReceivedHtml(name: string, trackingUrl: string, trackingToken: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#060d1f;font-family:Inter,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#0a1628;border-radius:16px;overflow:hidden;border:1px solid rgba(59,130,246,0.2);">
    <div style="background:linear-gradient(135deg,#1e3a5f,#0a1628);padding:32px;text-align:center;">
      <h1 style="margin:0;color:#f97316;font-size:24px;font-weight:700;">WESAutoTransport</h1>
      <p style="margin:8px 0 0;color:#93c5fd;font-size:14px;">Nationwide Vehicle Shipping</p>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#ffffff;font-size:20px;margin:0 0 16px;">We received your quote request, ${name}!</h2>
      <p style="color:#93c5fd;line-height:1.6;margin:0 0 24px;">
        Thank you for reaching out to WESAutoTransport. Our team is reviewing your shipment details and will contact you shortly with a personalised quote.
      </p>

      <!-- Tracking Token Box -->
      <div style="background:#0f2347;border:1px solid rgba(249,115,22,0.3);border-radius:12px;padding:20px;margin:0 0 24px;text-align:center;">
        <p style="color:#93c5fd;font-size:13px;margin:0 0 10px;">📦 Your Shipment Tracking ID</p>
        <div style="background:#060d1f;border-radius:8px;padding:12px 20px;display:inline-block;">
          <code style="color:#f97316;font-size:22px;font-weight:700;letter-spacing:3px;">${trackingToken}</code>
        </div>
        <p style="color:#475569;font-size:11px;margin:10px 0 0;">
          Save this ID — you can use it any time on our website to check your shipment status.
        </p>
      </div>

      <p style="color:#93c5fd;line-height:1.6;margin:0 0 24px;">
        Or click the button below to open your tracking page directly:
      </p>
      <div style="text-align:center;margin:0 0 32px;">
        <a href="${trackingUrl}" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:16px;">
          Track My Shipment →
        </a>
      </div>
      <p style="color:#475569;font-size:12px;text-align:center;margin:0;">
        Questions? Reply to this email or call us. We're here to help.
      </p>
    </div>
    <div style="background:#060d1f;padding:20px;text-align:center;">
      <p style="color:#334155;font-size:12px;margin:0;">© ${new Date().getFullYear()} WESAutoTransport · All rights reserved</p>
    </div>
  </div>
</body>
</html>`;
}


// Manual payment instructions email — replaces Stripe checkout
export function manualPaymentHtml(
  name:    string,
  amount:  number,
  vehicle: string,
  route:   string,
  leadId:  string
): string {
  const dollars    = amount.toFixed(2);
  const paypalInfo = process.env.PAYMENT_PAYPAL    ?? "Not configured — contact us";
  const bankInfo   = process.env.PAYMENT_BANK_INFO ?? "Not configured — contact us";
  const reference  = `WES-${leadId.slice(0, 8).toUpperCase()}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#060d1f;font-family:Inter,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#0a1628;border-radius:16px;overflow:hidden;border:1px solid rgba(59,130,246,0.2);">
    <div style="background:linear-gradient(135deg,#1e3a5f,#0a1628);padding:32px;text-align:center;">
      <h1 style="margin:0;color:#f97316;font-size:24px;font-weight:700;">WESAutoTransport</h1>
      <p style="margin:8px 0 0;color:#93c5fd;font-size:14px;">Your quote has been finalised!</p>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#ffffff;font-size:20px;margin:0 0 16px;">Hi ${name} — here are your payment details</h2>

      <!-- Order summary -->
      <div style="background:#0f2347;border-radius:12px;padding:20px;margin:0 0 24px;border:1px solid rgba(59,130,246,0.15);">
        <p style="color:#93c5fd;margin:0 0 8px;font-size:13px;">Vehicle: <span style="color:#fff;font-weight:600;">${vehicle}</span></p>
        <p style="color:#93c5fd;margin:0 0 8px;font-size:13px;">Route: <span style="color:#fff;font-weight:600;">${route}</span></p>
        <p style="color:#93c5fd;margin:0 0 8px;font-size:13px;">Reference #: <span style="color:#fff;font-weight:600;">${reference}</span></p>
        <p style="color:#93c5fd;margin:0;font-size:13px;">Amount Due: <span style="color:#f97316;font-weight:700;font-size:20px;">$${dollars}</span></p>
      </div>

      <p style="color:#93c5fd;line-height:1.6;margin:0 0 20px;">
        To confirm your booking, please send your payment using one of the methods below. <strong style="color:#fff;">Include your Reference # in the payment note.</strong>
      </p>

      <!-- Payment methods -->
      <div style="border-radius:12px;border:1px solid rgba(59,130,246,0.2);overflow:hidden;margin:0 0 28px;">
        <div style="padding:16px 20px;border-bottom:1px solid rgba(59,130,246,0.15);">
          <p style="color:#f97316;font-weight:600;margin:0 0 4px;font-size:14px;">💰 PayPal</p>
          <p style="color:#e2e8f0;font-size:14px;margin:0;">${paypalInfo}</p>
        </div>
        <div style="padding:16px 20px;">
          <p style="color:#f97316;font-weight:600;margin:0 0 4px;font-size:14px;">🏦 Bank Transfer / Zelle</p>
          <p style="color:#e2e8f0;font-size:14px;margin:0;white-space:pre-line;">${bankInfo}</p>
        </div>
      </div>

      <p style="color:#93c5fd;line-height:1.6;margin:0 0 8px;font-size:13px;">
        After sending payment, our team will verify and confirm your booking within 1 business day.
      </p>
      <p style="color:#475569;font-size:12px;text-align:center;margin:16px 0 0;">
        Questions? Reply to this email. Reference your order ID: <strong style="color:#93c5fd;">${reference}</strong>
      </p>
    </div>
    <div style="background:#060d1f;padding:20px;text-align:center;">
      <p style="color:#334155;font-size:12px;margin:0;">© ${new Date().getFullYear()} WESAutoTransport · All rights reserved</p>
    </div>
  </div>
</body>
</html>`;
}
