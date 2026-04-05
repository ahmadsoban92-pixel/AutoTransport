// components/home/HowItWorksSection.tsx
// Server component — static content, no client interactivity.
import { MapPin, Truck, CheckCircle, Shield, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Get a Free Quote",
    desc: "Fill out our simple form with your vehicle and route details. It takes less than 60 seconds.",
    icon: MapPin,
  },
  {
    number: "02",
    title: "We Find Your Carrier",
    desc: "Our team searches our network of 50,000+ vetted carriers to find the best match for your shipment.",
    icon: Truck,
  },
  {
    number: "03",
    title: "Your Car Gets Picked Up",
    desc: "A certified driver arrives at your door to load your vehicle and begin the journey.",
    icon: CheckCircle,
  },
  {
    number: "04",
    title: "Safe Delivery",
    desc: "Your vehicle arrives at the destination. Inspect it and sign off — it's that simple.",
    icon: Shield,
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-[#060d1f]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">
            Simple Process
          </span>
          <h2 className="text-4xl font-bold text-white mt-3">How Auto Transport Works</h2>
          <p className="text-blue-300 mt-4 max-w-2xl mx-auto">
            We&apos;ve simplified the car shipping process into 4 easy steps. From quote to delivery,
            we handle everything.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative group">
                <div className="relative p-6 rounded-2xl border border-blue-800/30 bg-blue-950/20 hover:border-orange-500/40 hover:bg-blue-950/40 transition-all duration-300">
                  <div className="text-5xl font-black text-blue-900/40 absolute top-4 right-4">
                    {step.number}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-blue-300 leading-relaxed">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 z-10">
                    <ArrowRight className="w-4 h-4 text-orange-400/50" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
