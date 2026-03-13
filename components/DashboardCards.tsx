"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Lead, LeadStatus } from "@/types/lead";
import { motion } from "framer-motion";
import { Users, Star, Phone, CheckCircle, XCircle, TrendingUp } from "lucide-react";

interface Stats {
  total: number;
  new: number;
  contacted: number;
  quoted: number;
  booked: number;
  lost: number;
}

const statCards = (stats: Stats) => [
  {
    label: "Total Leads",
    value: stats.total,
    icon: <Users className="w-5 h-5" />,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    label: "New Leads",
    value: stats.new,
    icon: <Star className="w-5 h-5" />,
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
  },
  {
    label: "Contacted",
    value: stats.contacted,
    icon: <Phone className="w-5 h-5" />,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
  },
  {
    label: "Quoted",
    value: stats.quoted,
    icon: <TrendingUp className="w-5 h-5" />,
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    label: "Booked",
    value: stats.booked,
    icon: <CheckCircle className="w-5 h-5" />,
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
  },
  {
    label: "Lost",
    value: stats.lost,
    icon: <XCircle className="w-5 h-5" />,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
  },
];

export function DashboardCards() {
  const [stats, setStats] = useState<Stats>({
    total: 0, new: 0, contacted: 0, quoted: 0, booked: 0, lost: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const { data, error } = await supabase.from("leads").select("status");
      if (!error && data) {
        const s: Stats = {
          total: data.length,
          new: data.filter((l) => l.status === "New").length,
          contacted: data.filter((l) => l.status === "Contacted").length,
          quoted: data.filter((l) => l.status === "Quoted").length,
          booked: data.filter((l) => l.status === "Booked").length,
          lost: data.filter((l) => l.status === "Lost").length,
        };
        setStats(s);
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  const cards = statCards(stats);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className={`p-5 rounded-2xl border ${card.bg} flex flex-col gap-3`}
        >
          <div className={`${card.color}`}>{card.icon}</div>
          <div>
            <div className="text-2xl font-black text-white">
              {loading ? (
                <span className="inline-block w-8 h-6 bg-blue-900/50 rounded animate-pulse" />
              ) : (
                card.value
              )}
            </div>
            <div className="text-xs text-blue-400 mt-0.5">{card.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
