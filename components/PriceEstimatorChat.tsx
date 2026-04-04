"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, User, Calculator, HelpCircle } from "lucide-react";

// ─── Haversine great-circle distance ─────────────────────────────────────────
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// ─── Pricing model ────────────────────────────────────────────────────────────
// Rate-per-mile tiers (road distance ≈ 1.20× straight-line for the US average)
const ROAD_FACTOR = 1.20;

const TRANSPORT_MULTIPLIERS: Record<string, number> = {
  "Open":               1.00,
  "Enclosed":           1.45,
  "Expedited":          1.30,
  "Door-to-Door":       1.20,
  "Snowbird/Seasonal":  0.95,
};

function calcPrice(straightMiles: number, transport: string, condition: string) {
  const miles = Math.round(straightMiles * ROAD_FACTOR);
  let ratePerMile: number;
  if      (miles <= 500)  ratePerMile = 1.15;
  else if (miles <= 1000) ratePerMile = 0.90;
  else if (miles <= 1500) ratePerMile = 0.78;
  else                    ratePerMile = 0.65;

  let base = Math.max(350, miles * ratePerMile);
  base *= (TRANSPORT_MULTIPLIERS[transport] ?? 1.0);
  if (condition === "Non-Running") base *= 1.15;

  const low  = Math.round(base * 0.90 / 25) * 25;
  const high = Math.round(base * 1.10 / 25) * 25;
  return { low, high, miles };
}

// ─── Chat Step Machine ────────────────────────────────────────────────────────
type Step = "greet" | "origin" | "dest" | "vehicle" | "transport" | "condition" | "result";

interface ChatMsg { from: "bot" | "user"; text: string; }

const VEHICLE_TYPES  = ["Sedan", "SUV / Truck", "Van / Minivan", "Luxury / Sports", "Motorcycle", "Other"];
const TRANSPORT_TYPES = [
  "Open (Standard)",
  "Enclosed (Premium)",
  "Expedited (Rush)",
  "Door-to-Door",
  "Snowbird/Seasonal",
];
const CONDITION_TYPES = ["Running", "Non-Running"];

// Map display label → internal key
const TRANSPORT_LABEL_MAP: Record<string, string> = {
  "Open (Standard)":    "Open",
  "Enclosed (Premium)": "Enclosed",
  "Expedited (Rush)":   "Expedited",
  "Door-to-Door":       "Door-to-Door",
  "Snowbird/Seasonal":  "Snowbird/Seasonal",
};

export default function PriceEstimatorChat() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("greet");
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { from: "bot", text: "👋 Hi! I can give you a rough price estimate for shipping your vehicle. Ready to start?" },
  ]);
  const [input, setInput] = useState("");
  const [data, setData] = useState({
    origin: "", dest: "", originLat: 0, originLng: 0, destLat: 0, destLng: 0,
    vehicle: "", transport: "", condition: "",
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const addBot  = (text: string) => setMsgs((p) => [...p, { from: "bot",  text }]);
  const addUser = (text: string) => setMsgs((p) => [...p, { from: "user", text }]);

  // ── ZIP validation (returns lat/lng for accurate distance) ────────────────
  const validateZip = async (zip: string): Promise<{ valid: boolean; city?: string; state?: string; lat?: number; lng?: number }> => {
    try {
      const res = await fetch(`/api/validate-zip?zip=${zip}`);
      return await res.json();
    } catch {
      return { valid: true };
    }
  };

  // ── Text input handler (origin / dest ZIPs) ───────────────────────────────
  const handleUserText = async () => {
    const val = input.trim();
    if (!val) return;
    setInput("");
    addUser(val);
    await processText(val);
  };

  const processText = async (val: string) => {
    if (step === "greet") {
      setStep("origin");
      setTimeout(() => addBot("Great! What's the **origin ZIP code** (where we're shipping from)?"), 400);

    } else if (step === "origin") {
      if (!/^\d{5}$/.test(val)) {
        setTimeout(() => addBot("Please enter a valid 5-digit US ZIP code for the origin."), 400);
        return;
      }
      const check = await validateZip(val);
      if (!check.valid) {
        setTimeout(() => addBot(`❌ **${val}** doesn't appear to be a valid US ZIP code. Please try again.`), 400);
        return;
      }
      const location = check.city ? `${check.city}, ${check.state}` : val;
      setData((d) => ({ ...d, origin: val, originLat: check.lat ?? 0, originLng: check.lng ?? 0 }));
      setStep("dest");
      setTimeout(() => addBot(`✓ **${location}** — got it!\n\nNow what's the **destination ZIP code** (where we're shipping to)?`), 400);

    } else if (step === "dest") {
      if (!/^\d{5}$/.test(val)) {
        setTimeout(() => addBot("Please enter a valid 5-digit US ZIP code for the destination."), 400);
        return;
      }
      const check = await validateZip(val);
      if (!check.valid) {
        setTimeout(() => addBot(`❌ **${val}** doesn't appear to be a valid US ZIP code. Please try again.`), 400);
        return;
      }
      const location = check.city ? `${check.city}, ${check.state}` : val;
      setData((d) => ({ ...d, dest: val, destLat: check.lat ?? 0, destLng: check.lng ?? 0 }));
      setStep("vehicle");
      setTimeout(() => addBot(`✓ **${location}** — perfect!\n\nWhat type of vehicle are you shipping? (choose below)`), 400);
    }
  };

  // ── Chip selection handler ────────────────────────────────────────────────
  const handleChip = (label: string) => {
    addUser(label);

    if (step === "greet") {
      setStep("origin");
      setTimeout(() => addBot("Great! What's the **origin ZIP code** (where we're shipping from)?"), 400);

    } else if (step === "vehicle") {
      setData((d) => ({ ...d, vehicle: label }));
      setStep("transport");
      setTimeout(() => addBot("Which transport type would you like?\n\n• **Open** — most popular & affordable\n• **Enclosed** — premium protection\n• **Expedited** — rush pickup & delivery\n• **Door-to-Door** — maximum convenience\n• **Snowbird/Seasonal** — seasonal routes"), 400);

    } else if (step === "transport") {
      const transportKey = TRANSPORT_LABEL_MAP[label] ?? "Open";
      setData((d) => ({ ...d, transport: transportKey }));
      setStep("condition");
      setTimeout(() => addBot("Is the vehicle **running** (can it be driven onto the carrier)?"), 400);

    } else if (step === "condition") {
      const newData = { ...data, condition: label };
      setData(newData);
      setStep("result");

      setTimeout(() => {
        // Use Haversine for accurate distance
        const straightMiles = haversine(newData.originLat, newData.originLng, newData.destLat, newData.destLng);
        const { low, high, miles } = calcPrice(straightMiles, newData.transport, newData.condition);
        addBot(
          `📦 Here's your estimate:\n\n` +
          `🚗 Vehicle: ${newData.vehicle}\n` +
          `📍 Route: ${newData.origin} → ${newData.dest}\n` +
          `📏 Est. Distance: ~${miles.toLocaleString()} miles (driving)\n` +
          `🚛 Transport: ${newData.transport}\n\n` +
          `💰 **Estimated Cost: $${low.toLocaleString()} – $${high.toLocaleString()}**\n\n` +
          `_This is a rough estimate. Final pricing depends on vehicle size, exact route, and carrier availability._\n\nWant an exact quote?`
        );
      }, 600);

    } else if (step === "result") {
      if (label === "Get Exact Quote") {
        window.location.href = "/get-quote";
      } else {
        setStep("greet");
        setData({ origin: "", dest: "", originLat: 0, originLng: 0, destLat: 0, destLng: 0, vehicle: "", transport: "", condition: "" });
        setMsgs([{ from: "bot", text: "Let's start a new estimate! Ready?" }]);
      }
    }
  };

  const chips: string[] = (() => {
    if (step === "greet")     return ["Yes, let's go!"];
    if (step === "vehicle")   return VEHICLE_TYPES;
    if (step === "transport") return TRANSPORT_TYPES;
    if (step === "condition") return CONDITION_TYPES;
    if (step === "result")    return ["Get Exact Quote", "Start Over"];
    return [];
  })();

  const showInput = step === "origin" || step === "dest";

  return (
    <>
      {/* ── Floating Trigger Button ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open price estimator"
        className="fixed bottom-24 right-5 sm:bottom-6 sm:right-6 z-[60] w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-6 h-6" />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Calculator className="w-6 h-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-40 right-3 sm:bottom-24 sm:right-6 z-[60] w-[calc(100vw-24px)] sm:w-96 max-h-[70vh] flex flex-col rounded-2xl bg-[#0a1628] border border-blue-800/40 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Calculator className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">Price Estimator</p>
                <p className="text-orange-100 text-xs">WESAutoTransport · Instant estimate</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {msgs.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.from === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${msg.from === "bot" ? "bg-orange-500/20" : "bg-blue-700/30"}`}>
                    {msg.from === "bot" ? <Bot className="w-4 h-4 text-orange-400" /> : <User className="w-4 h-4 text-blue-300" />}
                  </div>
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${msg.from === "bot" ? "bg-blue-950/60 text-blue-100 rounded-tl-sm" : "bg-orange-500 text-white rounded-tr-sm"}`}>
                    {msg.text.split("**").map((part, j) =>
                      j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Chips */}
            {chips.length > 0 && (
              <div className="px-4 pb-3 flex flex-wrap gap-2">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleChip(chip)}
                    className="text-xs px-3 py-1.5 rounded-full border border-orange-500/40 bg-orange-500/10 text-orange-300 hover:bg-orange-500/25 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Text Input (ZIP entry) */}
            {showInput && (
              <div className="px-3 pb-3">
                <a
                  href="/zip-code-guide"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-orange-400 transition-colors mb-2"
                >
                  <HelpCircle className="w-3 h-3" />
                  Don't know your ZIP code? Click here
                </a>
                <div className="flex items-center gap-2 bg-blue-950/60 border border-blue-800/40 rounded-xl px-3 py-2">
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={5}
                    value={input}
                    onChange={(e) => setInput(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && handleUserText()}
                    placeholder="Enter 5-digit ZIP..."
                    className="flex-1 bg-transparent text-white text-sm placeholder:text-blue-500 outline-none"
                  />
                  <button onClick={handleUserText} className="text-orange-400 hover:text-orange-300 transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
