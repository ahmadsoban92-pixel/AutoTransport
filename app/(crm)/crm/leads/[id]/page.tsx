"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Lead, LeadStatus } from "@/types/lead";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, User, Car, MapPin, Clock, Save, Loader2,
  Phone, Mail, MessageCircle, UserCheck, Lock, DollarSign,
  CreditCard, Link2, Copy, Check, Truck, Calendar,
  MessageSquare, ExternalLink, CheckCircle2, Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailComposeModal } from "@/components/EmailComposeModal";
import { LEAD_STATUS_COLORS, ALL_LEAD_STATUSES, LEAD_STATUS_DOT_COLORS } from "@/lib/constants";

// ─── Price-required statuses ──────────────────────────────────────────────────
const PRICE_REQUIRED = new Set<LeadStatus>(["Quoted", "Booked", "Dispatched", "In Transit", "Delivered", "Lost"]);

// ─── Sub-components ───────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2 border-b border-blue-900/20 last:border-0">
      <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider w-40 flex-shrink-0">{label}</span>
      <span className="text-blue-100 text-sm">{value || "—"}</span>
    </div>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1 text-xs text-blue-400 hover:text-orange-400 transition-colors px-2 py-1 rounded-lg hover:bg-orange-500/10"
    >
      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// Auto-email sent when broker claims the lead
async function sendClaimEmail(lead: Lead) {
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: lead.email, toName: lead.name,
        subject: "Your Auto Transport Quote – WESAutoTransport",
        html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;">
  <h2 style="color:#f97316;margin-top:0;">WESAutoTransport</h2>
  <p>Hi ${lead.name},</p>
  <p>Your quote request has been picked up by one of our dedicated brokers! Here's a summary:</p>
  <ul style="background:#f9fafb;padding:16px 24px;border-radius:8px;border-left:4px solid #f97316;margin:16px 0;">
    <li><strong>Vehicle:</strong> ${lead.vehicle_year} ${lead.vehicle_make} ${lead.vehicle_model}</li>
    <li><strong>Route:</strong> ${lead.origin_zip} → ${lead.destination_zip}</li>
    <li><strong>Transport Type:</strong> ${lead.transport_type}</li>
  </ul>
  <p>Your broker will contact you within <strong>2–30 minutes</strong> with a personalized rate.</p>
  <p style="margin-top:24px;">Best regards,<br/><strong>WESAutoTransport Team</strong></p>
</div>`,
      }),
    });
  } catch { /* non-blocking */ }
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function LeadDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();
  const searchParams  = useSearchParams();
  const ctx           = searchParams.get("ctx") ?? "view";

  const [lead,         setLead]         = useState<Lead | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [currentUid,   setCurrentUid]   = useState("");
  const [currentEmail, setCurrentEmail] = useState("");

  // Status + price
  const [newStatus,    setNewStatus]    = useState<LeadStatus>("New");
  const [saving,       setSaving]       = useState(false);
  const [saveMsg,      setSaveMsg]      = useState("");
  const [showPriceDlg, setShowPriceDlg] = useState(false);
  const [pendingStatus,setPendingStatus]= useState<LeadStatus | null>(null);
  const [priceInput,   setPriceInput]   = useState("");

  // Carrier / shipment fields
  const [carrierName,  setCarrierName]  = useState("");
  const [estDelivery,  setEstDelivery]  = useState("");
  const [notes,        setNotes]        = useState("");
  const [savingInfo,   setSavingInfo]   = useState(false);
  const [infoMsg,      setInfoMsg]      = useState("");

  // Payment
  const [sendingPay,   setSendingPay]   = useState(false);
  const [markingPaid,  setMarkingPaid]  = useState(false);
  const [payMsg,       setPayMsg]       = useState("");

  // Claim
  const [claiming,     setClaiming]     = useState(false);

  // Email compose modal
  const [showEmail,    setShowEmail]    = useState(false);

  // ── Auth ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUid(data.user?.id ?? "");
      setCurrentEmail(data.user?.email ?? "");
    });
  }, []);

  // ── Fetch lead ────────────────────────────────────────────────────────────
  const fetchLead = useCallback(async () => {
    const { data, error } = await supabase.from("leads").select("*").eq("id", id).single();
    if (!error && data) {
      const l = data as Lead;
      setLead(l);
      setNewStatus(l.status);
      setCarrierName(l.carrier_name ?? "");
      setEstDelivery(l.estimated_delivery ?? "");
      setNotes(l.shipment_notes ?? "");
      setPriceInput(l.finalized_price != null ? String(l.finalized_price) : "");
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchLead(); }, [fetchLead]);

  // ── Claim ─────────────────────────────────────────────────────────────────
  const handleClaim = async () => {
    if (!lead || !currentUid) return;
    setClaiming(true);
    const { error } = await supabase.from("leads").update({
      assigned_broker_id: currentUid, assigned_broker_email: currentEmail, status: "Contacted",
    }).eq("id", id);
    if (!error) { await sendClaimEmail(lead); router.push("/crm/dashboard"); }
    else { setSaveMsg("✗ Failed to claim: " + error.message); setClaiming(false); }
  };

  // ── Status update ─────────────────────────────────────────────────────────
  const handleStatusUpdate = async () => {
    if (!lead || newStatus === lead.status) return;
    if (PRICE_REQUIRED.has(newStatus) && !lead.finalized_price) {
      setPendingStatus(newStatus);
      setPriceInput("");
      setShowPriceDlg(true);
      return;
    }
    await doStatusUpdate(newStatus, lead.finalized_price ?? null);
  };

  const doStatusUpdate = async (status: LeadStatus, price: number | null) => {
    setSaving(true);
    const payload: Record<string, unknown> = { status };
    if (price !== null) payload.finalized_price = price;
    const { error } = await supabase.from("leads").update(payload).eq("id", id);
    if (!error) {
      setLead((p) => p ? { ...p, status, finalized_price: price ?? p.finalized_price } : p);
      setSaveMsg("✓ Status updated");
    } else {
      setSaveMsg("✗ Failed: " + error.message);
    }
    setSaving(false);
    setShowPriceDlg(false);
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const handlePriceConfirm = async () => {
    const price = parseFloat(priceInput);
    if (isNaN(price) || price <= 0) return;
    await doStatusUpdate(pendingStatus!, price);
  };

  // ── Carrier / shipment info ───────────────────────────────────────────────
  const handleCarrierUpdate = async () => {
    if (!lead) return;
    setSavingInfo(true);
    setInfoMsg("");
    const updates = {
      carrier_name: carrierName || null,
      estimated_delivery: estDelivery || null,
      shipment_notes: notes || null,
    };
    const { error } = await supabase.from("leads").update(updates).eq("id", id);
    if (!error) {
      setLead((p) => p ? { ...p, ...updates } : p);
      setInfoMsg("✓ Shipment info saved");
    } else { setInfoMsg("✗ Failed to save"); }
    setSavingInfo(false);
    setTimeout(() => setInfoMsg(""), 4000);
  };

  // ── Send payment instructions email ─────────────────────────────────────
  const handleSendPayment = async () => {
    if (!lead) return;
    setSendingPay(true);
    setPayMsg("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ leadId: lead.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setPayMsg("✓ Payment instructions sent to customer!");
    } catch (e: unknown) {
      setPayMsg(`✗ ${e instanceof Error ? e.message : "Error"}`);
    }
    setSendingPay(false);
    setTimeout(() => setPayMsg(""), 6000);
  };

  // ── Mark as paid ────────────────────────────────────────────────────────
  const handleMarkPaid = async () => {
    if (!lead) return;
    setMarkingPaid(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/leads/${lead.id}/mark-paid`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) throw new Error("Failed");
      setLead((p) => p ? { ...p, status: "Booked", stripe_payment_status: "paid" } : p);
      setNewStatus("Booked");
      setPayMsg("✓ Marked as paid — status set to Booked!");
    } catch { setPayMsg("✗ Failed to mark as paid"); }
    setMarkingPaid(false);
    setTimeout(() => setPayMsg(""), 5000);
  };

  // ── Render guards ────────────────────────────────────────────────────────
  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
    </div>
  );

  if (!lead) return (
    <div className="p-8 text-center">
      <p className="text-red-400">Lead not found.</p>
      <Button variant="outline" onClick={() => router.back()} className="mt-4 border-blue-700 text-blue-300">Go Back</Button>
    </div>
  );

  const canEdit   = ctx === "mine"  && lead.assigned_broker_id === currentUid;
  const canClaim  = ctx === "claim" && lead.status === "New" && !lead.assigned_broker_id;

  const appUrl     = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const trackingUrl= lead.tracking_token ? `${appUrl}/track/${lead.tracking_token}` : null;
  const isPaid     = (lead.stripe_payment_status as string) === "paid";
  const canPay     = !!(lead.finalized_price && lead.finalized_price > 0 && !isPaid &&
    ["Quoted","Booked","Dispatched","In Transit","Delivered"].includes(lead.status));

  const waMsg = encodeURIComponent(
    `Hi ${lead.name}, this is WESAutoTransport. We received your quote request for your ${lead.vehicle_year} ${lead.vehicle_make} ${lead.vehicle_model} from ${lead.origin_zip} to ${lead.destination_zip}. I'd love to help you get the best rate. Would now be a good time to chat?`
  );

  return (
    <>
      {showEmail && (
        <EmailComposeModal
          to={lead.email} toName={lead.name}
          defaultSubject="Your Auto Transport Quote – WESAutoTransport"
          defaultBody={`Hi ${lead.name},\n\nThank you for requesting a quote with WESAutoTransport. We have reviewed your request:\n\n• Vehicle: ${lead.vehicle_year} ${lead.vehicle_make} ${lead.vehicle_model}\n• Route: ${lead.origin_zip} → ${lead.destination_zip}\n• Transport Type: ${lead.transport_type}\n\nYour dedicated broker will be in touch shortly.\n\nBest regards,\nWESAutoTransport Team`}
          onClose={() => setShowEmail(false)}
        />
      )}

      {/* Price dialog */}
      <AnimatePresence>
        {showPriceDlg && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowPriceDlg(false)}
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
                  <p className="text-blue-400 text-xs mt-0.5">Required before setting to <span className="text-orange-300 font-semibold">{pendingStatus}</span></p>
                </div>
              </div>
              <p className="text-blue-300 text-sm mb-4">Enter the price agreed with the customer. This is used for payment instructions.</p>
              <div className="relative mb-4">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 font-bold">$</span>
                <input
                  type="number" min="0" step="25" placeholder="e.g. 1250"
                  value={priceInput} onChange={(e) => setPriceInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePriceConfirm()}
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-blue-950/60 border border-blue-700/40 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowPriceDlg(false)} className="flex-1 py-2.5 rounded-xl border border-blue-700/40 text-blue-300 hover:bg-blue-900/40 text-sm transition-colors">Cancel</button>
                <button onClick={handlePriceConfirm} disabled={!priceInput || parseFloat(priceInput) <= 0 || saving} className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors disabled:opacity-40">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Confirm & Save"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 md:p-8 max-w-5xl">
        {/* Back */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-blue-400 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">{lead.name}</h1>
            <p className="text-blue-500 text-xs mt-1 font-mono">ID: {lead.id}</p>
            {lead.assigned_broker_email && (
              <p className="text-xs text-blue-500 mt-0.5 flex items-center gap-1">
                <UserCheck className="w-3 h-3" /> Handled by {lead.assigned_broker_email}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {isPaid && (
              <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/30">
                <CheckCircle2 className="w-3 h-3" /> Paid
              </span>
            )}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${LEAD_STATUS_COLORS[lead.status]}`}>
              {lead.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Customer info */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4"><div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center"><User className="w-4 h-4 text-blue-400" /></div><h2 className="text-white font-semibold">Customer Information</h2></div>
              <InfoRow label="Name"  value={lead.name}  />
              <InfoRow label="Email" value={lead.email} />
              <InfoRow label="Phone" value={lead.phone} />
            </motion.div>

            {/* Vehicle info */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4"><div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center"><Car className="w-4 h-4 text-orange-400" /></div><h2 className="text-white font-semibold">Vehicle Information</h2></div>
              <InfoRow label="Year"      value={String(lead.vehicle_year)} />
              <InfoRow label="Make"      value={lead.vehicle_make}         />
              <InfoRow label="Model"     value={lead.vehicle_model}        />
              <InfoRow label="Condition" value={lead.vehicle_condition ?? "—"} />
              <InfoRow label="Type"      value={lead.transport_type}       />
              {lead.finalized_price != null && (
                <div className="flex items-center gap-4 py-2">
                  <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider w-40">Finalized Price</span>
                  <span className="text-green-400 font-bold text-base">${lead.finalized_price.toLocaleString()}</span>
                </div>
              )}
            </motion.div>

            {/* Car photo */}
            {lead.car_image_url && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4"><div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-purple-400" /></div><h2 className="text-white font-semibold">Vehicle Photo</h2></div>
                <img src={lead.car_image_url} alt="Customer vehicle" className="w-full rounded-xl object-cover max-h-64 border border-blue-800/20" />
              </motion.div>
            )}

            {/* Route */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4"><div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center"><MapPin className="w-4 h-4 text-green-400" /></div><h2 className="text-white font-semibold">Route</h2></div>
              <InfoRow label="Pickup ZIP"   value={lead.origin_zip}      />
              <InfoRow label="Delivery ZIP" value={lead.destination_zip} />
            </motion.div>

            {/* Tracking link */}
            {trackingUrl && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }} className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3"><div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center"><Link2 className="w-4 h-4 text-purple-400" /></div><h2 className="text-white font-semibold">Customer Tracking Link</h2></div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-950/40 border border-blue-800/30 flex-wrap">
                  <span className="text-blue-200 text-xs font-mono break-all flex-1">{trackingUrl}</span>
                  <div className="flex gap-1 flex-shrink-0">
                    <CopyBtn text={trackingUrl} />
                    <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:text-orange-400 px-2 py-1 rounded-lg hover:bg-orange-500/10 transition-colors">
                      <ExternalLink className="w-3 h-3" /> Open
                    </a>
                  </div>
                </div>
                <p className="text-blue-700 text-xs mt-2">Share this link with the customer to track their shipment.</p>
              </motion.div>
            )}

            {/* Shipment details — editable */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4"><div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center"><Truck className="w-4 h-4 text-cyan-400" /></div><h2 className="text-white font-semibold">Shipment Details</h2></div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-blue-500 uppercase tracking-wider block mb-1.5">Carrier Name</label>
                    <div className="relative">
                      <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-500" />
                      <input value={carrierName} onChange={(e) => setCarrierName(e.target.value)} placeholder="e.g. FastLane Carriers LLC"
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-blue-950/40 border border-blue-800/40 text-white text-sm placeholder:text-blue-700 focus:outline-none focus:ring-2 focus:ring-orange-500/40" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-blue-500 uppercase tracking-wider block mb-1.5">Est. Delivery</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-500" />
                      <input value={estDelivery} onChange={(e) => setEstDelivery(e.target.value)} placeholder="e.g. June 3–5, 2025"
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-blue-950/40 border border-blue-800/40 text-white text-sm placeholder:text-blue-700 focus:outline-none focus:ring-2 focus:ring-orange-500/40" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-blue-500 uppercase tracking-wider block mb-1.5">Notes for Customer</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-3.5 h-3.5 text-blue-500" />
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Updates visible to customer on tracking page..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-blue-950/40 border border-blue-800/40 text-white text-sm placeholder:text-blue-700 focus:outline-none focus:ring-2 focus:ring-orange-500/40 resize-none" />
                  </div>
                </div>
                <Button onClick={handleCarrierUpdate} disabled={savingInfo} className="bg-blue-700 hover:bg-blue-600 text-white border-0 text-sm">
                  {savingInfo ? <><Loader2 className="mr-2 w-3.5 h-3.5 animate-spin" />Saving...</> : <><Save className="mr-2 w-3.5 h-3.5" />Save Shipment Info</>}
                </Button>
                {infoMsg && <p className={`text-xs ${infoMsg.startsWith("✓") ? "text-green-400" : "text-red-400"}`}>{infoMsg}</p>}
              </div>
            </motion.div>

            {/* Contact buttons */}
            {(canEdit || canClaim) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-4">Contact Customer</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <a href={`tel:${lead.phone}`} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
                    <Phone className="w-4 h-4" /> Call
                  </a>
                  <a href={`https://wa.me/${lead.phone.replace(/\D/g,"")}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                  <button onClick={() => setShowEmail(true)} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium transition-colors">
                    <Mail className="w-4 h-4" /> Email
                  </button>
                </div>
              </motion.div>
            )}

            {/* Submission info */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3"><div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center"><Clock className="w-4 h-4 text-purple-400" /></div><h2 className="text-white font-semibold">Submission Details</h2></div>
              <InfoRow label="Submitted" value={new Date(lead.created_at).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })} />
            </motion.div>
          </div>

          {/* ── Right column: actions ── */}
          <div className="space-y-4">

            {/* Claim */}
            {canClaim && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#0a1628] border border-orange-700/40 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-2">Claim This Lead</h2>
                <p className="text-blue-400 text-sm mb-4">Claiming assigns this lead to you, sets status to <strong className="text-yellow-400">Contacted</strong>, and auto-emails the customer.</p>
                <Button onClick={handleClaim} disabled={claiming} className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0">
                  {claiming ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" />Claiming...</> : <><UserCheck className="mr-2 w-4 h-4" />Claim Lead</>}
                </Button>
                {saveMsg && <p className="text-xs text-center mt-3 text-red-400">{saveMsg}</p>}
              </motion.div>
            )}

            {/* Status update */}
            {canEdit && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6">
                <h2 className="text-white font-semibold mb-4">Update Status</h2>
                <div className="space-y-1.5 mb-4">
                  {ALL_LEAD_STATUSES.map((status) => (
                    <button key={status} onClick={() => setNewStatus(status)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        newStatus === status ? LEAD_STATUS_COLORS[status] : "border-blue-800/30 text-blue-400 hover:border-blue-600/50 hover:text-blue-200"
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${LEAD_STATUS_DOT_COLORS[status]}`} />
                      {status}
                    </button>
                  ))}
                </div>
                {lead.finalized_price != null && (
                  <div className="mb-3 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
                    <span className="text-xs text-green-400 font-semibold uppercase tracking-wider">Agreed Price</span>
                    <div className="text-green-300 font-bold text-xl mt-0.5">${lead.finalized_price.toLocaleString()}</div>
                  </div>
                )}
                <Button onClick={handleStatusUpdate} disabled={saving || newStatus === lead.status} className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0 disabled:opacity-40">
                  {saving ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" />Saving...</> : <><Save className="mr-2 w-4 h-4" />Save Status</>}
                </Button>
                {saveMsg && <p className={`text-xs text-center mt-2 ${saveMsg.includes("✓") ? "text-green-400" : "text-red-400"}`}>{saveMsg}</p>}
              </motion.div>
            )}

            {/* Payment panel — visible in edit mode or view mode (so broker can still send) */}
            {(canEdit || ctx === "view") && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4 text-green-400" />
                  <h2 className="text-white font-semibold text-sm">Payment</h2>
                </div>
                {isPaid ? (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <p className="text-green-400 text-xs font-semibold">Payment confirmed — booking complete!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {!lead.finalized_price ? (
                      <p className="text-blue-600 text-xs">Set a finalized price via <strong className="text-blue-400">Quoted</strong> status first.</p>
                    ) : (
                      <p className="text-blue-400 text-xs">Amount: <strong className="text-orange-400">${lead.finalized_price.toFixed(2)}</strong></p>
                    )}
                    <Button onClick={handleSendPayment} disabled={sendingPay || !canPay} className="w-full bg-blue-700 hover:bg-blue-600 text-white border-0 text-sm disabled:opacity-40">
                      {sendingPay ? <><Loader2 className="mr-2 w-3.5 h-3.5 animate-spin" />Sending...</> : <><CreditCard className="mr-2 w-3.5 h-3.5" />Send Payment Instructions</>}
                    </Button>
                    <Button onClick={handleMarkPaid} disabled={markingPaid || !lead.finalized_price} className="w-full bg-green-700 hover:bg-green-600 text-white border-0 text-sm disabled:opacity-40">
                      {markingPaid ? <><Loader2 className="mr-2 w-3.5 h-3.5 animate-spin" />Confirming...</> : <><CheckCircle2 className="mr-2 w-3.5 h-3.5" />Mark as Paid</>}
                    </Button>
                    {payMsg && <p className={`text-xs text-center ${payMsg.startsWith("✓") ? "text-green-400" : "text-red-400"}`}>{payMsg}</p>}
                  </div>
                )}
              </motion.div>
            )}

            {/* Read-only notice */}
            {ctx === "view" && !canEdit && !canClaim && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 text-blue-400 mb-2"><Lock className="w-4 h-4" /><h2 className="text-white font-semibold text-sm">Read-Only View</h2></div>
                <p className="text-blue-500 text-xs">
                  {!lead.assigned_broker_id ? "Go to New Leads to claim this lead."
                    : lead.assigned_broker_id === currentUid ? "Open from your Dashboard to edit."
                    : "This lead is handled by another broker."}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
