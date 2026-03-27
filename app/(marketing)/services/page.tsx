import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Truck, Shield, Clock, MapPin, Zap, Package } from "lucide-react";

export const metadata: Metadata = {
  title: "Services | WESAutoTransport",
  description:
    "Explore WESAutoTransport's auto transport services: open transport, enclosed transport, expedited shipping, non-running vehicles, and door-to-door delivery.",
};

const services = [
  {
    icon: <Truck className="w-8 h-8 text-orange-400" />,
    title: "Open Auto Transport",
    quoteType: "Open",
    price: "Most Popular",
    priceColor: "text-green-400",
    desc: "The most common and affordable way to ship your car. Your vehicle travels on an open multi-car trailer alongside other vehicles. Trusted by millions of Americans every year.",
    features: [
      "Best price guarantee",
      "Available across all 50 states",
      "Suitable for standard vehicles",
      "Fully insured transit",
      "Door-to-door service available",
    ],
  },
  {
    icon: <Shield className="w-8 h-8 text-blue-400" />,
    title: "Enclosed Auto Transport",
    quoteType: "Enclosed",
    price: "Premium",
    priceColor: "text-blue-400",
    desc: "Ultimate protection for luxury, exotic, classic, or collector vehicles. Your car travels in a fully enclosed trailer, shielded from road debris, weather, and UV exposure.",
    features: [
      "Complete weather protection",
      "Ideal for high-value vehicles",
      "Soft-straps and wheel cradles",
      "Enhanced insurance coverage",
      "Limited-load trailers available",
    ],
  },
  {
    icon: <Zap className="w-8 h-8 text-yellow-400" />,
    title: "Expedited Shipping",
    quoteType: "Expedited",
    price: "Fast",
    priceColor: "text-yellow-400",
    desc: "Need your vehicle moved urgently? Our expedited service prioritizes your shipment in our carrier network for the fastest possible pickup and delivery.",
    features: [
      "Priority dispatch",
      "Dedicated carrier assignment",
      "Faster than standard service",
      "Available 24/7",
      "Real-time status updates",
    ],
  },
  {
    icon: <Package className="w-8 h-8 text-purple-400" />,
    title: "Non-Running Vehicle Transport",
    quoteType: "Open",
    quoteCondition: "Non-Running",
    price: "Specialized",
    priceColor: "text-purple-400",
    desc: "We transport inoperable vehicles with specialized equipment. Whether your car won\'t start, has a blown transmission, or needs major repairs — we get it there safely.",
    features: [
      "Winch-assisted loading",
      "Specialized flatbed trailers",
      "No judgment on vehicle condition",
      "Works for any vehicle type",
      "Experienced handlers",
    ],
  },
  {
    icon: <MapPin className="w-8 h-8 text-red-400" />,
    title: "Door-to-Door Transport",
    quoteType: "Door-to-Door",
    price: "Convenient",
    priceColor: "text-red-400",
    desc: "Maximum convenience — our carrier picks up from your home or office and delivers directly to your specified address. No need to drive to a terminal.",
    features: [
      "Pick up from your location",
      "Deliver to any address",
      "Perfect for relocation",
      "Scheduled pickup windows",
      "Residential approved carriers",
    ],
  },
  {
    icon: <Clock className="w-8 h-8 text-teal-400" />,
    title: "Snowbird & Seasonal Transport",
    quoteType: "Snowbird/Seasonal",
    price: "Seasonal",
    priceColor: "text-teal-400",
    desc: "Moving between seasonal homes? We specialize in snowbird routes — Florida, Arizona, California — with carriers that run these routes weekly.",
    features: [
      "High-frequency snowbird routes",
      "Competitive seasonal pricing",
      "Repeat customer discounts",
      "Flexible scheduling",
      "North-South & East-West routes",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#060d1f] pt-28 pb-16">
      {/* Header with image */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden mb-8">
            <Image src="/services-banner.png" alt="Auto Transport Services" width={1200} height={300} className="w-full h-44 md:h-56 object-cover" />
            <div className="img-overlay absolute inset-0 bg-gradient-to-t from-[#060d1f] via-[#060d1f]/40 to-transparent" />
          </div>
          <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">What We Offer</span>
          <h1 className="text-5xl font-bold text-white mt-3 mb-6">Our Transport Services</h1>
          <p className="text-xl text-blue-300">
            From daily drivers to dream cars — we have the right transport solution for every vehicle and budget.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              className="p-6 rounded-2xl border border-blue-800/30 bg-blue-950/20 hover:border-orange-500/30 hover:bg-blue-950/40 transition-all duration-300 flex flex-col"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                {service.icon}
              </div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-white">{service.title}</h2>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/5 ${service.priceColor}`}>
                  {service.price}
                </span>
              </div>
              <p className="text-sm text-blue-300 mb-4 leading-relaxed flex-grow">{service.desc}</p>
              <ul className="space-y-1.5 mb-6">
                {service.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-blue-200">
                    <span className="w-4 h-4 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-xs flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={`/get-quote?type=${encodeURIComponent(service.quoteType)}${service.quoteCondition ? `&condition=${encodeURIComponent(service.quoteCondition)}` : ""}`}>
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0">
                  Get a Quote
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center bg-[#0a1628] border-t border-blue-900/30">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Not sure which service you need?</h2>
          <p className="text-blue-300 mb-8">Our transport specialists are available to help you choose the right option for your vehicle and budget.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-quote">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white border-0 h-12 px-8">Get a Free Quote</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="h-12 px-8 border-blue-600 text-blue-200">Contact Us</Button>
            </Link>
            <a href="https://wa.me/923059846727" target="_blank" rel="noopener noreferrer">
              <Button className="h-12 px-8 bg-green-600 hover:bg-green-700 text-white border-0">WhatsApp Us</Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
