import { cn } from "@/lib/utils";
import {
  IconTruck,
  IconShieldCheck,
  IconClock,
  IconCurrencyDollar,
  IconPhone,
  IconMapPin,
  IconStar,
  IconAward,
} from "@tabler/icons-react";

export function FeaturesSectionWithHoverEffects() {
  const features = [
    {
      title: "Open Transport",
      description:
        "The most popular and cost-effective way to ship your vehicle. Your car is loaded onto an open carrier with other vehicles.",
      icon: <IconTruck />,
    },
    {
      title: "Enclosed Transport",
      description:
        "Premium protection for luxury, classic, or exotic vehicles. Fully enclosed trailers shield your car from the elements.",
      icon: <IconShieldCheck />,
    },
    {
      title: "Expedited Shipping",
      description:
        "Need your vehicle fast? Our expedited service guarantees priority pickup and delivery on your timeline.",
      icon: <IconClock />,
    },
    {
      title: "Best Price Guarantee",
      description:
        "We work with 50,000+ carriers nationwide to get you the most competitive rate. No hidden fees, ever.",
      icon: <IconCurrencyDollar />,
    },
    {
      title: "Door-to-Door Delivery",
      description:
        "We pick up and deliver directly to your specified locations for maximum convenience.",
      icon: <IconMapPin />,
    },
    {
      title: "24/7 Support",
      description:
        "Our dedicated team of transport specialists is available around the clock to answer your questions.",
      icon: <IconPhone />,
    },
    {
      title: "Fully Insured",
      description:
        "All shipments are covered by carrier insurance. Your vehicle is protected from pickup to delivery.",
      icon: <IconStar />,
    },
    {
      title: "Non-Running Vehicles",
      description:
        "We transport inoperable vehicles too. Special equipment and carriers handle non-running cars with care.",
      icon: <IconAward />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature border-blue-900/30",
        (index === 0 || index === 4) && "lg:border-l border-blue-900/30",
        index < 4 && "lg:border-b border-blue-900/30"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-blue-950/50 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-blue-950/50 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-orange-400">{icon}</div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-blue-800 group-hover/feature:bg-orange-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-white">
          {title}
        </span>
      </div>
      <p className="text-sm text-blue-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
