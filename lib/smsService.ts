// lib/smsService.ts
// Centralised Twilio SMS wrapper.
// Used by API routes for three trigger points:
//   1. Customer "quote received" on form submit
//   2. Customer "broker assigned" when a broker claims a lead
//   3. Broker "high-value lead" when Enclosed/Expedited lead is submitted
//
// Gracefully no-ops if TWILIO_* env vars are absent so dev mode is unaffected.

import twilio from "twilio";

function getClient() {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_PHONE_NUMBER;

  // Detect placeholder / missing values and skip initialisation
  if (!sid || !token || !from) return null;
  if (sid.startsWith("ACxxxxxxxx")) return null;   // still the default placeholder

  try {
    return { client: twilio(sid, token), from };
  } catch {
    return null;
  }
}

/**
 * Send an SMS message.
 * @param to   Recipient E.164 phone number, e.g. +15005550006
 * @param body SMS text body (keep under 160 chars for single-segment)
 * Returns true on success, false on any failure.
 * Never throws.
 */
export async function sendSms(to: string, body: string): Promise<boolean> {
  const ctx = getClient();
  if (!ctx) {
    console.info("[smsService] Twilio not configured — skipping SMS to", to);
    return false;
  }

  // Sanitise number: must be E.164 (+digits)
  const e164 = to.replace(/[\s\-().]/g, "");
  if (!/^\+\d{7,15}$/.test(e164)) {
    console.warn("[smsService] Invalid phone number format:", to);
    return false;
  }

  try {
    await ctx.client.messages.create({ from: ctx.from, to: e164, body });
    return true;
  } catch (err) {
    console.error("[smsService] Send failed:", err);
    return false;
  }
}

// ─── Pre-built message builders ───────────────────────────────────────────────

export function smsQuoteReceived(name: string, trackingUrl: string): string {
  return `Hi ${name}! WESAutoTransport received your quote request. Track your shipment: ${trackingUrl}`;
}

export function smsBrokerAssigned(name: string, trackingUrl: string): string {
  return `Hi ${name}! A WESAutoTransport broker has been assigned to your shipment. Track updates here: ${trackingUrl}`;
}

export function smsHighValueLead(
  transportType: string,
  vehicle: string,
  route: string
): string {
  return `🚨 New ${transportType} lead! ${vehicle} — ${route}. Log in to the CRM to claim it.`;
}
