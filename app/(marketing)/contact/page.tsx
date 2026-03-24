"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle } from "lucide-react";
import { EmailLink } from "@/components/EmailLink";
import Image from "next/image";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to send");
      setSubmitted(true);
      setFormData({ name: "", phone: "", email: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    } catch {
      setError("Something went wrong. Please try calling or emailing us directly.");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#060d1f] pt-28 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header with image */}
        <div className="relative rounded-3xl overflow-hidden mb-14">
          <Image
            src="/contact-office.png"
            alt="Our Office"
            width={1200}
            height={400}
            className="w-full h-48 md:h-64 object-cover"
          />
          <div className="img-overlay absolute inset-0 bg-gradient-to-t from-[#060d1f] via-[#060d1f]/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">Get In Touch</span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-1">Contact Us</h1>
            <p className="text-blue-300 text-base mt-1 max-w-xl">Have a question or need a custom quote? Our team is here to help.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Cards */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-5 rounded-2xl border border-blue-800/30 bg-blue-950/20 hover:border-orange-500/30 transition-all">
              <div className="w-11 h-11 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-blue-400 uppercase tracking-wider mb-1">Phone</p>
                <a href="tel:+923059846727" className="text-base font-semibold text-white hover:text-orange-400 transition-colors">
                  +92 305 9846727
                </a>
                <p className="text-sm text-blue-300 mt-0.5">Faisal Masood — HR, WES Solutions</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl border border-green-700/30 bg-green-950/20 hover:border-green-500/30 transition-all">
              <div className="w-11 h-11 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-green-400 uppercase tracking-wider mb-1">WhatsApp</p>
                <a href="https://wa.me/923059846727" target="_blank" rel="noopener noreferrer" className="text-base font-semibold text-white hover:text-green-400 transition-colors">
                  Chat on WhatsApp
                </a>
                <p className="text-sm text-blue-300 mt-0.5">Quick response guaranteed</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl border border-blue-800/30 bg-blue-950/20 hover:border-orange-500/30 transition-all">
              <div className="w-11 h-11 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-blue-400 uppercase tracking-wider mb-1">Email</p>
                <EmailLink className="text-base font-semibold text-white hover:text-orange-400 transition-colors" />
                <p className="text-sm text-blue-300 mt-0.5">We respond within a few hours</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl border border-blue-800/30 bg-blue-950/20 hover:border-orange-500/30 transition-all">
              <div className="w-11 h-11 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-blue-400 uppercase tracking-wider mb-1">Office</p>
                <p className="text-base font-semibold text-white">16 GCP, near UCP Lahore</p>
                <p className="text-sm text-blue-300 mt-0.5">WES Solutions</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl border border-blue-800/30 bg-blue-950/20 hover:border-orange-500/30 transition-all">
              <div className="w-11 h-11 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-blue-400 uppercase tracking-wider mb-1">Hours</p>
                <p className="text-base font-semibold text-white">Mon – Sat, 9 AM – 6 PM PKT</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-2">Send Us a Message</h2>
            <p className="text-blue-400 text-sm mb-6">Fill in your details and our team will get back to you shortly.</p>

            {submitted && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-green-900/20 border border-green-700/40 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" /> Inquiry received! Our team will contact you soon.
              </div>
            )}
            {error && (
              <div className="p-3 mb-4 rounded-lg bg-red-900/20 border border-red-800/40 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1.5">Your Name <span className="text-orange-400">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Smith"
                  className="w-full rounded-lg border border-blue-800/50 bg-blue-950/40 px-3 py-2.5 text-white text-sm placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (800) 000-0000"
                    className="w-full rounded-lg border border-blue-800/50 bg-blue-950/40 px-3 py-2.5 text-white text-sm placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full rounded-lg border border-blue-800/50 bg-blue-950/40 px-3 py-2.5 text-white text-sm placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1.5">Message <span className="text-orange-400">*</span></label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us how we can help..."
                  className="w-full rounded-lg border border-blue-800/50 bg-blue-950/40 px-3 py-2.5 text-white text-sm placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all resize-none"
                />
              </div>

              {/* PRIMARY: Submit Inquiry button — saves to DB */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {submitting ? (
                  <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</span>
                ) : (
                  <><Send className="w-4 h-4" /> Send Inquiry</>
                )}
              </button>

              {/* Quick contact row */}
              <div className="flex gap-3">
                <a
                  href="tel:+923059846727"
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
                >
                  <Phone className="w-4 h-4" /> Call Us
                </a>
                <EmailLink
                  wrapperClassName="flex-1"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
                  showIcon
                >
                  Email Us
                </EmailLink>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
