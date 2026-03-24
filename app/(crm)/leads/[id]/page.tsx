"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Lead, LeadStatus } from "@/types/lead";
import { motion } from "framer-motion";
import { ArrowLeft, User, Car, MapPin, Clock, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ALL_STATUSES: LeadStatus[] = ["New", "Contacted", "Quoted", "Booked", "Lost"];

const STATUS_COLORS: Record<LeadStatus, string> = {
  New: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Contacted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Quoted: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Booked: "bg-green-500/20 text-green-400 border-green-500/30",
  Lost: "bg-red-500/20 text-red-400 border-red-500/30",
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2 border-b border-blue-900/20">
      <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider w-40 flex-shrink-0">
        {label}
      </span>
      <span className="text-blue-100 text-sm">{value}</span>
    </div>
  );
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<LeadStatus>("New");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    async function fetchLead() {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) {
        setLead(data as Lead);
        setNewStatus(data.status as LeadStatus);
      }
      setLoading(false);
    }
    fetchLead();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!lead || newStatus === lead.status) return;
    setSaving(true);
    const { error } = await supabase
      .from("leads")
      .update({ status: newStatus })
      .eq("id", id);
    if (!error) {
      setLead((prev) => prev ? { ...prev, status: newStatus } : prev);
      setSaveMessage("✓ Status updated successfully");
      setTimeout(() => setSaveMessage(""), 3000);
    } else {
      setSaveMessage("✗ Failed to update status");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-blue-400">Loading lead...</div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-400">Lead not found.</div>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mt-4 border-blue-700 text-blue-300"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      {/* Header */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-blue-400 hover:text-white text-sm mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Leads
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{lead.name}</h1>
          <p className="text-blue-400 text-sm mt-1">Lead ID: {lead.id}</p>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${STATUS_COLORS[lead.status]}`}>
          {lead.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-400" />
              </div>
              <h2 className="text-white font-semibold">Customer Information</h2>
            </div>
            <div className="space-y-1">
              <InfoRow label="Name" value={lead.name} />
              <InfoRow label="Email" value={lead.email} />
              <InfoRow label="Phone" value={lead.phone} />
            </div>
          </motion.div>

          {/* Vehicle Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Car className="w-4 h-4 text-orange-400" />
              </div>
              <h2 className="text-white font-semibold">Vehicle Information</h2>
            </div>
            <div className="space-y-1">
              <InfoRow label="Year" value={String(lead.vehicle_year)} />
              <InfoRow label="Make" value={lead.vehicle_make} />
              <InfoRow label="Model" value={lead.vehicle_model} />
              <InfoRow label="Condition" value={lead.vehicle_condition ?? ""} />
              <InfoRow label="Transport Type" value={lead.transport_type} />
            </div>
          </motion.div>

          {/* Route Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-green-400" />
              </div>
              <h2 className="text-white font-semibold">Route Information</h2>
            </div>
            <div className="space-y-1">
              <InfoRow label="Pickup ZIP" value={lead.origin_zip} />
              <InfoRow label="Delivery ZIP" value={lead.destination_zip} />
            </div>
          </motion.div>

          {/* Submission Time */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Clock className="w-4 h-4 text-purple-400" />
              </div>
              <h2 className="text-white font-semibold">Submission Details</h2>
            </div>
            <div className="space-y-1">
              <InfoRow
                label="Submitted"
                value={new Date(lead.created_at).toLocaleString("en-US", {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              />
            </div>
          </motion.div>
        </div>

        {/* Status Update Panel */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6 sticky top-8"
          >
            <h2 className="text-white font-semibold mb-4">Update Lead Status</h2>
            <div className="space-y-2 mb-4">
              {ALL_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => setNewStatus(status)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    newStatus === status
                      ? STATUS_COLORS[status] + " border-opacity-100"
                      : "border-blue-800/30 text-blue-400 hover:border-blue-600/50 hover:text-blue-200"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      status === "New" ? "bg-orange-400" :
                      status === "Contacted" ? "bg-yellow-400" :
                      status === "Quoted" ? "bg-purple-400" :
                      status === "Booked" ? "bg-green-400" : "bg-red-400"
                    }`}
                  />
                  {status}
                </button>
              ))}
            </div>

            <Button
              onClick={handleStatusUpdate}
              disabled={saving || newStatus === lead.status}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0 disabled:opacity-40"
            >
              {saving ? (
                <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="mr-2 w-4 h-4" /> Save Status</>
              )}
            </Button>

            {saveMessage && (
              <p className={`text-xs text-center mt-3 ${saveMessage.includes("✓") ? "text-green-400" : "text-red-400"}`}>
                {saveMessage}
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
