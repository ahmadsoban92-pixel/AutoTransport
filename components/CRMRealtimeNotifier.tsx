"use client";

// CRM Real-Time Lead Notifier — Enhancement replacing Twilio SMS alerts
// Uses Supabase Realtime to subscribe to INSERT events on the leads table.
// Any broker logged into the CRM instantly sees a notification when a new lead arrives.
// No third-party cost — powered entirely by the existing Supabase subscription.

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Bell, X, Truck, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Lead } from "@/types/lead";

interface LiveNotification {
  id:       string;
  leadId:   string;
  vehicle:  string;
  route:    string;
  type:     string;
  time:     Date;
}

const NOTIFICATION_LIFETIME_MS = 12_000; // 12s — longer than marketing toasts

export function CRMRealtimeNotifier() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const channelRef = useRef<import("@supabase/supabase-js").RealtimeChannel | null>(null);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  useEffect(() => {
    // Get the direct client — the proxy wrapper doesn't bind .channel() correctly
    const client = getSupabaseClient();
    if (!client) return;

    // Subscribe to new lead inserts via Supabase Realtime
    const channel = client
      .channel("crm-lead-inserts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "leads" },
        (payload) => {
          const lead = payload.new as Lead;
          const notif: LiveNotification = {
            id:      crypto.randomUUID(),
            leadId:  lead.id,
            vehicle: `${lead.vehicle_year} ${lead.vehicle_make} ${lead.vehicle_model}`,
            route:   `${lead.origin_zip} → ${lead.destination_zip}`,
            type:    lead.transport_type,
            time:    new Date(),
          };

          setNotifications((prev) => [notif, ...prev.slice(0, 4)]); // max 5 at once
          setUnreadCount((c) => c + 1);

          // Auto-dismiss after lifetime
          setTimeout(() => dismiss(notif.id), NOTIFICATION_LIFETIME_MS);

          // Browser notification if tab is backgrounded
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification("New Lead — WESAutoTransport CRM", {
              body: `${notif.vehicle} · ${notif.route}`,
              icon: "/favicon.ico",
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("[CRMRealtimeNotifier] Subscribed to lead inserts ✓");
        } else if (status === "CHANNEL_ERROR") {
          console.warn("[CRMRealtimeNotifier] Channel error — ensure Realtime is enabled on the leads table in Supabase dashboard.");
        }
      });

    channelRef.current = channel;

    // Request browser notification permission (once, on mount)
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }

    return () => {
      channel.unsubscribe();
    };
  }, [dismiss]);

  const handleClick = (notif: LiveNotification) => {
    dismiss(notif.id);
    setUnreadCount(0);
    // Route to /crm/leads/[id] — the proper CRM page with sidebar + "Claim This Lead" button
    router.push(`/crm/leads/${notif.leadId}`);
  };

  if (notifications.length === 0) return null;

  return (
    // Fixed top-right — broker-facing, separate from customer marketing toasts (bottom-left)
    <div
      aria-live="assertive"
      aria-label="New lead notifications"
      className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm w-full"
    >
      <AnimatePresence mode="popLayout">
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            layout
            initial={{ opacity: 0, x: 60,  scale: 0.9 }}
            animate={{ opacity: 1, x: 0,   scale: 1   }}
            exit={  { opacity: 0, x: 60,   scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="pointer-events-auto w-full bg-[#0a1628]/98 backdrop-blur-md border border-orange-500/30
                       rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Orange accent bar */}
            <div className="h-0.5 bg-gradient-to-r from-orange-500 to-orange-400" />

            <div className="flex items-start gap-3 p-4">
              {/* Icon */}
              <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Truck className="w-4 h-4 text-orange-400" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">
                    🔴 New Lead
                  </span>
                  <span className="text-[10px] text-blue-600">
                    {notif.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-white text-sm font-semibold leading-tight truncate">{notif.vehicle}</p>
                <p className="text-blue-400 text-xs mt-0.5">{notif.route} · <span className="text-blue-500">{notif.type}</span></p>

                <button
                  onClick={() => handleClick(notif)}
                  className="mt-2 flex items-center gap-1 text-orange-400 hover:text-orange-300 text-xs font-semibold transition-colors"
                >
                  View Lead <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Dismiss */}
              <button
                onClick={() => dismiss(notif.id)}
                aria-label="Dismiss notification"
                className="p-1 rounded-lg text-blue-600 hover:text-white hover:bg-blue-800/40 transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Unread badge when multiple notifications */}
      {unreadCount > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-auto flex items-center justify-center gap-1.5 text-xs text-blue-300 py-1"
        >
          <Bell className="w-3 h-3" />
          {unreadCount} new leads
        </motion.div>
      )}
    </div>
  );
}
