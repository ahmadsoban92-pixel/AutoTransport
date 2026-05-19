"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Lead, LeadStatus } from "@/types/lead";
import { motion } from "framer-motion";
import {
  ArrowLeft, User, Car, MapPin, Clock, Save, Loader2,
  CreditCard, Link2, Copy, Check, Truck, Calendar, MessageSquare,
  ExternalLink, CheckCircle2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_STATUSES: LeadStatus[] = ["New", "Contacted", "Quoted", "Booked", "Dispatched", "In Transit", "Delivered", "Lost"];

const STATUS_COLORS: Record<LeadStatus, string> = {
  New:          "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Contacted:    "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Quoted:       "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Booked:       "bg-green-500/20  text-green-400  border-green-500/30",
  Dispatched:   "bg-cyan-500/20   text-cyan-400   border-cyan-500/30",
  "In Transit": "bg-blue-500/20   text-blue-300   border-blue-500/30",
  Delivered:    "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Lost:         "bg-red-500/20    text-red-400    border-red-500/30",
};

const STATUS_DOTS: Record<LeadStatus, string> = {
  New:          "bg-orange-400",
  Contacted:    "bg-yellow-400",
  Quoted:       "bg-purple-400",
  Booked:       "bg-green-400",
  Dispatched:   "bg-cyan-400",
  "In Transit": "bg-blue-400",
  Delivered:    "bg-emerald-400",
  Lost:         "bg-red-400",
};

// Statuses that require a finalized price before saving
const PRICE_REQUIRED_STATUSES = new Set<LeadStatus>(["Quoted", "Booked", "Dispatched", "In Transit", "Delivered", "Lost"]);

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2.5 border-b border-blue-900/20 last:border-0">
      <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider w-40 flex-shrink-0">{label}</span>
      <span className="text-blue-100 text-sm">{value}</span>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  iconBg = "bg-blue-500/20",
  iconColor = "text-blue-400",
  delay = 0,
  children,
}: {
  icon: React.ElementType;
  title: string;
  iconBg?: string;
  iconColor?: string;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <h2 className="text-white font-semibold">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      aria-label={`Copy ${label}`}
      className="flex items-center gap-1 text-xs text-blue-400 hover:text-orange-400 transition-colors px-2 py-1 rounded-lg hover:bg-orange-500/10"
    >
      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LeadDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();

  const [lead,        setLead]        = useState<Lead | null>(null);
  const [loading,     setLoading]     = useState(true);

  // Status panel state
  const [newStatus,   setNewStatus]   = useState<LeadStatus>("New");
  const [price,       setPrice]       = useState<string>("");
  const [saving,      setSaving]      = useState(false);
  const [saveMsg,     setSaveMsg]     = useState("");

  // Carrier / delivery fields
  const [carrierName, setCarrierName] = useState("");
  const [estDelivery, setEstDelivery] = useState("");
  const [notes,       setNotes]       = useState("");
  const [savingInfo,  setSavingInfo]  = useState(false);
  const [infoMsg,     setInfoMsg]     = useState("");

  // Manual payment
  const [sendingPayment, setSendingPayment] = useState(false);
  const [paymentMsg,     setPaymentMsg]     = useState("");
  const [markingPaid,    setMarkingPaid]    = useState(false);

  // ── Fetch lead ───────────────────────────────────────────────────────────
  const fetchLead = useCallback(async () => {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();
    if (!error && data) {
      const l = data as Lead;
      setLead(l);
      setNewStatus(l.status);
      setPrice(l.finalized_price != null ? String(l.finalized_price) : "");
      setCarrierName(l.carrier_name  ?? "");
      setEstDelivery(l.estimated_delivery ?? "");
      setNotes(l.shipment_notes ?? "");
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchLead(); }, [fetchLead]);

  // ── Status + price update ────────────────────────────────────────────────
  const handleStatusUpdate = async () => {
    if (!lead) return;

    const needsPrice = PRICE_REQUIRED_STATUSES.has(newStatus);
    const parsedPrice = parseFloat(price);

    if (needsPrice && (!price || isNaN(parsedPrice) || parsedPrice <= 0)) {
      setSaveMsg("⚠ Please enter a valid finalized price before saving this status.");
      return;
    }

    setSaving(true);
    setSaveMsg("");

    const updates: Partial<Lead> = { status: newStatus };
    if (needsPrice) updates.finalized_price = parsedPrice;

    const { error } = await supabase.from("leads").update(updates).eq("id", id);

    if (!error) {
      setLead((prev) => prev ? { ...prev, ...updates } : prev);
      setSaveMsg("✓ Lead updated successfully");
    } else {
      setSaveMsg("✗ Failed to update lead");
    }

    setSaving(false);
    setTimeout(() => setSaveMsg(""), 4000);
  };

  // ── Carrier / notes update ───────────────────────────────────────────────
  const handleCarrierUpdate = async () => {
    if (!lead) return;
    setSavingInfo(true);
    setInfoMsg("");

    const updates = {
      carrier_name:       carrierName || null,
      estimated_delivery: estDelivery || null,
      shipment_notes:     notes       || null,
    };

    const { error } = await supabase.from("leads").update(updates).eq("id", id);

    if (!error) {
      setLead((prev) => prev ? { ...prev, ...updates } : prev);
      setInfoMsg("✓ Shipment info saved");
    } else {
      setInfoMsg("✗ Failed to save");
    }

    setSavingInfo(false);
    setTimeout(() => setInfoMsg(""), 4000);
  };

  // ── Send manual payment instructions ─────────────────────────────────────
  const handleSendPaymentInstructions = async () => {
    if (!lead) return;
    setSendingPayment(true);
    setPaymentMsg("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch("/api/stripe/create-checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ leadId: lead.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to send instructions");
      setPaymentMsg("✓ Payment instructions sent to customer's email!");
    } catch (err: unknown) {
      setPaymentMsg(`✗ ${err instanceof Error ? err.message : "Error"}`);
    }
    setSendingPayment(false);
    setTimeout(() => setPaymentMsg(""), 6000);
  };

  // ── Mark as Paid (broker verifies manually) ────────────────────────────────
  const handleMarkAsPaid = async () => {
    if (!lead) return;
    setMarkingPaid(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(`/api/leads/${lead.id}/mark-paid`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      setLead((prev) => prev ? { ...prev, status: "Booked", stripe_payment_status: "paid" } : prev);
      setNewStatus("Booked");
      setPaymentMsg("✓ Marked as paid — lead set to Booked!");
    } catch {
      setPaymentMsg("✗ Failed to mark as paid");
    }
    setMarkingPaid(false);
    setTimeout(() => setPaymentMsg(""), 5000);
  };

  // ── Loading / error states ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-400">Lead not found.</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4 border-blue-700 text-blue-300">
          Go Back
        </Button>
      </div>
    );
  }

  const appUrl      = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const trackingUrl = lead.tracking_token ? `${appUrl}/track/${lead.tracking_token}` : null;
  const canSendPayment = !!(
    lead.finalized_price &&
    lead.finalized_price > 0 &&
    (lead.status === "Quoted" || lead.status === "Booked") &&
    lead.stripe_payment_status !== "paid"
  );
  const needsPriceField = PRICE_REQUIRED_STATUSES.has(newStatus);

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-blue-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Leads
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{lead.name}</h1>
          <p className="text-blue-500 text-xs mt-1 font-mono">ID: {lead.id}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {lead.stripe_payment_status === "paid" && (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/30">
              <CheckCircle2 className="w-3 h-3" /> Deposit Paid
            </span>
          )}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${STATUS_COLORS[lead.status]}`}>
            {lead.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Lead info ──────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Customer Info */}
          <SectionCard icon={User} title="Customer Information" iconBg="bg-blue-500/20" iconColor="text-blue-400" delay={0}>
            <div className="space-y-0.5">
              <InfoRow label="Name"  value={lead.name}  />
              <InfoRow label="Email" value={lead.email} />
              <InfoRow label="Phone" value={lead.phone} />
            </div>
          </SectionCard>

          {/* Vehicle Info */}
          <SectionCard icon={Car} title="Vehicle Information" iconBg="bg-orange-500/20" iconColor="text-orange-400" delay={0.05}>
            <div className="space-y-0.5">
              <InfoRow label="Year"           value={String(lead.vehicle_year)}    />
              <InfoRow label="Make"           value={lead.vehicle_make}            />
              <InfoRow label="Model"          value={lead.vehicle_model}           />
              <InfoRow label="Condition"      value={lead.vehicle_condition ?? "—"} />
              <InfoRow label="Transport Type" value={lead.transport_type}          />
              {lead.finalized_price != null && (
                <InfoRow label="Finalized Price" value={`$${lead.finalized_price.toFixed(2)}`} />
              )}
            </div>
          </SectionCard>

          {/* Route Info */}
          <SectionCard icon={MapPin} title="Route Information" iconBg="bg-green-500/20" iconColor="text-green-400" delay={0.1}>
            <div className="space-y-0.5">
              <InfoRow label="Pickup ZIP"   value={lead.origin_zip}      />
              <InfoRow label="Delivery ZIP" value={lead.destination_zip} />
            </div>
          </SectionCard>

          {/* Tracking Link */}
          {trackingUrl && (
            <SectionCard icon={Link2} title="Customer Tracking Link" iconBg="bg-purple-500/20" iconColor="text-purple-400" delay={0.15}>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-950/40 border border-blue-800/30 flex-wrap">
                <span className="text-blue-200 text-xs font-mono break-all flex-1">{trackingUrl}</span>
                <div className="flex gap-2 flex-shrink-0">
                  <CopyButton text={trackingUrl} label="tracking link" />
                  <a
                    href={trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open tracking page"
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-orange-400 transition-colors px-2 py-1 rounded-lg hover:bg-orange-500/10"
                  >
                    <ExternalLink className="w-3 h-3" /> Open
                  </a>
                </div>
              </div>
              <p className="text-blue-600 text-xs mt-2">Send this link to the customer so they can track their shipment status.</p>
            </SectionCard>
          )}

          {/* Carrier & Shipment Info */}
          <SectionCard icon={Truck} title="Shipment Details" iconBg="bg-cyan-500/20" iconColor="text-cyan-400" delay={0.2}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-blue-500 uppercase tracking-wider block mb-1.5">
                    Carrier Name
                  </label>
                  <div className="relative">
                    <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-500" />
                    <input
                      value={carrierName}
                      onChange={(e) => setCarrierName(e.target.value)}
                      placeholder="e.g. FastLane Carriers LLC"
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-blue-950/40 border border-blue-800/40 text-white text-sm placeholder:text-blue-700 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-blue-500 uppercase tracking-wider block mb-1.5">
                    Est. Delivery
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-500" />
                    <input
                      value={estDelivery}
                      onChange={(e) => setEstDelivery(e.target.value)}
                      placeholder="e.g. June 3–5, 2025"
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-blue-950/40 border border-blue-800/40 text-white text-sm placeholder:text-blue-700 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-blue-500 uppercase tracking-wider block mb-1.5">
                  Notes for Customer
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-3.5 h-3.5 text-blue-500" />
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any updates visible to the customer on their tracking page..."
                    rows={3}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-blue-950/40 border border-blue-800/40 text-white text-sm placeholder:text-blue-700 focus:outline-none focus:ring-2 focus:ring-orange-500/40 resize-none"
                  />
                </div>
              </div>

              <Button
                onClick={handleCarrierUpdate}
                disabled={savingInfo}
                className="bg-blue-700 hover:bg-blue-600 text-white border-0 text-sm"
              >
                {savingInfo ? <><Loader2 className="mr-2 w-3.5 h-3.5 animate-spin" />Saving...</> : <><Save className="mr-2 w-3.5 h-3.5" />Save Shipment Info</>}
              </Button>

              {infoMsg && (
                <p className={`text-xs ${infoMsg.startsWith("✓") ? "text-green-400" : "text-red-400"}`}>{infoMsg}</p>
              )}
            </div>
          </SectionCard>

          {/* Submission time */}
          <SectionCard icon={Clock} title="Submission Details" iconBg="bg-purple-500/20" iconColor="text-purple-400" delay={0.25}>
            <InfoRow
              label="Submitted"
              value={new Date(lead.created_at).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}
            />
            {lead.assigned_broker_email && (
              <InfoRow label="Assigned Broker" value={lead.assigned_broker_email} />
            )}
          </SectionCard>
        </div>

        {/* ── Right: Actions panel ─────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Status update */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6 sticky top-8"
          >
            <h2 className="text-white font-semibold mb-4">Update Status</h2>

            <div className="space-y-2 mb-4">
              {ALL_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => setNewStatus(status)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    newStatus === status
                      ? STATUS_COLORS[status]
                      : "border-blue-800/30 text-blue-400 hover:border-blue-600/50 hover:text-blue-200"
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOTS[status]}`} />
                  {status}
                </button>
              ))}
            </div>

            {/* Finalized Price — shown for Quoted, Booked, Lost */}
            {needsPriceField && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <label className="text-xs font-semibold text-blue-500 uppercase tracking-wider block mb-1.5">
                  Finalized Price <span className="text-orange-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 font-semibold text-sm">$</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 850.00"
                    className="w-full pl-7 pr-4 py-2.5 rounded-lg bg-blue-950/40 border border-blue-800/40 text-white text-sm placeholder:text-blue-700 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                  />
                </div>
                <p className="text-blue-700 text-[11px] mt-1">
                  This amount will be used for the Stripe deposit.
                </p>
              </motion.div>
            )}

            <Button
              onClick={handleStatusUpdate}
              disabled={saving || newStatus === lead.status}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0 disabled:opacity-40"
            >
              {saving ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" />Saving...</> : <><Save className="mr-2 w-4 h-4" />Save Status</>}
            </Button>

            {saveMsg && (
              <p className={`text-xs text-center mt-3 flex items-center justify-center gap-1 ${saveMsg.startsWith("✓") ? "text-green-400" : "text-amber-400"}`}>
                {saveMsg.startsWith("⚠") && <AlertCircle className="w-3 h-3 flex-shrink-0" />}
                {saveMsg}
              </p>
            )}
          </motion.div>

          {/* Stripe Payment Link */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-green-400" />
              <h2 className="text-white font-semibold text-sm">Payment</h2>
            </div>

            {lead.stripe_payment_status === "paid" ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                <p className="text-green-400 text-xs font-semibold">Payment confirmed — booking is set to Booked!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {!lead.finalized_price ? (
                  <p className="text-blue-600 text-xs">
                    Set a finalized price and save as <strong className="text-blue-400">Quoted</strong> first.
                  </p>
                ) : (
                  <p className="text-blue-400 text-xs">
                    Amount: <strong className="text-orange-400">${lead.finalized_price.toFixed(2)}</strong>
                  </p>
                )}

                <Button
                  onClick={handleSendPaymentInstructions}
                  disabled={sendingPayment || !canSendPayment}
                  className="w-full bg-blue-700 hover:bg-blue-600 text-white border-0 text-sm disabled:opacity-40"
                >
                  {sendingPayment
                    ? <><Loader2 className="mr-2 w-3.5 h-3.5 animate-spin" />Sending...</>
                    : <><CreditCard className="mr-2 w-3.5 h-3.5" />Send Payment Instructions</>}
                </Button>

                <Button
                  onClick={handleMarkAsPaid}
                  disabled={markingPaid || !lead.finalized_price || (lead.stripe_payment_status as string) === "paid"}
                  className="w-full bg-green-700 hover:bg-green-600 text-white border-0 text-sm disabled:opacity-40"
                >
                  {markingPaid
                    ? <><Loader2 className="mr-2 w-3.5 h-3.5 animate-spin" />Confirming...</>
                    : <><CheckCircle2 className="mr-2 w-3.5 h-3.5" />Mark as Paid</>}
                </Button>

                {paymentMsg && (
                  <p className={`text-xs text-center ${paymentMsg.startsWith("✓") ? "text-green-400" : "text-red-400"}`}>
                    {paymentMsg}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
