"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Phone, Mail, Clock, User, CheckCircle2,
  Trash2, X, Send, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "crm_dismissed_inquiries";

type InquiryStatus = "Unhandled" | "Picked Up" | "Solved";
const INQUIRY_STATUSES: InquiryStatus[] = ["Unhandled", "Picked Up", "Solved"];
const STATUS_STYLES: Record<InquiryStatus, string> = {
  Unhandled: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Picked Up": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Solved: "bg-green-500/20 text-green-400 border-green-500/30",
};

interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  created_at: string;
  status?: InquiryStatus;
}

// ─── Email Compose Modal (same pattern as lead detail page) ───────────────────
function EmailComposeModal({
  inquiry,
  onClose,
}: {
  inquiry: Inquiry;
  onClose: () => void;
}) {
  const [subject, setSubject] = useState("Following up on your WESAutoTransport inquiry");
  const [body, setBody] = useState(
    `Hi ${inquiry.name},\n\nThank you for reaching out to WESAutoTransport.\n\nWe received your inquiry and our team will be happy to assist you. Please let us know if you have any questions about our services.\n\nBest regards,\nWESAutoTransport Team`
  );
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const handleSend = async () => {
    if (!inquiry.email) return;
    setSending(true);
    setErr("");
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: inquiry.email,
          toName: inquiry.name,
          subject,
          html: body.replace(/\n/g, "<br/>"),
          text: body,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setSent(true);
      setTimeout(onClose, 1800);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to send email.");
    }
    setSending(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 16 }}
          className="bg-[#0a1628] border border-blue-800/40 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-semibold">Compose Email</h3>
              <p className="text-blue-400 text-xs mt-0.5">To: {inquiry.name} &lt;{inquiry.email}&gt;</p>
            </div>
            <button onClick={onClose} className="text-blue-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {sent ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-green-400 mb-3" />
              <p className="text-white font-medium">Email sent successfully!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-blue-400 uppercase tracking-wider mb-1 block">Subject</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-blue-950/50 border border-blue-800/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                />
              </div>
              <div>
                <label className="text-xs text-blue-400 uppercase tracking-wider mb-1 block">Message</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  className="w-full bg-blue-950/50 border border-blue-800/40 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 resize-none"
                />
              </div>
              {err && <p className="text-red-400 text-xs">{err}</p>}
              <div className="flex justify-end gap-3 pt-1">
                <Button variant="ghost" onClick={onClose} className="text-blue-400 hover:text-white">
                  Cancel
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={sending || !subject || !body}
                  className="bg-orange-500 hover:bg-orange-600 text-white border-0 disabled:opacity-40"
                >
                  {sending ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" />Sending...</> : <><Send className="mr-2 w-4 h-4" />Send Email</>}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "All">("All");
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [errorMsg, setErrorMsg] = useState("");
  const [composing, setComposing] = useState<Inquiry | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Load dismissed IDs from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setDismissed(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  const dismissInquiry = (id: string) => {
    setDismissed((prev) => {
      const next = new Set([...prev, id]);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const restoreAll = () => {
    setDismissed(new Set());
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  useEffect(() => {
    fetch("/api/contact")
      .then((r) => r.json())
      .then(({ inquiries: data, error }) => {
        if (error) setErrorMsg(error);
        else if (data) setInquiries(data as Inquiry[]);
        setLoading(false);
      })
      .catch(() => {
        setErrorMsg("Failed to load inquiries.");
        setLoading(false);
      });
  }, []);

  const cycleStatus = async (inq: Inquiry) => {
    const current: InquiryStatus = inq.status ?? "Unhandled";
    const next = INQUIRY_STATUSES[(INQUIRY_STATUSES.indexOf(current) + 1) % INQUIRY_STATUSES.length];
    setUpdatingStatus(inq.id);
    try {
      const res = await fetch(`/api/contact/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: inq.id, status: next }),
      });
      if (res.ok) {
        setInquiries((prev) => prev.map((i) => i.id === inq.id ? { ...i, status: next } : i));
      }
    } catch {}
    setUpdatingStatus(null);
  };

  // Normalize phone for WA
  const normalizePhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("92")) return digits;
    if (digits.startsWith("0")) return "92" + digits.slice(1);
    return digits;
  };

  const waMsg = (inq: Inquiry) =>
    `https://wa.me/${normalizePhone(inq.phone)}?text=${encodeURIComponent(
      `Hi ${inq.name}, thank you for contacting WESAutoTransport! How can we help you today?`
    )}`;

  const filtered = inquiries.filter((inq) => {
    const q = search.toLowerCase();
    const matchesSearch = (
      inq.name.toLowerCase().includes(q) ||
      inq.phone.includes(q) ||
      (inq.email ?? "").toLowerCase().includes(q) ||
      inq.message.toLowerCase().includes(q)
    );
    const matchesStatus = statusFilter === "All" || (inq.status ?? "Unhandled") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const visible = filtered.filter((inq) => !dismissed.has(inq.id));
  const dismissedCount = filtered.filter((inq) => dismissed.has(inq.id)).length;

  return (
    <div className="p-6 md:p-8">
      {/* Email compose modal */}
      {composing && (
        <EmailComposeModal inquiry={composing} onClose={() => setComposing(null)} />
      )}

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-orange-400" />
            Contact Inquiries
          </h1>
          <p className="text-blue-400 text-sm mt-1">Messages submitted through the Contact page</p>
        </div>
        {dismissedCount > 0 && (
          <button
            onClick={restoreAll}
            className="text-xs text-blue-500 hover:text-blue-300 underline underline-offset-2 transition-colors"
          >
            Restore {dismissedCount} dismissed
          </button>
        )}
      </div>

      {/* Search + Status filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, email, or message..."
          className="flex-1 px-4 py-2.5 rounded-lg bg-blue-950/40 border border-blue-800/40 text-white text-sm placeholder:text-blue-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as InquiryStatus | "All")}
          className="rounded-lg bg-blue-950/40 border border-blue-800/40 text-sm text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
        >
          <option value="All" className="bg-blue-950">All Statuses</option>
          {INQUIRY_STATUSES.map((s) => (
            <option key={s} value={s} className="bg-blue-950">{s}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-2xl bg-blue-900/20 animate-pulse" />)}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-900/20 border border-red-800/40 text-red-400 text-sm mb-6">{errorMsg}</div>
      )}

      {!loading && !errorMsg && visible.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <CheckCircle2 className="w-12 h-12 text-blue-800 mb-4" />
          <h2 className="text-white font-semibold">No inquiries found</h2>
          <p className="text-blue-400 text-sm mt-2">
            {search ? "Try a different search term." : dismissedCount > 0 ? "All inquiries dismissed." : "No contact form submissions yet."}
          </p>
        </div>
      )}

      {!loading && visible.length > 0 && (
        <div className="space-y-4">
          {visible.map((inq, i) => (
            <motion.div
              key={inq.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.04 }}
              className="p-6 rounded-2xl border border-blue-800/30 bg-[#0a1628] hover:border-orange-500/20 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                      <span className="text-white font-semibold">{inq.name}</span>
                      <div className="flex items-center gap-1 text-xs text-blue-500 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(inq.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                      </div>
                    </div>
                    {/* Status badge — click to cycle */}
                    <button
                      onClick={() => cycleStatus(inq)}
                      disabled={updatingStatus === inq.id}
                      className={`ml-auto text-xs px-3 py-1 rounded-full border font-semibold transition-all hover:opacity-80 ${STATUS_STYLES[inq.status ?? "Unhandled"]} ${updatingStatus === inq.id ? "opacity-50" : ""}`}
                      title="Click to change status"
                    >
                      {updatingStatus === inq.id ? "..." : (inq.status ?? "Unhandled")}
                    </button>
                  </div>
                  <p className="text-blue-200 text-sm leading-relaxed mb-4 pl-12">{inq.message}</p>
                  <div className="flex flex-wrap gap-3 pl-12">
                    <a href={`tel:${inq.phone}`} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/40 transition-colors">
                      <Phone className="w-3 h-3" /> {inq.phone}
                    </a>
                    {inq.email && (
                      <button
                        onClick={() => setComposing(inq)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-colors"
                      >
                        <Mail className="w-3 h-3" /> {inq.email}
                      </button>
                    )}
                    <a href={waMsg(inq)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors">
                      <MessageCircle className="w-3 h-3" /> WhatsApp
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => dismissInquiry(inq.id)}
                  title="Dismiss inquiry"
                  className="flex items-center gap-1 text-xs text-blue-700 hover:text-red-400 transition-colors shrink-0 mt-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Dismiss
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && (
        <div className="mt-4 text-xs text-blue-700 text-right">
          {visible.length} of {inquiries.length} inquiries shown
          {dismissedCount > 0 && ` · ${dismissedCount} dismissed`}
        </div>
      )}
    </div>
  );
}
