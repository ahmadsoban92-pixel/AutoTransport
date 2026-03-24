"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { Users, Sparkles, Phone, TrendingUp, CheckCircle, XCircle } from "lucide-react";

interface Stats {
  total: number;
  new: number;
  contacted: number;
  quoted: number;
  booked: number;
  lost: number;
}

const CARDS = [
  {
    key: "total" as keyof Stats,
    label: "My Leads",
    icon: Users,
    gradient: "from-blue-600/20 to-blue-500/5",
    border: "border-blue-500/20",
    icon_bg: "bg-blue-500/20",
    icon_color: "text-blue-400",
    glow: "shadow-blue-500/10",
  },
  {
    key: "contacted" as keyof Stats,
    label: "Contacted",
    icon: Phone,
    gradient: "from-yellow-500/20 to-yellow-400/5",
    border: "border-yellow-500/20",
    icon_bg: "bg-yellow-500/20",
    icon_color: "text-yellow-400",
    glow: "shadow-yellow-500/10",
  },
  {
    key: "quoted" as keyof Stats,
    label: "Quoted",
    icon: TrendingUp,
    gradient: "from-purple-600/20 to-purple-500/5",
    border: "border-purple-500/20",
    icon_bg: "bg-purple-500/20",
    icon_color: "text-purple-400",
    glow: "shadow-purple-500/10",
  },
  {
    key: "booked" as keyof Stats,
    label: "Booked",
    icon: CheckCircle,
    gradient: "from-green-600/20 to-green-500/5",
    border: "border-green-500/20",
    icon_bg: "bg-green-500/20",
    icon_color: "text-green-400",
    glow: "shadow-green-500/10",
  },
  {
    key: "new" as keyof Stats,
    label: "New",
    icon: Sparkles,
    gradient: "from-orange-600/20 to-orange-500/5",
    border: "border-orange-500/20",
    icon_bg: "bg-orange-500/20",
    icon_color: "text-orange-400",
    glow: "shadow-orange-500/10",
  },
  {
    key: "lost" as keyof Stats,
    label: "Lost",
    icon: XCircle,
    gradient: "from-red-600/20 to-red-500/5",
    border: "border-red-500/20",
    icon_bg: "bg-red-500/20",
    icon_color: "text-red-400",
    glow: "shadow-red-500/10",
  },
];

interface Props {
  brokerId?: string;
}

export function DashboardCards({ brokerId }: Props) {
  const [stats, setStats] = useState<Stats>({ total: 0, new: 0, contacted: 0, quoted: 0, booked: 0, lost: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!brokerId) { setLoading(false); return; }
    let query = supabase.from("leads").select("status");
    if (brokerId) query = query.eq("assigned_broker_id", brokerId);
    query.then(({ data, error }) => {
      if (!error && data) {
        setStats({
          total: data.length,
          new: data.filter((l) => l.status === "New").length,
          contacted: data.filter((l) => l.status === "Contacted").length,
          quoted: data.filter((l) => l.status === "Quoted").length,
          booked: data.filter((l) => l.status === "Booked").length,
          lost: data.filter((l) => l.status === "Lost").length,
        });
      }
      setLoading(false);
    });
  }, [brokerId]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {CARDS.map((card, i) => {
        const Icon = card.icon;
        const value = loading ? "—" : stats[card.key];
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            className={`relative overflow-hidden rounded-2xl border ${card.border} bg-gradient-to-br ${card.gradient} p-4 shadow-lg ${card.glow}`}
          >
            {/* Background glow circle */}
            <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full ${card.icon_bg} blur-xl opacity-60`} />
            <div className={`w-8 h-8 rounded-xl ${card.icon_bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${card.icon_color}`} />
            </div>
            <div className={`text-2xl font-bold ${card.icon_color} tabular-nums leading-none mb-1`}>
              {loading ? <span className="w-6 h-5 bg-white/10 rounded animate-pulse inline-block" /> : value}
            </div>
            <div className="text-xs text-blue-400 font-medium">{card.label}</div>
          </motion.div>
        );
      })}
    </div>
  );
}
