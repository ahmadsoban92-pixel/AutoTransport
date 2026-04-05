// components/home/ServicesSection.tsx
// Server component — wraps the feature section with heading.
import { FeaturesSectionWithHoverEffects } from "@/components/ui/feature-section-with-hover-effects";

export function ServicesSection() {
  return (
    <section className="py-24 px-6 bg-[#0a1628]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">
            What We Offer
          </span>
          <h2 className="text-4xl font-bold text-white mt-3">Our Transport Services</h2>
        </div>
        <FeaturesSectionWithHoverEffects />
      </div>
    </section>
  );
}
