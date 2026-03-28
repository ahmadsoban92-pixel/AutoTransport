"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import Link from "next/link";
import { MapPin, Search, Globe, ArrowRight, Info, CheckCircle } from "lucide-react";

const regions = [
  { digit: "0", states: "CT, MA, ME, NH, NJ, NY, PR, RI, VT", label: "Northeast", color: "bg-blue-500" },
  { digit: "1", states: "DE, NY, PA", label: "Mid-Atlantic", color: "bg-indigo-500" },
  { digit: "2", states: "DC, MD, NC, SC, VA, WV", label: "Southeast Coast", color: "bg-violet-500" },
  { digit: "3", states: "AL, FL, GA, MS, TN", label: "Deep South", color: "bg-purple-500" },
  { digit: "4", states: "IN, KY, MI, OH", label: "Midwest East", color: "bg-pink-500" },
  { digit: "5", states: "IA, MN, MT, ND, SD, WI", label: "Midwest North", color: "bg-rose-500" },
  { digit: "6", states: "IL, KS, MO, NE", label: "Midwest Central", color: "bg-orange-500" },
  { digit: "7", states: "AR, LA, OK, TX", label: "South Central", color: "bg-amber-500" },
  { digit: "8", states: "AZ, CO, ID, NM, NV, UT, WY", label: "Mountain West", color: "bg-yellow-500" },
  { digit: "9", states: "AK, CA, HI, OR, WA", label: "Pacific Coast", color: "bg-green-500" },
];

const lookupMethods = [
  {
    icon: <Search className="w-5 h-5 text-orange-400" />,
    title: "Google it",
    desc: 'Search "ZIP code [your city, state]" — Google shows it instantly at the top of results.',
    example: 'e.g. "ZIP code Miami FL" → 33101',
  },
  {
    icon: <Globe className="w-5 h-5 text-orange-400" />,
    title: "USPS ZIP Lookup",
    desc: "Visit usps.com and use the official ZIP code lookup tool. Enter your address to get the exact code.",
    example: "tools.usps.com/zip-code-lookup.htm",
    link: "https://tools.usps.com/zip-code-lookup.htm",
  },
  {
    icon: <MapPin className="w-5 h-5 text-orange-400" />,
    title: "Check your mail",
    desc: "Your ZIP code is on any piece of mail sent to your address — look for the 5 digits after your state abbreviation.",
    example: "Miami, FL  33101",
  },
  {
    icon: <Info className="w-5 h-5 text-orange-400" />,
    title: "Ask your contact",
    desc: "If shipping to/from a business or dealer, ask them for their exact ZIP code — they'll know it instantly.",
    example: "Dealership, mechanic, or friend's ZIP",
  },
];

export default function ZipCodeGuidePage() {
  return (
    <div className="min-h-screen bg-[#060d1f] pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-6">

        {/* ── Hero ── */}
        <motion.div {...fadeUp(0)} className="text-center mb-14">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500/20 mb-6">
            <MapPin className="w-8 h-8 text-orange-400" />
          </div>
          <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest block mb-3">Transport Guide</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Understanding US <span className="text-orange-400">ZIP Codes</span>
          </h1>
          <p className="text-blue-300 text-base sm:text-lg max-w-2xl mx-auto">
            We use ZIP codes to calculate your shipping route and price estimate. Here's everything you need to know to fill out your quote correctly.
          </p>
        </motion.div>

        {/* ── What is a ZIP code ── */}
        <motion.section {...fadeUp(0.05)} className="mb-10 p-6 sm:p-8 rounded-2xl border border-blue-800/30 bg-blue-950/20">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-orange-400 flex-shrink-0" />
            What is a ZIP code?
          </h2>
          <p className="text-blue-300 leading-relaxed mb-4">
            A <strong className="text-white">ZIP code</strong> (Zone Improvement Plan code) is a 5-digit number that identifies a specific mail delivery area in the United States. Every address in the US has one.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            {["Always 5 digits", "Covers a city, town, or neighborhood", "Required for all US shipping", "No spaces or dashes needed"].map((fact) => (
              <div key={fact} className="flex items-center gap-2 text-sm text-blue-200 bg-blue-900/30 px-3 py-1.5 rounded-full">
                <CheckCircle className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                {fact}
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Structure anatomy ── */}
        <motion.section {...fadeUp(0.1)} className="mb-10">
          <h2 className="text-xl font-bold text-white mb-6">ZIP Code Structure</h2>
          <div className="p-6 sm:p-8 rounded-2xl border border-orange-500/20 bg-orange-500/5">
            {/* Visual anatomy */}
            <div className="flex items-stretch gap-1 justify-center mb-6 font-mono text-3xl sm:text-5xl font-black">
              {[
                { digit: "9", label: "Region", color: "text-orange-400", bg: "bg-orange-500/20 border-orange-500/40" },
                { digit: "0", label: "Sector", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
                { digit: "2", label: "Sector", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
                { digit: "1", label: "Delivery", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/30" },
                { digit: "0", label: "Delivery", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/30" },
              ].map((d, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className={`w-11 h-14 sm:w-14 sm:h-18 flex items-center justify-center rounded-lg border ${d.bg} ${d.color}`}>
                    {d.digit}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <div className="text-orange-400 font-bold mb-1">1st digit = Region</div>
                <p className="text-blue-300 text-xs">Identifies the broad geographic area of the US (0–9, coast to coast)</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="text-blue-400 font-bold mb-1">2nd & 3rd digits = Sector</div>
                <p className="text-blue-300 text-xs">Narrows down to a specific state or metropolitan area</p>
              </div>
              <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <div className="text-violet-400 font-bold mb-1">4th & 5th digits = Delivery</div>
                <p className="text-blue-300 text-xs">Pinpoints the exact post office or delivery route</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Region Map ── */}
        <motion.section {...fadeUp(0.15)} className="mb-10">
          <h2 className="text-xl font-bold text-white mb-2">First Digit = US Region</h2>
          <p className="text-blue-300 text-sm mb-6">The first digit of your ZIP code tells us which part of the country you're in. This directly affects your shipping route and price estimate.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {regions.map((r, i) => (
              <motion.div key={r.digit} {...fadeUp(0.15 + i * 0.03)}
                className="flex items-start gap-3 p-4 rounded-xl border border-blue-800/30 bg-blue-950/20 hover:border-orange-500/30 transition-all">
                <div className={`w-10 h-10 rounded-xl ${r.color} flex items-center justify-center text-white font-black text-lg flex-shrink-0`}>
                  {r.digit}
                </div>
                <div className="min-w-0">
                  <div className="text-white font-semibold text-sm">{r.label}</div>
                  <div className="text-blue-400 text-xs mt-0.5 leading-relaxed">{r.states}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── How to find your ZIP ── */}
        <motion.section {...fadeUp(0.2)} className="mb-10">
          <h2 className="text-xl font-bold text-white mb-6">How to Find Your ZIP Code</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lookupMethods.map((m, i) => (
              <motion.div key={m.title} {...fadeUp(0.2 + i * 0.07)}
                className="p-5 rounded-2xl border border-blue-800/30 bg-blue-950/20 hover:border-orange-500/30 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    {m.icon}
                  </div>
                  <h3 className="font-bold text-white">{m.title}</h3>
                </div>
                <p className="text-blue-300 text-sm leading-relaxed mb-2">{m.desc}</p>
                {m.link ? (
                  <a href={m.link} target="_blank" rel="noopener noreferrer"
                    className="text-orange-400 text-xs font-medium hover:text-orange-300 underline underline-offset-2">
                    {m.example}
                  </a>
                ) : (
                  <code className="text-orange-400 text-xs bg-orange-500/10 px-2 py-0.5 rounded">{m.example}</code>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Common Examples ── */}
        <motion.section {...fadeUp(0.25)} className="mb-12 p-6 rounded-2xl border border-blue-800/30 bg-blue-950/20">
          <h2 className="text-lg font-bold text-white mb-4">Common City Examples</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { city: "New York, NY", zip: "10001" },
              { city: "Los Angeles, CA", zip: "90001" },
              { city: "Chicago, IL", zip: "60601" },
              { city: "Houston, TX", zip: "77001" },
              { city: "Miami, FL", zip: "33101" },
              { city: "Phoenix, AZ", zip: "85001" },
              { city: "Philadelphia, PA", zip: "19101" },
              { city: "Dallas, TX", zip: "75201" },
              { city: "Atlanta, GA", zip: "30301" },
            ].map((c) => (
              <div key={c.city} className="flex flex-col gap-0.5">
                <span className="text-blue-400 text-xs">{c.city}</span>
                <span className="text-white font-mono font-bold text-sm">{c.zip}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── CTA ── */}
        <motion.div {...fadeUp(0.3)} className="text-center">
          <p className="text-blue-300 mb-5">Ready to get your transport estimate?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-quote"
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold h-12 px-8 rounded-xl transition-colors">
              Get a Free Quote <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 border border-blue-600 text-blue-200 hover:bg-blue-900/40 font-semibold h-12 px-8 rounded-xl transition-colors">
              ← Go Back
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
