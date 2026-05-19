"use client";

import { motion } from "framer-motion";
import { CheckCircle, Circle, Package, Clock, FileCheck, Truck, Navigation, MapPin } from "lucide-react";
import type { LeadStatus } from "@/types/lead";

// Customer-facing shipment steps
// NOTE: "Booked" is an internal CRM-only status (payment confirmed) — not shown on the tracker.
// The tracker shows 6 meaningful customer-facing milestones.
const STEPS: {
  status:  LeadStatus;
  label:   string;
  desc:    string;
  icon:    React.ElementType;
}[] = [
  { status: "New",          label: "Order Placed",     desc: "Your shipment request has been received and is being reviewed.",   icon: Package    },
  { status: "Contacted",    label: "Broker Assigned",  desc: "A dedicated broker has been assigned to your order.",              icon: Clock      },
  { status: "Quoted",       label: "Quote Confirmed",  desc: "Your transport price has been finalised and agreed.",              icon: FileCheck  },
  { status: "Dispatched",   label: "Vehicle Picked Up",desc: "Your vehicle has been collected by the carrier.",                  icon: Truck      },
  { status: "In Transit",   label: "In Transit",       desc: "Your vehicle is on its way to the delivery location.",            icon: Navigation },
  { status: "Delivered",    label: "Delivered",        desc: "Your vehicle has arrived safely at its destination. Enjoy!",      icon: MapPin     },
];

// Map broker status → active step index (-1 = no active step)
function getActiveIndex(status: LeadStatus): number {
  const map: Partial<Record<LeadStatus, number>> = {
    New:          0,
    Contacted:    1,
    Quoted:       2,
    Booked:       2,   // Booked = payment confirmed, tracker stays at "Quote Confirmed"
    Dispatched:   3,
    "In Transit": 4,
    Delivered:    5,
    Lost:         -1,
  };
  return map[status] ?? 0;
}

export function ShipmentTimeline({ status }: { status: LeadStatus }) {
  const activeIndex = getActiveIndex(status);

  if (status === "Lost") {
    return (
      <div className="p-6 rounded-2xl bg-red-900/20 border border-red-800/40 text-center">
        <p className="text-red-400 font-semibold">This shipment order is no longer active.</p>
        <p className="text-red-400/60 text-sm mt-1">Please contact us if you believe this is an error.</p>
      </div>
    );
  }

  return (
    <div className="relative" role="list" aria-label="Shipment progress timeline">
      {STEPS.map((step, idx) => {
        const isCompleted = idx < activeIndex;
        const isActive    = idx === activeIndex;
        const isPending   = idx > activeIndex;
        const Icon        = step.icon;

        return (
          <motion.div
            key={step.label}
            role="listitem"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.07, duration: 0.35 }}
            className="flex gap-4 mb-2 last:mb-0"
          >
            {/* Icon + connector */}
            <div className="flex flex-col items-center">
              <div
                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-500 ${
                  isCompleted
                    ? "bg-green-500/20 border-green-500 text-green-400"
                    : isActive
                    ? "bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_14px_rgba(249,115,22,0.35)]"
                    : "bg-blue-950/40 border-blue-800/50 text-blue-700"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : isActive ? (
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <Icon className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`w-0.5 flex-1 my-1 rounded-full transition-colors duration-500 ${
                    isCompleted ? "bg-green-500/50" : "bg-blue-900/40"
                  }`}
                  style={{ minHeight: "2rem" }}
                />
              )}
            </div>

            {/* Text */}
            <div className={`pb-6 ${idx === STEPS.length - 1 ? "pb-0" : ""}`}>
              <p className={`font-semibold text-sm leading-tight ${
                isCompleted ? "text-green-400" : isActive ? "text-orange-400" : "text-blue-600"
              }`}>
                {step.label}
                {isActive && (
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 font-medium uppercase tracking-wider">
                    Current
                  </span>
                )}
              </p>
              <p className={`text-xs mt-0.5 leading-relaxed ${isPending ? "text-blue-800" : "text-blue-400"}`}>
                {step.desc}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
