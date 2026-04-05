"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Send, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EmailComposeProps {
  /** Recipient email address */
  to: string;
  /** Recipient display name */
  toName: string;
  /** Pre-filled subject line */
  defaultSubject: string;
  /** Pre-filled email body (plain text, \n for line breaks) */
  defaultBody: string;
  /** Called when the modal should close (cancel or after successful send) */
  onClose: () => void;
}

/**
 * Reusable email compose modal.
 * Used in:
 *   - app/(crm)/crm/leads/[id]/page.tsx  (send email to a lead)
 *   - app/(crm)/crm/inquiries/page.tsx   (reply to a contact inquiry)
 */
export function EmailComposeModal({
  to,
  toName,
  defaultSubject,
  defaultBody,
  onClose,
}: EmailComposeProps) {
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody]       = useState(defaultBody);
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    setError("");

    try {
      const htmlBody = body
        .split("\n")
        .map((l) => (l ? `<p style="margin:4px 0">${l}</p>` : "<br/>"))
        .join("");

      const res = await fetch("/api/send-email", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          toName,
          subject,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;">
            <h2 style="color:#f97316;margin-top:0;">WESAutoTransport</h2>
            ${htmlBody}
          </div>`,
          text: body,
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Failed to send email.");
      }

      setSent(true);
      setTimeout(onClose, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send email.");
    } finally {
      setSending(false);
    }
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
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          className="w-full max-w-2xl bg-[#0a1628] border border-blue-800/40 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-blue-800/30">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-orange-400" />
              <span className="text-white font-semibold">Compose Email</span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close email composer"
              className="text-blue-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {sent ? (
              <div className="flex flex-col items-center py-10 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-400 mb-3" />
                <p className="text-white font-semibold text-lg">Email sent!</p>
                <p className="text-blue-400 text-sm mt-1">Closing in a moment…</p>
              </div>
            ) : (
              <>
                {/* To (read-only) */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-blue-500 w-14 text-right shrink-0">To</span>
                  <div className="flex-1 px-3 py-2 rounded-lg bg-blue-950/40 border border-blue-800/30 text-blue-200 text-sm">
                    {toName} &lt;{to}&gt;
                  </div>
                </div>

                {/* Subject */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-blue-500 w-14 text-right shrink-0">Subject</span>
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

                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="border-blue-700 text-blue-300 hover:bg-blue-900/40"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSend}
                    disabled={sending || !subject.trim() || !body.trim()}
                    className="bg-orange-500 hover:bg-orange-600 text-white border-0 disabled:opacity-40"
                  >
                    {sending ? (
                      <><Loader2 className="mr-2 w-4 h-4 animate-spin" />Sending…</>
                    ) : (
                      <><Send className="mr-2 w-4 h-4" />Send Email</>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
