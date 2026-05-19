"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, X } from "lucide-react";
import { useTheme } from "next-themes";

interface ActivityItem {
  vehicle:    string;
  state:      string;
  created_at: string;
}

interface Toast {
  id:      string;
  message: string;
}

// Time (ms) between each toast appearance — randomised within range
const MIN_DELAY_MS         = 4_000;
const MAX_DELAY_MS         = 10_000;
const TOAST_LIFETIME_MS    = 6_000;
const FIRST_TOAST_DELAY_MS = 3_000;

function randomDelay() {
  return MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
}

function buildMessage(item: ActivityItem): string {
  return `Someone in ${item.state} just requested a quote for a ${item.vehicle}`;
}

export function ActivityToastManager() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  const [toasts,  setToasts]  = useState<Toast[]>([]);
  const queueRef  = useRef<ActivityItem[]>([]);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idxRef    = useRef(0);

  const showNext = useCallback(() => {
    const queue = queueRef.current;
    if (!queue.length) return;

    const item    = queue[idxRef.current % queue.length];
    idxRef.current += 1;

    const id      = crypto.randomUUID();
    const message = buildMessage(item);

    setToasts((prev) => [...prev, { id, message }]);

    // Auto-dismiss
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_LIFETIME_MS);

    // Schedule next
    timerRef.current = setTimeout(showNext, randomDelay());
  }, []);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let cancelled = false;

    fetch("/api/recent-activity")
      .then((r) => r.json())
      .then(({ activity }: { activity: ActivityItem[] }) => {
        if (cancelled || !activity?.length) return;
        queueRef.current = [...activity].sort(() => Math.random() - 0.5);
        timerRef.current = setTimeout(showNext, FIRST_TOAST_DELAY_MS);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [showNext]);

  const dismiss = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  // ── Theme-aware styles ──────────────────────────────────────────────────────
  const card  = isDark
    ? "bg-[#0f2347]/95 backdrop-blur-md border border-blue-700/40 shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
    : "bg-white/95     backdrop-blur-md border border-orange-200   shadow-[0_8px_32px_rgba(0,0,0,0.12)]";

  const iconBg = isDark ? "bg-orange-500/20" : "bg-orange-500/10";
  const label  = isDark ? "text-orange-400"  : "text-orange-600";
  const body   = isDark ? "text-white"        : "text-gray-800";
  const dismiss_btn = isDark
    ? "text-blue-500 hover:text-white hover:bg-blue-800/40"
    : "text-gray-400 hover:text-gray-700 hover:bg-gray-100";

  return (
    <div
      aria-live="polite"
      aria-label="Recent activity notifications"
      className="fixed bottom-5 left-5 z-50 flex flex-col gap-3 pointer-events-none max-w-[calc(100vw-2.5rem)]"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 32, scale: 0.9  }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 16, scale: 0.92  }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className={`pointer-events-auto flex items-start gap-3 pl-4 pr-3 py-3 rounded-2xl max-w-sm ${card}`}
            role="status"
          >
            {/* Icon */}
            <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <TrendingUp className={`w-4 h-4 ${label}`} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className={`text-[11px] font-semibold ${label} uppercase tracking-wider leading-none mb-1`}>
                Live Activity
              </p>
              <p className={`${body} text-sm leading-snug`}>{toast.message}</p>
            </div>

            {/* Dismiss */}
            <button
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className={`flex-shrink-0 p-1 rounded-lg transition-colors mt-0.5 ${dismiss_btn}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
