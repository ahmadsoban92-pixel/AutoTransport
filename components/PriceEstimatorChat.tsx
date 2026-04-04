"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, User, Calculator, HelpCircle } from "lucide-react";

// ─── ZIP Region Matrix ────────────────────────────────────────────────────────
// US ZIP first-digit maps to a geographic region
// Distance matrix (miles) between 10 regions (0–9)
const REGION_CENTERS: Record<number, string> = {
  0: "Northeast (CT/MA/NY/NJ)",
  1: "Mid-Atlantic (PA/NY/DE)",
  2: "Southeast Coast (DC/MD/VA/NC/SC)",
  3: "South (AL/FL/GA/MS/TN)",
  4: "Midwest East (IN/KY/MI/OH)",
  5: "Midwest North (IA/MN/WI/ND/SD)",
  6: "Midwest Central (IL/MO/KS/NE)",
  7: "South Central (TX/OK/LA/AR)",
  8: "Mountain West (CO/AZ/NM/NV/UT)",
  9: "Pacific (CA/OR/WA/AK/HI)",
};

// Symmetric distance matrix in hundreds of miles (approximate straight-line)
const DIST: number[][] = [
  [100,  150,  450,  1050, 700,  1350, 1200, 1700, 2500, 2800], // 0
  [150,  100,  300,  900,  500,  1200, 1050, 1550, 2350, 2700], // 1
  [450,  300,  100,  600,  600,  1300, 1100, 1400, 2200, 2700], // 2
  [1050, 900,  600,  100,  700,  1200, 900,  900,  1900, 2600], // 3
  [700,  500,  600,  700,  100,  700,  500,  1100, 1800, 2300], // 4
  [1350, 1200, 1300, 1200, 700,  100,  400,  900,  1400, 1900], // 5
  [1200, 1050, 1100, 900,  500,  400,  100,  800,  1300, 1900], // 6
  [1700, 1550, 1400, 900,  1100, 900,  800,  100,  900,  1500], // 7
  [2500, 2350, 2200, 1900, 1800, 1400, 1300, 900,  100,  900],  // 8
  [2800, 2700, 2700, 2600, 2300, 1900, 1900, 1500, 900,  100],  // 9
];

function estimateDistance(originZip: string, destZip: string): number {
  const r1 = parseInt(originZip[0]);
  const r2 = parseInt(destZip[0]);
  if (isNaN(r1) || isNaN(r2)) return 1000;
  // Add some variability within a region
  const base = DIST[r1][r2];
  const jitter = Math.round((Math.random() * 0.15 - 0.075) * base);
  return Math.max(100, base + jitter);
}

function calcPrice(miles: number, transport: string, condition: string) {
  let ratePerMile: number;
  if (miles <= 500) ratePerMile = 1.15;
  else if (miles <= 1000) ratePerMile = 0.90;
  else if (miles <= 1500) ratePerMile = 0.78;
  else ratePerMile = 0.65;

  let base = Math.max(350, miles * ratePerMile);
  if (transport === "Enclosed") base *= 1.45;
  if (condition === "Non-Running") base *= 1.15;

  const low = Math.round(base * 0.9 / 25) * 25;
  const high = Math.round(base * 1.1 / 25) * 25;
  return { low, high, miles };
}

// ─── Chat Step Machine ────────────────────────────────────────────────────────
type Step = "greet" | "origin" | "dest" | "vehicle" | "transport" | "condition" | "result";

interface ChatMsg {
  from: "bot" | "user";
  text: string;
}

const VEHICLE_TYPES = ["Sedan", "SUV / Truck", "Van / Minivan", "Luxury / Sports", "Motorcycle", "Other"];
const TRANSPORT_TYPES = ["Open (Standard)", "Enclosed (Premium)"];
const CONDITION_TYPES = ["Running", "Non-Running"];

export default function PriceEstimatorChat() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("greet");
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { from: "bot", text: "👋 Hi! I can give you a rough price estimate for shipping your vehicle. Ready to start?" },
  ]);
  const [input, setInput] = useState("");
  const [data, setData] = useState({ origin: "", dest: "", vehicle: "", transport: "", condition: "" });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const addBot = (text: string) =>
    setMsgs((prev) => [...prev, { from: "bot", text }]);
  const addUser = (text: string) =>
    setMsgs((prev) => [...prev, { from: "user", text }]);

  const handleUserText = async () => {
    const val = input.trim();
    if (!val) return;
    setInput("");
    addUser(val);
    await processText(val);
  };

  const validateZip = async (zip: string): Promise<{ valid: boolean; city?: string; state?: string }> => {
    try {
      const res = await fetch(`/api/validate-zip?zip=${zip}`);
      const data = await res.json();
      return data;
    } catch {
      return { valid: true }; // fail open
    }
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
        setTimeout(() => addBot(`❌ **${val}** doesn't appear to be a valid US ZIP code. Please double-check and try again.`), 400);
        return;
      }
      const location = check.city ? `${check.city}, ${check.state}` : val;
      setData((d) => ({ ...d, origin: val }));
      setStep("dest");
      setTimeout(() => addBot(`✓ **${location}** — got it!\n\nNow what's the **destination ZIP code** (where we're shipping to)?`), 400);
    } else if (step === "dest") {
      if (!/^\d{5}$/.test(val)) {
        setTimeout(() => addBot("Please enter a valid 5-digit US ZIP code for the destination."), 400);
        return;
      }
      const check = await validateZip(val);
      if (!check.valid) {
        setTimeout(() => addBot(`❌ **${val}** doesn't appear to be a valid US ZIP code. Please double-check and try again.`), 400);
        return;
      }
      const location = check.city ? `${check.city}, ${check.state}` : val;
      setData((d) => ({ ...d, dest: val }));
      setStep("vehicle");
      setTimeout(() => addBot(`✓ **${location}** — perfect!\n\nWhat type of vehicle are you shipping? (choose below)`), 400);
    }
  };

  const handleChip = (label: string) => {
    addUser(label);
    if (step === "greet") {
      setStep("origin");
      setTimeout(() => addBot("Great! What's the **origin ZIP code** (where we're shipping from)?"), 400);
    } else if (step === "vehicle") {
      setData((d) => ({ ...d, vehicle: label }));
      setStep("transport");
      setTimeout(() => addBot("Which transport type?"), 400);
    } else if (step === "transport") {
      const isEnclosed = label.startsWith("Enclosed");
      setData((d) => ({ ...d, transport: isEnclosed ? "Enclosed" : "Open" }));
      setStep("condition");
      setTimeout(() => addBot("Is the vehicle **running** (can it be driven onto the carrier)?"), 400);
    } else if (step === "condition") {
      const isNonRunning = label === "Non-Running";
      const newData = { ...data, condition: isNonRunning ? "Non-Running" : "Running" };
      setData(newData);
      setStep("result");
      // Calculate estimate
      setTimeout(() => {
        const miles = estimateDistance(newData.origin, newData.dest);
        const { low, high } = calcPrice(miles, newData.transport, newData.condition);
        addBot(
          `📦 Here's your estimate:\n\n` +
          `🚗 Vehicle: ${newData.vehicle}\n` +
          `📍 Route: ${newData.origin} → ${newData.dest}\n` +
          `📏 Est. Distance: ~${miles} miles\n` +
          `🚛 Transport: ${newData.transport}\n\n` +
          `💰 **Estimated Cost: $${low.toLocaleString()} – $${high.toLocaleString()}**\n\n` +
          `_This is a rough estimate. Final pricing depends on vehicle size, exact route, and carrier availability._\n\nWant an exact quote?`
        );
      }, 600);
    } else if (step === "result") {
      if (label === "Get Exact Quote") {
        window.location.href = "/get-quote";
      } else {
        // Reset
        setStep("greet");
        setData({ origin: "", dest: "", vehicle: "", transport: "", condition: "" });
        setMsgs([{ from: "bot", text: "Let's start a new estimate! Ready?" }]);
      }
    }
  };

  const chips: string[] = (() => {
    if (step === "greet") return ["Yes, let's go!"];
    if (step === "vehicle") return VEHICLE_TYPES;
    if (step === "transport") return TRANSPORT_TYPES;
    if (step === "condition") return CONDITION_TYPES;
    if (step === "result") return ["Get Exact Quote", "Start Over"];
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

            {/* Text Input */}
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
