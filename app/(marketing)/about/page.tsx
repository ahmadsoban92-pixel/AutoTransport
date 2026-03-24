import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Truck, Target, Users, Award, Shield, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | AutoTransportPro",
  description:
    "Learn about AutoTransportPro — America's trusted auto transport brokerage connecting customers with verified carriers since 2010.",
};

const milestones = [
  { year: "2010", event: "Founded with a mission to make auto transport simple, transparent, and stress-free for car owners across America" },
  { year: "2013", event: "Expanded to a network of 5,000 verified carriers nationwide" },
  { year: "2017", event: "Reached 100,000 successful vehicle deliveries" },
  { year: "2020", event: "Launched our digital platform for instant online quotes" },
  { year: "2024", event: "Over 400,000 vehicles shipped across all 50 states" },
];

const values = [
  {
    icon: <Shield className="w-6 h-6 text-orange-400" />,
    title: "Trust & Transparency",
    desc: "No hidden fees. No bait-and-switch pricing. We tell you exactly what you're paying for, upfront.",
  },
  {
    icon: <Target className="w-6 h-6 text-orange-400" />,
    title: "Reliability",
    desc: "98.7% on-time delivery rate. We set realistic timelines and we meet them — every single time.",
  },
  {
    icon: <Users className="w-6 h-6 text-orange-400" />,
    title: "Customer First",
    desc: "From first contact to final delivery, our brokers are only a call away to answer your questions.",
  },
  {
    icon: <Award className="w-6 h-6 text-orange-400" />,
    title: "Excellence",
    desc: "Thousands of repeat customers and a proven track record of successful shipments speak for our commitment to quality.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#060d1f] pt-28 pb-16">
      {/* Hero with team image */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden mb-10">
            <Image src="/about-team.png" alt="Our Team" width={1200} height={400} className="w-full h-56 md:h-72 object-cover" />
            <div className="img-overlay absolute inset-0 bg-gradient-to-t from-[#060d1f] via-[#060d1f]/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-left">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-3">
                <Truck className="w-7 h-7 text-orange-400" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-6">
            About <span className="text-orange-400">AutoTransportPro</span>
          </h1>
          <p className="text-xl text-blue-300 leading-relaxed max-w-3xl mx-auto">
            We&apos;re America&apos;s most trusted auto transport brokerage — connecting car owners with vetted, insured carriers since 2010. Our mission is simple: make vehicle shipping stress-free.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 px-6 bg-[#0a1628] border-y border-blue-900/30">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "15+", label: "Years in Business" },
            { value: "400K+", label: "Vehicles Shipped" },
            { value: "50K+", label: "Verified Carriers" },
            { value: "98.7%", label: "On-Time Delivery" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-black text-orange-400">{s.value}</div>
              <div className="text-sm text-blue-300 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Story</h2>
          <div className="relative pl-8 border-l border-blue-800/50 space-y-10">
            {milestones.map((m) => (
              <div key={m.year} className="relative">
                <div className="absolute -left-[2.15rem] w-4 h-4 rounded-full bg-orange-500 border-2 border-[#060d1f]" />
                <div className="text-orange-400 text-sm font-bold mb-1">{m.year}</div>
                <p className="text-blue-200">{m.event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 bg-[#0a1628]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="p-6 rounded-2xl border border-blue-800/30 bg-blue-950/20 hover:border-orange-500/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
                  {v.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{v.title}</h3>
                <p className="text-sm text-blue-300 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Ship Your Vehicle?</h2>
          <p className="text-blue-300 mb-8">Get a free, no-obligation quote in under 60 seconds.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-quote">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white border-0 h-12 px-8 text-base">
                Get Your Free Quote →
              </Button>
            </Link>
            <a href="https://wa.me/923059846727" target="_blank" rel="noopener noreferrer">
              <Button className="h-12 px-8 text-base bg-green-600 hover:bg-green-700 text-white border-0">
                WhatsApp Us
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
