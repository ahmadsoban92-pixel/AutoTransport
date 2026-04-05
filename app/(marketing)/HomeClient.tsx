"use client";

// HomeClient.tsx — contains ONLY the sections that require client-side
// interactivity (data fetching, animations, event handlers).
// Static sections are imported as server components from components/home/.

import { useEffect, useState } from "react";
import { AnimatedHero }          from "@/components/ui/animated-hero";
import { GlobeWithUSAMap }        from "@/components/GlobeWithUSAMap";
import { BauhausCard }            from "@/components/ui/bauhaus-card";
import { Button }                 from "@/components/ui/button";
import { StatsSection }           from "@/components/home/StatsSection";
import { HowItWorksSection }      from "@/components/home/HowItWorksSection";
import { ServicesSection }        from "@/components/home/ServicesSection";
import { CTASection }             from "@/components/home/CTASection";
import Link from "next/link";
import { Star, MapPin, CheckCircle, ArrowRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Review {
  name?: string;
  author_name?: string;
  location?: string;
  rating: number;
  text?: string;
  content?: string;
}

// ─── Static data (module level = evaluated once) ──────────────────────────────
const HARDCODED_REVIEWS: Review[] = [
  { name: "Michael T.", location: "New York to California", rating: 5, text: "Absolutely seamless experience. My car arrived 2 days early and in perfect condition. The broker kept me updated throughout the entire journey." },
  { name: "Sarah K.",   location: "Texas to Florida",       rating: 5, text: "Quoted 3 other companies and WESAutoTransport beat them all on price AND delivery speed. Will definitely use again for my next move." },
  { name: "James R.",   location: "Chicago to Arizona",     rating: 5, text: "Had a classic 1967 Mustang to ship. They arranged enclosed transport, and the car arrived without a scratch. Worth every penny." },
  { name: "Ahmed K.",   rating: 5, text: "Excellent service! My car was delivered on time and in perfect condition." },
  { name: "Emily C.",   rating: 5, text: "Used their expedited service for a last-minute move and they delivered! My Toyota arrived two days early." },
  { name: "Fatima Z.",  rating: 4, text: "Very responsive customer support. Had a question about insurance coverage and the team helped me understand everything clearly." },
];

const WHY_US_CARDS = [
  {
    id: "1", accentColor: "#f97316",
    topInscription: "50,000+ Active Carriers",
    mainText: "Massive Network",
    subMainText: "Access to the largest carrier network in the US",
    progressBarInscription: "Coverage:", progress: 100, progressValue: "All 50 States",
    filledButtonInscription: "Get Quote", outlinedButtonInscription: "Learn More",
  },
  {
    id: "2", accentColor: "#3b82f6",
    topInscription: "Fully Licensed & Insured",
    mainText: "Zero Risk",
    subMainText: "All carriers are FMCSA registered with active insurance",
    progressBarInscription: "Insurance Coverage:", progress: 100, progressValue: "100% Covered",
    filledButtonInscription: "Get Quote", outlinedButtonInscription: "Details",
  },
  {
    id: "3", accentColor: "#22c55e",
    topInscription: "Average quote time",
    mainText: "Lightning Fast",
    subMainText: "Get competing quotes from top carriers in minutes",
    progressBarInscription: "Speed:", progress: 95, progressValue: "< 2 Minutes",
    filledButtonInscription: "Get Quote", outlinedButtonInscription: "See How",
  },
];

const COVERAGE_ITEMS = [
  "All 50 states covered",
  "50,000+ verified carriers",
  "Real-time tracking",
  "Door-to-door service",
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function HomeClient() {
  const [allReviews, setAllReviews] = useState<Review[]>(HARDCODED_REVIEWS);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then(({ reviews: dbReviews }) => {
        if (dbReviews?.length) {
          const mapped = (dbReviews as Array<{ author_name: string; rating: number; content: string }>)
            .map((r) => ({ name: r.author_name, rating: r.rating, text: r.content }));
          setAllReviews([...mapped, ...HARDCODED_REVIEWS]);
        }
      })
      .catch(() => {});
  }, []);

  // Duplicate for seamless infinite marquee loop
  const marqueeItems = [...allReviews, ...allReviews];

  return (
    <div className="min-h-screen">

      {/* ===== HERO — client (animated) ===== */}
      <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/hero-bg.png')" }} />
        <div className="hero-overlay absolute inset-0 bg-gradient-to-b from-[#060d1f]/70 via-[#0a1628]/50 to-[#0f1f3d]/60" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 w-full">
          <AnimatedHero />
        </div>
      </section>

      {/* ===== STATS — server component ===== */}
      <StatsSection />

      {/* ===== HOW IT WORKS — server component ===== */}
      <HowItWorksSection />

      {/* ===== SERVICES — server component ===== */}
      <ServicesSection />

      {/* ===== WHY CHOOSE US — client (BauhausCard has onClick handlers) ===== */}
      <section className="py-24 px-6 bg-[#060d1f]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">Why Us</span>
            <h2 className="text-4xl font-bold text-white mt-3">Why Choose WESAutoTransport?</h2>
            <p className="text-blue-300 mt-4 max-w-2xl mx-auto">
              We&apos;re more than a broker — we&apos;re your dedicated transport partner.
            </p>
          </div>
          <div className="flex flex-wrap gap-8 justify-center">
            {WHY_US_CARDS.map((card) => (
              <BauhausCard
                key={card.id}
                {...card}
                onFilledButtonClick={() => { window.location.href = "/get-quote"; }}
                onOutlinedButtonClick={() => { window.location.href = "/about"; }}
                onMoreOptionsClick={() => {}}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== GLOBE SECTION — client (GlobeWithUSAMap is interactive) ===== */}
      <section className="py-24 px-6 bg-[#0a1628] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-transparent dark:via-transparent dark:to-transparent" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">
                Nationwide Coverage
              </span>
              <h2 className="text-4xl font-bold text-white dark:text-white mt-3 mb-6">
                We Ship to Every Corner of America
              </h2>
              <p className="text-blue-300 dark:text-blue-300 leading-relaxed mb-6">
                With carriers stationed across all 50 states, we can pick up and deliver your
                vehicle anywhere in the continental United States — and beyond.
              </p>
              <div className="space-y-3">
                {COVERAGE_ITEMS.map((item) => (
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
            </div>
            <GlobeWithUSAMap />
          </div>
        </div>
      </section>

      {/* ===== CUSTOMER STORIES — client (fetches DB reviews) ===== */}
      <section className="py-24 px-0 bg-[#060d1f] overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 mb-12">
          <div className="text-center">
            <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">
              Customer Stories
            </span>
            <h2 className="text-4xl font-bold text-white mt-3">What Our Customers Say</h2>
          </div>
        </div>
        <div className="relative">
          <div
            className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to right, var(--marquee-fade-bg, #060d1f), transparent)" }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to left, var(--marquee-fade-bg, #060d1f), transparent)" }}
          />
          <div
            className="flex gap-6"
            style={{ animation: "marquee 40s linear infinite", width: "max-content" }}
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
                <p className="text-blue-200 text-sm leading-relaxed mb-4">
                  &quot;{review.text || review.content}&quot;
                </p>
                <div>
                  <div className="text-white font-semibold text-sm">
                    {review.name || review.author_name}
                  </div>
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

      {/* ===== CTA — server component ===== */}
      <CTASection />

    </div>
  );
}
