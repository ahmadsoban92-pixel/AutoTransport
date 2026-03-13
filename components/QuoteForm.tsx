"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { leadSchema, LeadFormData } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";

const VEHICLE_MAKES = [
  "Acura","Audi","BMW","Buick","Cadillac","Chevrolet","Chrysler","Dodge",
  "Ferrari","Ford","GMC","Honda","Hyundai","Infiniti","Jeep","Kia",
  "Land Rover","Lexus","Lincoln","Mazda","Mercedes-Benz","Mitsubishi",
  "Nissan","Porsche","RAM","Subaru","Tesla","Toyota","Volkswagen","Volvo","Other"
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 40 }, (_, i) => currentYear + 1 - i);

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function FormField({ label, error, required = true, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-blue-200">
        {label} {required && <span className="text-orange-400">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-blue-800/50 bg-blue-950/40 px-3 py-2.5 text-white text-sm placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all";

const selectClass =
  "w-full rounded-lg border border-blue-800/50 bg-blue-950/40 px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all";

export function QuoteForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  });

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        ...data,
        vehicle_year: parseInt(data.vehicle_year),
        created_at: new Date().toISOString(),
      };

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit quote request.");
      }

      router.push("/thank-you");
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Section: Contact Info */}
      <div>
        <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-4">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Full Name" error={errors.name?.message}>
            <input
              {...register("name")}
              placeholder="John Smith"
              className={inputClass}
            />
          </FormField>
          <FormField label="Email Address" error={errors.email?.message}>
            <input
              {...register("email")}
              type="email"
              placeholder="john@example.com"
              className={inputClass}
            />
          </FormField>
          <FormField label="Phone Number" error={errors.phone?.message}>
            <input
              {...register("phone")}
              type="tel"
              placeholder="(800) 555-0100"
              className={inputClass}
            />
          </FormField>
        </div>
      </div>

      {/* Section: Route */}
      <div>
        <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-4">
          Shipping Route
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Pickup ZIP Code" error={errors.origin_zip?.message}>
            <input
              {...register("origin_zip")}
              placeholder="90210"
              maxLength={5}
              className={inputClass}
            />
          </FormField>
          <FormField label="Delivery ZIP Code" error={errors.destination_zip?.message}>
            <input
              {...register("destination_zip")}
              placeholder="10001"
              maxLength={5}
              className={inputClass}
            />
          </FormField>
        </div>
      </div>

      {/* Section: Vehicle */}
      <div>
        <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-4">
          Vehicle Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Vehicle Make" error={errors.vehicle_make?.message}>
            <select {...register("vehicle_make")} className={selectClass}>
              <option value="" className="bg-blue-950">Select make...</option>
              {VEHICLE_MAKES.map((make) => (
                <option key={make} value={make} className="bg-blue-950">
                  {make}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Vehicle Model" error={errors.vehicle_model?.message}>
            <input
              {...register("vehicle_model")}
              placeholder="Camry, F-150, Model 3..."
              className={inputClass}
            />
          </FormField>
          <FormField label="Vehicle Year" error={errors.vehicle_year?.message}>
            <select {...register("vehicle_year")} className={selectClass}>
              <option value="" className="bg-blue-950">Select year...</option>
              {years.map((year) => (
                <option key={year} value={year} className="bg-blue-950">
                  {year}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </div>

      {/* Section: Transport Options */}
      <div>
        <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-4">
          Transport Options
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Transport Type" error={errors.transport_type?.message}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { value: "Open", sub: "Most popular & affordable" },
                { value: "Enclosed", sub: "Premium protection" },
                { value: "Expedited", sub: "Priority pickup & delivery" },
                { value: "Door-to-Door", sub: "Maximum convenience" },
                { value: "Snowbird/Seasonal", sub: "Seasonal routes" },
              ].map(({ value, sub }) => (
                <label
                  key={value}
                  className="flex items-center gap-2 p-3 rounded-lg border border-blue-800/50 bg-blue-950/20 cursor-pointer hover:border-orange-500/50 transition-all"
                >
                  <input
                    {...register("transport_type")}
                    type="radio"
                    value={value}
                    className="accent-orange-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-white">{value}</div>
                    <div className="text-xs text-blue-400">{sub}</div>
                  </div>
                </label>
              ))}
            </div>
          </FormField>
          <FormField label="Vehicle Condition" error={errors.vehicle_condition?.message}>
            <div className="grid grid-cols-2 gap-3">
              {["Running", "Non-Running"].map((cond) => (
                <label
                  key={cond}
                  className="flex items-center gap-2 p-3 rounded-lg border border-blue-800/50 bg-blue-950/20 cursor-pointer hover:border-orange-500/50 transition-all"
                >
                  <input
                    {...register("vehicle_condition")}
                    type="radio"
                    value={cond}
                    className="accent-orange-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-white">{cond}</div>
                    <div className="text-xs text-blue-400">
                      {cond === "Running" ? "Drives normally" : "Needs towing"}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </FormField>
        </div>
      </div>

      {submitError && (
        <div className="p-4 rounded-lg bg-red-900/20 border border-red-800/50 text-red-400 text-sm">
          {submitError}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-base border-0 rounded-lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting your request...
          </>
        ) : (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Get My Free Quote
          </>
        )}
      </Button>

      <p className="text-center text-xs text-blue-400">
        🔒 Your information is 100% secure and will never be sold. We&apos;ll only use it to contact you about your shipment.
      </p>
    </motion.form>
  );
}
