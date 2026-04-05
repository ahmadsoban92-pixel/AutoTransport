// components/home/CTASection.tsx
// Server component — static content with links, no client state.
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { ArrowRight } from "lucide-react";

const ctaWords = [
  { text: "Ship" },
  { text: "your" },
  { text: "vehicle" },
  { text: "with" },
  { text: "confidence.", className: "text-orange-400" },
];

// TypewriterEffectSmooth is a client component — wrapping it here is safe;
// Next.js serialises the words prop and keeps the client boundary inside it.
export function CTASection() {
  return (
    <section className="py-24 px-6 bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <TypewriterEffectSmooth words={ctaWords} />
        <p className="text-blue-300 text-lg mb-10 max-w-2xl mx-auto">
          Join over 15,000 customers who trusted us to ship their vehicles safely and on time.
          Get your free quote — no obligation, no credit card required.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/get-quote">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white border-0 h-12 px-8 text-base font-semibold">
              Get Your Free Quote <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button
              variant="outline"
              className="h-12 px-8 text-base border-blue-600 text-blue-200 hover:bg-blue-900/40"
            >
              Contact Us
            </Button>
          </Link>
          <a href="https://wa.me/923059846727" target="_blank" rel="noopener noreferrer">
            <Button className="h-12 px-8 text-base bg-green-600 hover:bg-green-700 text-white border-0 font-semibold">
              WhatsApp Us
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
