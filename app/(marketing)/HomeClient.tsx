"use client";

import { useEffect, useState } from "react";
import { AnimatedHero } from "@/components/ui/animated-hero";
import { FeaturesSectionWithHoverEffects } from "@/components/ui/feature-section-with-hover-effects";
import { Globe } from "@/components/ui/globe";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { BauhausCard } from "@/components/ui/bauhaus-card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Star,
  Shield,
  Clock,
  Truck,
  CheckCircle,
  ArrowRight,
  Users,
  Award,
  MapPin,
} from "lucide-react";

interface Review { name: string; location?: string; author_name?: string; rating: number; text?: string; content?: string; }

const HARDCODED_REVIEWS: Review[] = [
  { name: "Michael T.", location: "New York → California", rating: 5, text: "Absolutely seamless experience. My car arrived 2 days early and in perfect condition. The broker kept me updated throughout the entire journey." },
  { name: "Sarah K.", location: "Texas → Florida", rating: 5, text: "Quoted 3 other companies and WESAutoTransport beat them all on price AND delivery speed. Will definitely use again for my next move." },
  { name: "James R.", location: "Chicago → Arizona", rating: 5, text: "Had a classic 1967 Mustang to ship. They arranged enclosed transport, and the car arrived without a scratch. Worth every penny." },
  { name: "Ahmed K.", rating: 5, text: "Excellent service! My car was delivered on time and in perfect condition." },
  { name: "Emily C.", rating: 5, text: "Used their expedited service for a last-minute move and they delivered! My Toyota arrived two days early." },
  { name: "Fatima Z.", rating: 4, text: "Very responsive customer support. Had a question about insurance coverage and the team helped me understand everything clearly." },
];

const stats = [
  { value: "50,000+", label: "Vehicles Shipped", icon: Truck },
  { value: "98.7%", label: "On-Time Delivery", icon: Clock },
  { value: "15,000+", label: "Happy Customers", icon: Users },
  { value: "A+", label: "BBB Rating", icon: Award },
];

const steps = [
  {
    number: "01",
    title: "Get a Free Quote",
    desc: "Fill out our simple form with your vehicle and route details. It takes less than 60 seconds.",
    icon: <MapPin className="w-6 h-6" />,
  },
  {
    number: "02",
    title: "We Find Your Carrier",
    desc: "Our team searches our network of 50,000+ vetted carriers to find the best match for your shipment.",
    icon: <Truck className="w-6 h-6" />,
  },
  {
    number: "03",
    title: "Your Car Gets Picked Up",
    desc: "A certified driver arrives at your door to load your vehicle and begin the journey.",
    icon: <CheckCircle className="w-6 h-6" />,
  },
  {
    number: "04",
    title: "Safe Delivery",
    desc: "Your vehicle arrives at the destination. Inspect it and sign off — it's that simple.",
    icon: <Shield className="w-6 h-6" />,
  },
];

const whyUsCards = [
  {
    id: "1",
    accentColor: "#f97316",
    topInscription: "50,000+ Active Carriers",
    mainText: "Massive Network",
    subMainText: "Access to the largest carrier network in the US",
    progressBarInscription: "Coverage:",
    progress: 100,
    progressValue: "All 50 States",
    filledButtonInscription: "Get Quote",
    outlinedButtonInscription: "Learn More",
  },
  {
    id: "2",
    accentColor: "#3b82f6",
    topInscription: "Fully Licensed & Insured",
    mainText: "Zero Risk",
    subMainText: "All carriers are FMCSA registered with active insurance",
    progressBarInscription: "Insurance Coverage:",
    progress: 100,
    progressValue: "100% Covered",
    filledButtonInscription: "Get Quote",
    outlinedButtonInscription: "Details",
  },
  {
    id: "3",
    accentColor: "#22c55e",
    topInscription: "Average quote time",
    mainText: "Lightning Fast",
    subMainText: "Get competing quotes from top carriers in minutes",
    progressBarInscription: "Speed:",
    progress: 95,
    progressValue: "< 2 Minutes",
    filledButtonInscription: "Get Quote",
    outlinedButtonInscription: "See How",
  },
];

const ctaWords = [
  { text: "Ship" },
  { text: "your" },
  { text: "vehicle" },
  { text: "with" },
  { text: "confidence.", className: "text-orange-400" },
];

export default function HomeClient() {
  const [allReviews, setAllReviews] = useState<Review[]>(HARDCODED_REVIEWS);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then(({ reviews: dbReviews }) => {
        if (dbReviews?.length) {
          const mapped = dbReviews.map((r: any) => ({ name: r.author_name, rating: r.rating, text: r.content }));
          setAllReviews([...mapped, ...HARDCODED_REVIEWS]);
        }
      })
      .catch(() => {});
  }, []);

  // Duplicate for seamless loop
  const marqueeItems = [...allReviews, ...allReviews];

  return (
    <div className="min-h-screen">
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/hero-bg.png')" }} />
        {/* Theme-aware overlay — use CSS class so html.light override works */}
        <div className="hero-overlay absolute inset-0 bg-gradient-to-b from-[#060d1f]/70 via-[#0a1628]/50 to-[#0f1f3d]/60" />
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 w-full">
          <AnimatedHero />
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="bg-[#0a1628] border-y border-blue-900/30">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <stat.icon className="w-6 h-6 text-orange-400 mb-2" />
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-blue-300 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-24 px-6 bg-[#060d1f]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">Simple Process</span>
            <h2 className="text-4xl font-bold text-white mt-3">How Auto Transport Works</h2>
            <p className="text-blue-300 mt-4 max-w-2xl mx-auto">
              We&apos;ve simplified the car shipping process into 4 easy steps. From quote to delivery, we handle everything.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className="relative group"
              >
                <div className="relative p-6 rounded-2xl border border-blue-800/30 bg-blue-950/20 hover:border-orange-500/40 hover:bg-blue-950/40 transition-all duration-300">
                  <div className="text-5xl font-black text-blue-900/40 absolute top-4 right-4">{step.number}</div>
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-blue-300 leading-relaxed">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 z-10">
                    <ArrowRight className="w-4 h-4 text-orange-400/50" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section className="py-24 px-6 bg-[#0a1628]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">What We Offer</span>
            <h2 className="text-4xl font-bold text-white mt-3">Our Transport Services</h2>
          </motion.div>
          <FeaturesSectionWithHoverEffects />
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="py-24 px-6 bg-[#060d1f]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">Why Us</span>
            <h2 className="text-4xl font-bold text-white mt-3">Why Choose WESAutoTransport?</h2>
            <p className="text-blue-300 mt-4 max-w-2xl mx-auto">
              We&apos;re more than a broker — we&apos;re your dedicated transport partner.
            </p>
          </motion.div>
          <div className="flex flex-wrap gap-8 justify-center">
            {whyUsCards.map((card) => (
              <BauhausCard
                key={card.id}
                id={card.id}
                accentColor={card.accentColor}
                topInscription={card.topInscription}
                mainText={card.mainText}
                subMainText={card.subMainText}
                progressBarInscription={card.progressBarInscription}
                progress={card.progress}
                progressValue={card.progressValue}
                filledButtonInscription={card.filledButtonInscription}
                outlinedButtonInscription={card.outlinedButtonInscription}
                onFilledButtonClick={() => window.location.href = "/get-quote"}
                onOutlinedButtonClick={() => window.location.href = "/about"}
                onMoreOptionsClick={() => { }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== GLOBE SECTION ===== */}
      <section className="py-24 px-6 bg-[#0a1628] dark:bg-[#0a1628] relative overflow-hidden">
        {/* Light mode: add a subtle gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-transparent dark:via-transparent dark:to-transparent" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">Nationwide Coverage</span>
              <h2 className="text-4xl font-bold text-white dark:text-white mt-3 mb-6">
                We Ship to Every Corner of America
              </h2>
              <p className="text-blue-300 dark:text-blue-300 leading-relaxed mb-6">
                With carriers stationed across all 50 states, we can pick up and deliver your vehicle anywhere in the continental United States — and beyond.
              </p>
              <div className="space-y-3">
                {["All 50 states covered", "50,000+ verified carriers", "Real-time tracking", "Door-to-door service"].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-blue-200 dark:text-blue-200">
                    <CheckCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/get-quote" className="inline-block mt-8">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white border-0">
                  Get a Quote Now <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
            {/* Globe — light shader works on any background */}
            <div className="relative h-[500px]">
              <Globe />
            </div>
          </div>
        </div>
      </section>

      {/* ===== CUSTOMER STORIES (infinite marquee scroll) ===== */}
      <section className="py-24 px-0 bg-[#060d1f] overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center">
            <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">Customer Stories</span>
            <h2 className="text-4xl font-bold text-white mt-3">What Our Customers Say</h2>
          </motion.div>
        </div>
        {/* Marquee container */}
        <div className="relative">
          {/* Left & right fade masks */}
          <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, var(--marquee-fade-bg, #060d1f), transparent)" }} />
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, var(--marquee-fade-bg, #060d1f), transparent)" }} />
          <div
            className="flex gap-6"
            style={{
              animation: "marquee 40s linear infinite",
              width: "max-content",
            }}
          >
            {marqueeItems.map((review, i) => (
              <div
                key={i}
                className="w-80 flex-shrink-0 p-6 rounded-2xl border border-blue-800/30 bg-blue-950/20 hover:border-orange-500/30 transition-all"
              >
                <div className="flex mb-3">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-orange-400 fill-orange-400" />
                  ))}
                </div>
                <p className="text-blue-200 text-sm leading-relaxed mb-4">&quot;{review.text || review.content}&quot;</p>
                <div>
                  <div className="text-white font-semibold text-sm">{review.name || review.author_name}</div>
                  {review.location && (
                    <div className="text-blue-400 text-xs mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {review.location}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes marquee {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <TypewriterEffectSmooth words={ctaWords} />
            <p className="text-blue-300 text-lg mb-10 max-w-2xl mx-auto">
              Join over 15,000 customers who trusted us to ship their vehicles safely and on time. Get your free quote — no obligation, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/get-quote">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white border-0 h-12 px-8 text-base font-semibold">
                  Get Your Free Quote <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="h-12 px-8 text-base border-blue-600 text-blue-200 hover:bg-blue-900/40">
                  Contact Us
                </Button>
              </Link>
              <a href="https://wa.me/923059846727" target="_blank" rel="noopener noreferrer">
                <Button className="h-12 px-8 text-base bg-green-600 hover:bg-green-700 text-white border-0 font-semibold">
                  WhatsApp Us
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section >
    </div >
  );
}
