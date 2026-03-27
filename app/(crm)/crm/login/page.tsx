"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Truck, Loader2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function CRMLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Chrome Autofill Blocker ──────────────────────────────────────────────
  // Chrome ignores autoComplete="off" and fills fields before React can stop it.
  // The only reliable block: mount inputs as readOnly, remove readOnly after paint.
  // Chrome never autofills readOnly fields.
  const [inputReady, setInputReady] = useState(false);
  useEffect(() => {
    // Use requestAnimationFrame to fire AFTER the first browser paint
    // This ensures Chrome has no opportunity to autofill before we un-readOnly
    const id = requestAnimationFrame(() => {
      setEmail("");
      setPassword("");
      setInputReady(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);
  // ────────────────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      if (data.session?.access_token) {
        document.cookie = `crm-auth=${data.session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      }
      router.push("/crm/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#060d1f] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Broker Terminal</h1>
          <p className="text-sm text-blue-400 mt-1">WESAutoTransport Internal CRM</p>
        </div>

        <div className="bg-[#0a1628] border border-blue-800/30 rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-white mb-6">Sign in to your account</h2>
          {/* autoComplete="off" on form + readOnly on fields until inputReady */}
          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={!inputReady}
                required
                autoComplete="off"
                placeholder="broker@autotransportpro.com"
                className="w-full rounded-lg border border-blue-800/50 bg-blue-950/40 px-3 py-2.5 text-white text-sm placeholder:text-blue-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  readOnly={!inputReady}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-blue-800/50 bg-blue-950/40 px-3 py-2.5 pr-10 text-white text-sm placeholder:text-blue-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-900/20 border border-red-800/40 text-red-400 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !inputReady}
              className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white border-0 font-semibold"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>
              ) : (
                "Sign In to CRM"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-blue-600 mt-6">
          🔒 This is a restricted internal system. Unauthorized access is prohibited.
        </p>
      </motion.div>
    </div>
  );
}
