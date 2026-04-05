// components/home/StatsSection.tsx
// Server component — no interactivity needed, renders on the server.
import { Truck, Clock, Users, Award } from "lucide-react";

const stats = [
  { value: "50,000+", label: "Vehicles Shipped",  icon: Truck  },
  { value: "98.7%",   label: "On-Time Delivery",  icon: Clock  },
  { value: "15,000+", label: "Happy Customers",   icon: Users  },
  { value: "A+",      label: "BBB Rating",        icon: Award  },
];

export function StatsSection() {
  return (
    <section className="bg-[#0a1628] border-y border-blue-900/30">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center">
              <stat.icon className="w-6 h-6 text-orange-400 mb-2" />
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-blue-300 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
