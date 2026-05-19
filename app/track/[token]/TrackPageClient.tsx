"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ShipmentTimeline } from "@/components/ShipmentTimeline";
import { Truck, MapPin, Calendar, User, CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import type { ShipmentTrackingData } from "@/types/lead";

interface Props {
  token:         string;
  paymentResult?: string;
}

function PaymentBanner({ result }: { result: string }) {
  const isSuccess = result === "success";
  return (
    <motion.div
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      className={`flex items-center gap-3 px-5 py-4 rounded-2xl border mb-6 ${
        isSuccess
          ? "bg-green-500/10 border-green-500/30 text-green-400"
          : "bg-red-500/10  border-red-500/30  text-red-400"
      }`}
      role="alert"
    >
      {isSuccess ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <XCircle className="w-5 h-5 flex-shrink-0" />}
      <p className="text-sm font-medium">
        {isSuccess
          ? "Payment successful! Your booking is confirmed. We'll be in touch shortly."
          : "Payment was cancelled. You can retry using the link in your email."}
      </p>
    </motion.div>
  );
}

function InfoCard({ icon: Icon, label, value, accent = "blue" }: {
  icon: React.ElementType; label: string; value: string; accent?: "blue" | "orange" | "green";
}) {
  const colors = {
    blue:   "bg-blue-500/10  text-blue-400",
    orange: "bg-orange-500/10 text-orange-400",
    green:  "bg-green-500/10  text-green-400",
  };
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-950/30 border border-blue-800/30">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[accent]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs text-blue-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-white text-sm font-semibold mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function TrackPageClient({ token, paymentResult }: Props) {
  const [data,    setData]    = useState<ShipmentTrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    async function fetchTracking() {
      try {
        const res = await fetch(`/api/track/${token}`);
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || "Shipment not found");
        }
        setData(await res.json());
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load tracking data");
      } finally {
        setLoading(false);
      }
    }
    fetchTracking();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#060d1f] text-white">
      {/* ── Navbar strip ── */}
      <header className="border-b border-blue-900/30 bg-[#0a1628]/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-blue-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            WESAutoTransport
          </Link>
          <span className="text-xs text-blue-600 font-mono">Track #{token.slice(0, 8).toUpperCase()}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Page heading */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Truck className="w-5 h-5 text-orange-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Shipment Tracker</h1>
          </div>
          <p className="text-blue-400 text-sm">Live status updates for your vehicle transport</p>
        </motion.div>

        {/* Payment result banner */}
        <AnimatePresence>
          {paymentResult && <PaymentBanner result={paymentResult} />}
        </AnimatePresence>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 rounded-2xl bg-red-900/20 border border-red-800/40 text-center"
          >
            <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-300 font-semibold">{error}</p>
            <p className="text-red-400/60 text-sm mt-2">
              Double-check your tracking link or contact us for help.
            </p>
          </motion.div>
        )}

        {/* Data */}
        {!loading && data && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Timeline — takes up 3 cols */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3 bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6"
            >
              <h2 className="text-white font-semibold mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                Shipment Progress
              </h2>
              <ShipmentTimeline status={data.status} />
            </motion.div>

            {/* Details — 2 cols */}
            <div className="lg:col-span-2 space-y-4">
              {/* Vehicle card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6"
              >
                <h2 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Vehicle</h2>
                <p className="text-blue-100 text-lg font-bold">
                  {data.vehicle_year} {data.vehicle_make} {data.vehicle_model}
                </p>
              </motion.div>

              {/* Info cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <InfoCard
                  icon={MapPin}
                  label="Pickup ZIP"
                  value={data.origin_zip}
                  accent="blue"
                />
                <InfoCard
                  icon={MapPin}
                  label="Delivery ZIP"
                  value={data.destination_zip}
                  accent="orange"
                />
                {data.carrier_name && (
                  <InfoCard
                    icon={User}
                    label="Assigned Carrier"
                    value={data.carrier_name}
                    accent="green"
                  />
                )}
                {data.estimated_delivery && (
                  <InfoCard
                    icon={Calendar}
                    label="Est. Delivery"
                    value={data.estimated_delivery}
                    accent="orange"
                  />
                )}
              </motion.div>

              {/* Notes */}
              {data.shipment_notes && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-5"
                >
                  <h2 className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    Notes from your broker
                  </h2>
                  <p className="text-blue-200 text-sm leading-relaxed">{data.shipment_notes}</p>
                </motion.div>
              )}

              {/* Order date */}
              <p className="text-blue-700 text-xs text-center">
                Order placed{" "}
                {new Date(data.created_at).toLocaleDateString("en-US", {
                  dateStyle: "long",
                })}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
