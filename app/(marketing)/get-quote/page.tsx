"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { QuoteForm } from "@/components/QuoteForm";
import { Shield, Clock, Phone, CheckCircle } from "lucide-react";

const trustPoints = [
  { icon: <Shield className="w-4 h-4 text-orange-400" />, text: "100% free, no obligation" },
  { icon: <Clock className="w-4 h-4 text-orange-400" />, text: "Response within 30 minutes" },
  { icon: <Phone className="w-4 h-4 text-orange-400" />, text: "Personal broker assigned" },
  { icon: <CheckCircle className="w-4 h-4 text-orange-400" />, text: "Locked-in pricing, no surprises" },
];

export default function GetQuotePage() {
  return (
    <div className="min-h-screen bg-[#060d1f] pt-28 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div {...fadeUp(0)} className="text-center mb-10">
          <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">Free Quote</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
            Get Your Free Transport Quote
          </h1>
          <p className="text-blue-300 text-base sm:text-lg max-w-2xl mx-auto">
            Fill in the details below and a dedicated broker will contact you with a personalized quote within 30 minutes.
          </p>
          {/* Trust signals */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-6">
            {trustPoints.map((tp, i) => (
              <motion.div key={tp.text} {...fadeUp(0.1 + i * 0.08)}
                className="flex items-center gap-2 text-sm text-blue-200">
                {tp.icon} {tp.text}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Form card */}
        <motion.div {...fadeUp(0.2)} className="bg-[#0a1628] border border-blue-800/30 rounded-3xl p-6 md:p-10">
          <Suspense fallback={
            <div className="animate-pulse space-y-4">
              {[1,2,3,4].map(i => <div key={i} className="h-12 rounded-xl bg-blue-900/30" />)}
            </div>
          }>
            <QuoteForm />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}
