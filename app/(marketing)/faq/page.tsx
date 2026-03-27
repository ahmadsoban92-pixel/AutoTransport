"use client";

import { FaqSection } from "@/components/ui/faq";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const faqs = [
  {
    question: "How much does it cost to ship a car?",
    answer:
      "The cost of auto transport varies depending on the distance, vehicle type, transport method (open vs. enclosed), and current market conditions. On average, shipping a car costs between $500–$1,500 for standard routes. Get a free, personalized quote to see your exact price.",
  },
  {
    question: "How long does it take to ship a car?",
    answer:
      "Delivery times depend on the distance. Short routes (under 500 miles) typically take 1–3 days. Medium distances (500–1,500 miles) take 3–5 days. Cross-country shipments (over 1,500 miles) take 7–10 days. Exact timing also depends on carrier availability.",
  },
  {
    question: "Is my vehicle insured during transport?",
    answer:
      "Yes. All carriers in our network are required to maintain active cargo insurance under FMCSA regulations. Your vehicle is covered from the moment it's loaded onto the trailer until it's delivered to you. We recommend documenting your vehicle's condition before pickup.",
  },
  {
    question: "What is the difference between open and enclosed transport?",
    answer:
      "Open transport uses an open multi-car trailer (the kind you see on highways). It's the most affordable option and perfectly safe for standard vehicles. Enclosed transport uses a fully covered trailer, providing extra protection from weather and road debris. It's ideal for luxury, classic, or exotic vehicles.",
  },
  {
    question: "Can you ship a non-running vehicle?",
    answer:
      "Absolutely. We ship inoperable vehicles regularly. We use specialized carriers with winches and ramps to safely load non-running cars. There may be a small additional fee for this service. Just indicate your vehicle's condition in your quote request.",
  },
  {
    question: "Do I need to be present at pickup and delivery?",
    answer:
      "For pickup and delivery, a representative authorized by you should be present to inspect the vehicle and sign the Bill of Lading. If you cannot be there personally, you can designate someone you trust. We'll work with your schedule.",
  },
  {
    question: "How do I prepare my vehicle for transport?",
    answer:
      "We recommend: 1) Remove personal belongings (carriers aren't insured for items inside the car), 2) Leave 1/4 tank of gas or less, 3) Check for leaks, 4) Document existing damage with photos, 5) Disable car alarms, 6) Ensure the vehicle is accessible for the carrier.",
  },
  {
    question: "Can I ship personal items inside my vehicle?",
    answer:
      "Most carriers allow up to 100 lbs of personal items in the trunk, but these are NOT covered by carrier insurance. Customs regulations also apply for international shipments. We recommend moving personal items separately to avoid complications.",
  },
  {
    question: "What happens if my vehicle is damaged during transport?",
    answer:
      "In the rare event of damage, document everything immediately at delivery and note it on the Bill of Lading before signing. Contact us right away and we'll work with the carrier's insurance to file a claim on your behalf.",
  },
  {
    question: "How do I track my vehicle during transport?",
    answer:
      "Once your carrier is assigned, you'll receive a dispatch confirmation with the driver's contact information. You can call or text the driver directly for status updates. Many of our carriers also have GPS tracking available.",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-[#060d1f] pt-28">
      {/* Header with image */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden mb-8">
            <Image src="/faq-support.png" alt="Customer Support" width={1200} height={300} className="w-full h-44 md:h-56 object-cover" />
            <div className="img-overlay absolute inset-0 bg-gradient-to-t from-[#060d1f] via-[#060d1f]/40 to-transparent" />
          </div>
          <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">Got Questions?</span>
          <h1 className="text-5xl font-bold text-white mt-3 mb-4">Frequently Asked Questions</h1>
          <p className="text-blue-300">
            Everything you need to know about shipping your vehicle with WESAutoTransport.
          </p>
        </div>
      </section>

      {/* FAQ Component */}
      <FaqSection
        title=""
        items={faqs}
        contactInfo={{
          title: "Still have questions?",
          description: "Our transport specialists are available to help you Mon–Fri 8am–8pm ET",
          buttonText: "Contact Support",
          onContact: () => {
            window.location.href = "/contact";
          },
        }}
      />

      {/* CTA */}
      <section className="py-16 px-6 text-center bg-[#0a1628] border-t border-blue-900/30 mt-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-blue-300 mb-6">Fill out our simple form and get a free quote in seconds.</p>
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
