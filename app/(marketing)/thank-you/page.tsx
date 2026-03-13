"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Phone, Clock, ArrowRight } from "lucide-react";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-[#060d1f] pt-28 pb-16 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-2xl w-full text-center"
      >
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="w-24 h-24 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle className="w-12 h-12 text-green-400" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Quote Request <span className="text-green-400">Received!</span>
          </h1>
          <p className="text-blue-300 text-lg mb-8 leading-relaxed">
            Thank you for choosing AutoTransportPro. Your dedicated broker will review your request and contact you within <strong className="text-white">30 minutes</strong> with a personalized quote.
          </p>
        </motion.div>

        {/* What happens next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-6 mb-8 text-left"
        >
          <h2 className="text-white font-bold text-lg mb-4">What happens next?</h2>
          <div className="space-y-4">
            {[
              {
                icon: <Clock className="w-5 h-5 text-orange-400" />,
                title: "Within 30 minutes",
                desc: "A dedicated broker reviews your request and prepares your personalized quote.",
              },
              {
                icon: <Phone className="w-5 h-5 text-blue-400" />,
                title: "We call you",
                desc: "Your broker calls you to discuss your quote, answer questions, and confirm details.",
              },
              {
                icon: <CheckCircle className="w-5 h-5 text-green-400" />,
                title: "Carrier assigned",
                desc: "Once you approve the quote, we match you with the best carrier for your route.",
              },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  {step.icon}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{step.title}</div>
                  <div className="text-blue-300 text-sm mt-0.5">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/">
            <Button variant="outline" className="border-blue-600 text-blue-200 hover:bg-blue-900/40">
              Back to Home
            </Button>
          </Link>
          <a href="tel:+18005551234">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white border-0">
              <Phone className="mr-2 w-4 h-4" /> Call Us Now
            </Button>
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-blue-500 text-xs mt-6"
        >
          Can&apos;t wait? Call us directly at{" "}
          <a href="tel:+18005551234" className="text-orange-400 hover:underline">
            1-800-555-1234
          </a>{" "}
          — available Mon–Fri 8am–8pm ET
        </motion.p>
      </motion.div>
    </div>
  );
}
