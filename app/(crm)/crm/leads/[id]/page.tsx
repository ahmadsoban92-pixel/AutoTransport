"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Lead, LeadStatus } from "@/types/lead";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, User, Car, MapPin, Clock, Save, Loader2,
  Phone, Mail, MessageCircle, UserCheck, Lock, X, Send,
  DollarSign, Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { LEAD_STATUS_COLORS, ALL_LEAD_STATUSES, LEAD_STATUS_DOT_COLORS } from "@/lib/constants";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2 border-b border-blue-900/20">
      <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider w-40 flex-shrink-0">{label}</span>
      <span className="text-blue-100 text-sm">{value || "—"}</span>
    </div>
  );
}

// ─── Email Compose Modal ─────────────────────────────────────────────────────
function EmailComposeModal({
  lead,
  onClose,
}: {
  lead: Lead;
  onClose: () => void;
}) {
  const defaultSubject = `Your Auto Transport Quote – WESAutoTransport`;
  const defaultBody = `Hi ${lead.name},

Thank you for requesting a quote with WESAutoTransport. We have reviewed your request:

• Vehicle: ${lead.vehicle_year} ${lead.vehicle_make} ${lead.vehicle_model}
• Route: ${lead.origin_zip} → ${lead.destination_zip}
• Transport Type: ${lead.transport_type}

Your dedicated broker will be in touch shortly with your personalized quote.

Best regards,
WESAutoTransport Team`;

  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");

  const handleSend = async () => {
    setSending(true);
    setResult("");
    const htmlBody = body.split("\n").map(l => l ? `<p style="margin:4px 0">${l}</p>` : "<br/>").join("");
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: lead.email,
        toName: lead.name,
        subject,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;">
          <h2 style="color:#f97316;margin-top:0;">WESAutoTransport</h2>
          ${htmlBody}
        </div>`,
        text: body,
      }),
    });
    const d = await res.json();
    setResult(res.ok ? "✓ Email sent successfully!" : `✗ ${d.error}`);
    setSending(false);
    if (res.ok) setTimeout(onClose, 1500);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="w-full max-w-2xl bg-[#0a1628] border border-blue-800/40 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-blue-800/30">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-orange-400" />
              <span className="text-white font-semibold">Compose Email</span>
            </div>
            <button onClick={onClose} className="text-blue-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* To (read-only) */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-blue-500 w-12 text-right shrink-0">To</span>
              <div className="flex-1 px-3 py-2 rounded-lg bg-blue-950/40 border border-blue-800/30 text-blue-200 text-sm">
                {lead.name} &lt;{lead.email}&gt;
              </div>
            </div>

            {/* Subject */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-blue-500 w-12 text-right shrink-0">Subject</span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-blue-950/40 border border-blue-800/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              />
            </div>

            {/* Body */}
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className="w-full px-4 py-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-white text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-orange-500/40 resize-y"
            />

            {result && (
              <p className={`text-sm ${result.startsWith("✓") ? "text-green-400" : "text-red-400"}`}>{result}</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={onClose} className="border-blue-700 text-blue-300 hover:bg-blue-900/40">
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={sending || !subject || !body}
                className="bg-orange-500 hover:bg-orange-600 text-white border-0 disabled:opacity-40"
              >
                {sending ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Sending...</> : <><Send className="mr-2 w-4 h-4" /> Send Email</>}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

// Helper: send a pre-built email via Resend
async function sendAutoEmail(lead: Lead): Promise<void> {
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: lead.email,
        toName: lead.name,
        subject: "Your Auto Transport Quote – WESAutoTransport",
        html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;">
  <h2 style="color:#f97316;margin-top:0;">WESAutoTransport</h2>
  <p>Hi ${lead.name},</p>
  <p>Great news — your quote request has been picked up by one of our dedicated brokers! Here's a summary of what we've received:</p>
  <ul style="background:#f9fafb;padding:16px 24px;border-radius:8px;border-left:4px solid #f97316;margin:16px 0;">
    <li><strong>Vehicle:</strong> ${lead.vehicle_year} ${lead.vehicle_make} ${lead.vehicle_model}</li>
    <li><strong>Route:</strong> ${lead.origin_zip} → ${lead.destination_zip}</li>
    <li><strong>Transport Type:</strong> ${lead.transport_type}</li>
  </ul>
  <p>Your broker will be reaching out to you within <strong>2–30 minutes</strong> with a personalized rate and to answer any questions you may have.</p>
  <p style="margin-top:24px;">Best regards,<br/><strong>WESAutoTransport Team</strong></p>
</div>`,
        text: `Hi ${lead.name},\nYour quote has been picked up. Your broker will contact you within 2-30 minutes.\n\nVehicle: ${lead.vehicle_year} ${lead.vehicle_make} ${lead.vehicle_model}\nRoute: ${lead.origin_zip} → ${lead.destination_zip}\nTransport Type: ${lead.transport_type}`,
      }),
    });
  } catch {
    // Non-blocking — log but don't stop the claim flow
    console.error("Auto-email failed after claim");
  }
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const ctx = searchParams.get("ctx") ?? "view";

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [newStatus, setNewStatus] = useState<LeadStatus>("New");
  const [saving, setSaving] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  // Price-prompt modal state
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<LeadStatus | null>(null);
  const [priceInput, setPriceInput] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? "");
      setCurrentUserEmail(data.user?.email ?? "");
    });
  }, []);

  useEffect(() => {
    async function fetchLead() {
      const { data, error } = await supabase.from("leads").select("*").eq("id", id).single();
      if (!error && data) {
        setLead(data as Lead);
        setNewStatus(data.status as LeadStatus);
      }
      setLoading(false);
    }
    fetchLead();
  }, [id]);

  const canEdit = ctx === "mine" && lead?.assigned_broker_id === currentUserId;
  const canClaim = ctx === "claim" && lead?.status === "New" && !lead?.assigned_broker_id;

  const handleClaim = async () => {
    if (!lead || !currentUserId) return;
    setClaiming(true);
    const { error } = await supabase.from("leads").update({
      assigned_broker_id: currentUserId,
      assigned_broker_email: currentUserEmail,
      status: "Contacted",
    }).eq("id", id);
    if (!error) {
      // Auto-send confirmation email to customer
      await sendAutoEmail(lead);
      router.push("/crm/dashboard");
    } else {
      setSaveMessage("✗ Failed to claim: " + error.message);
      setClaiming(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!lead || newStatus === lead.status) return;
    // If moving away from New and no price set → prompt for price first
    if (newStatus !== "New" && !lead.finalized_price) {
      setPendingStatus(newStatus);
      setPriceInput("");
      setShowPriceModal(true);
      return;
    }
    await doStatusUpdate(newStatus, lead.finalized_price ?? null);
  };

  const doStatusUpdate = async (status: LeadStatus, price: number | null) => {
    setSaving(true);
    const updatePayload: Record<string, unknown> = { status };
    if (price !== null) updatePayload.finalized_price = price;
    const { error } = await supabase.from("leads").update(updatePayload).eq("id", id);
    if (!error) {
      setLead((prev) => prev ? { ...prev, status, finalized_price: price ?? prev.finalized_price } : prev);
      setSaveMessage("✓ Status updated");
      setTimeout(() => setSaveMessage(""), 3000);
    } else {
      setSaveMessage("✗ Failed: " + error.message);
    }
    setSaving(false);
    setShowPriceModal(false);
  };

  const handlePriceConfirm = async () => {
    const price = parseFloat(priceInput);
    if (isNaN(price) || price <= 0) return;
    await doStatusUpdate(pendingStatus!, price);
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center min-h-[400px] text-blue-400">Loading lead...</div>;
  }

  if (!lead) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-400">Lead not found.</div>
        <Button variant="outline" onClick={() => router.back()} className="mt-4 border-blue-700 text-blue-300">Go Back</Button>
      </div>
    );
  }

  const waMsg = encodeURIComponent(
    `Hi ${lead.name}, this is WESAutoTransport. We received your quote request for your ${lead.vehicle_year} ${lead.vehicle_make} ${lead.vehicle_model} from ${lead.origin_zip} to ${lead.destination_zip}. I'd love to help you get the best rate. Would now be a good time to chat?`
  );

  return (
    <>
      {showEmailModal && <EmailComposeModal lead={lead} onClose={() => setShowEmailModal(false)} />}

      {/* Price prompt modal */}
      <AnimatePresence>
        {showPriceModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowPriceModal(false)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96 }}
              className="bg-[#0a1628] border border-orange-500/40 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold">Set Finalized Price</h2>
                  <p className="text-blue-400 text-xs mt-0.5">Required before changing status to <span className="text-orange-300 font-semibold">{pendingStatus}</span></p>
                </div>
              </div>
              <p className="text-blue-300 text-sm mb-4">Enter the price agreed with the client. This will be saved permanently with the lead.</p>
              <div className="relative mb-4">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  step="25"
                  placeholder="e.g. 1250"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePriceConfirm()}
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-blue-950/60 border border-blue-700/40 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPriceModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-blue-700/40 text-blue-300 hover:bg-blue-900/40 text-sm transition-colors"
                >Cancel</button>
                <button
                  onClick={handlePriceConfirm}
                  disabled={!priceInput || parseFloat(priceInput) <= 0 || saving}
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors disabled:opacity-40"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Confirm & Save"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 md:p-8 max-w-4xl">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-blue-400 hover:text-white text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">{lead.name}</h1>
            <p className="text-blue-400 text-sm mt-1">Lead ID: {lead.id}</p>
            {lead.assigned_broker_email && (
              <p className="text-xs text-blue-500 mt-0.5 flex items-center gap-1">
                <UserCheck className="w-3 h-3" /> Handled by {lead.assigned_broker_email}
              </p>
            )}
            {ctx === "view" && (
              <span className="inline-flex items-center gap-1 mt-2 text-xs px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-400 border border-blue-700/30">
                <Lock className="w-3 h-3" /> View only
              </span>
            )}
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${LEAD_STATUS_COLORS[lead.status]}`}>
            {lead.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center"><User className="w-4 h-4 text-blue-400" /></div>
                <h2 className="text-white font-semibold">Customer Information</h2>
              </div>
              <InfoRow label="Name" value={lead.name} />
              <InfoRow label="Email" value={lead.email} />
              <InfoRow label="Phone" value={lead.phone} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center"><Car className="w-4 h-4 text-orange-400" /></div>
                <h2 className="text-white font-semibold">Vehicle Information</h2>
              </div>
              <InfoRow label="Year" value={String(lead.vehicle_year)} />
              <InfoRow label="Make" value={lead.vehicle_make} />
              <InfoRow label="Model" value={lead.vehicle_model} />
              <InfoRow label="Condition" value={lead.vehicle_condition ?? "—"} />
              <InfoRow label="Transport Type" value={lead.transport_type} />
              {lead.finalized_price && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2 border-b border-blue-900/20">
                  <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider w-40 flex-shrink-0">Finalized Price</span>
                  <span className="text-green-400 font-bold text-base">${lead.finalized_price.toLocaleString()}</span>
                </div>
              )}
            </motion.div>

            {/* Car image — shown if uploaded */}
            {lead.car_image_url && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-purple-400" /></div>
                  <h2 className="text-white font-semibold">Vehicle Photo</h2>
                </div>
                <img
                  src={lead.car_image_url}
                  alt="Customer vehicle"
                  className="w-full rounded-xl object-cover max-h-64 border border-blue-800/20"
                />
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center"><MapPin className="w-4 h-4 text-green-400" /></div>
                <h2 className="text-white font-semibold">Route Information</h2>
              </div>
              <InfoRow label="Pickup ZIP" value={lead.origin_zip} />
              <InfoRow label="Delivery ZIP" value={lead.destination_zip} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center"><Clock className="w-4 h-4 text-purple-400" /></div>
                <h2 className="text-white font-semibold">Submission Details</h2>
              </div>
              <InfoRow label="Submitted" value={new Date(lead.created_at).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })} />
            </motion.div>

            {/* Contact buttons — only in mine/claim modes */}
            {(canEdit || canClaim) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-4">Contact Customer</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <a href={`tel:${lead.phone}`} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
                    <Phone className="w-4 h-4" /> Call
                  </a>
                  <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}?text=${waMsg}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                  {/* Opens compose modal */}
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium transition-colors"
                  >
                    <Mail className="w-4 h-4" /> Email
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: action panel */}
          <div>
            {canClaim && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#0a1628] border border-orange-700/40 rounded-2xl p-6 sticky top-8">
                <h2 className="text-white font-semibold mb-2">Claim This Lead</h2>
                <p className="text-blue-400 text-sm mb-6">
                  Claiming assigns this lead to you, sets its status to <strong className="text-yellow-400">Contacted</strong>, and <strong className="text-orange-300">automatically sends a confirmation email</strong> to the customer.
                </p>
                <Button onClick={handleClaim} disabled={claiming} className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0">
                  {claiming ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Claiming...</> : <><UserCheck className="mr-2 w-4 h-4" /> Claim Lead</>}
                </Button>
                {saveMessage && <p className="text-xs text-center mt-3 text-red-400">{saveMessage}</p>}
              </motion.div>
            )}

            {canEdit && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6 sticky top-8">
                <h2 className="text-white font-semibold mb-4">Update Lead Status</h2>
                <div className="space-y-2 mb-4">
                  {ALL_LEAD_STATUSES.map((status) => (
                    <button
                      key={status}
                      onClick={() => setNewStatus(status)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${newStatus === status ? LEAD_STATUS_COLORS[status] : "border-blue-800/30 text-blue-400 hover:border-blue-600/50 hover:text-blue-200"}`}
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${LEAD_STATUS_DOT_COLORS[status]}`} />
                      {status}
                    </button>
                  ))}
                </div>
                {lead.finalized_price && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
                    <span className="text-xs text-green-400 font-semibold uppercase tracking-wider">Agreed Price</span>
                    <div className="text-green-300 font-bold text-xl mt-0.5">${lead.finalized_price.toLocaleString()}</div>
                  </div>
                )}
                <Button onClick={handleStatusUpdate} disabled={saving || newStatus === lead.status} className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0 disabled:opacity-40">
                  {saving ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Saving...</> : <><Save className="mr-2 w-4 h-4" /> Save Status</>}
                </Button>
                {saveMessage && (
                  <p className={`text-xs text-center mt-3 ${saveMessage.includes("✓") ? "text-green-400" : "text-red-400"}`}>{saveMessage}</p>
                )}
              </motion.div>
            )}

            {ctx === "view" && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6 sticky top-8">
                <div className="flex items-center gap-2 text-blue-400 mb-3"><Lock className="w-4 h-4" /><h2 className="text-white font-semibold text-sm">Read-Only View</h2></div>
                <p className="text-blue-500 text-xs">
                  {!lead.assigned_broker_id
                    ? "Go to New Leads to claim this lead."
                    : lead.assigned_broker_id === currentUserId
                      ? "You are handling this lead. Open it from your Dashboard to edit."
                      : "This lead is currently being handled by another broker."}
                </p>
              </motion.div>
            )}

            {ctx === "mine" && !canEdit && lead.assigned_broker_id && lead.assigned_broker_id !== currentUserId && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#0a1628] border border-red-800/40 rounded-2xl p-6 sticky top-8">
                <div className="flex items-center gap-2 text-red-400 mb-2"><Lock className="w-4 h-4" /><h2 className="text-white font-semibold text-sm">Access Restricted</h2></div>
                <p className="text-blue-500 text-xs">This lead is assigned to a different broker.</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
