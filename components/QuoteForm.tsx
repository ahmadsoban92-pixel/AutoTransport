"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { leadSchema, LeadFormData } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, HelpCircle, Upload, X, CheckCircle } from "lucide-react";

const VEHICLE_MAKES = [
  "Acura","Audi","BMW","Buick","Cadillac","Chevrolet","Chrysler","Dodge",
  "Ferrari","Ford","GMC","Honda","Hyundai","Infiniti","Jeep","Kia",
  "Land Rover","Lexus","Lincoln","Mazda","Mercedes-Benz","Mitsubishi",
  "Nissan","Porsche","RAM","Subaru","Tesla","Toyota","Volkswagen","Volvo","Other"
];

const TRANSPORT_OPTIONS = [
  { value: "Open", sub: "Most popular & affordable" },
  { value: "Enclosed", sub: "Premium protection" },
  { value: "Expedited", sub: "Priority pickup & delivery" },
  { value: "Door-to-Door", sub: "Maximum convenience" },
  { value: "Snowbird/Seasonal", sub: "Seasonal routes" },
] as const;

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 40 }, (_, i) => currentYear + 1 - i);

interface FormFieldProps {
  label: React.ReactNode;
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
  const searchParams = useSearchParams();
  const preselectedType = searchParams.get("type") || "";
  const preselectedCondition = searchParams.get("condition") || "";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>(preselectedType);

  // ZIP validation state
  const [originZipInfo, setOriginZipInfo] = useState<{ valid: boolean; city?: string; state?: string; checked?: boolean } | null>(null);
  const [destZipInfo, setDestZipInfo] = useState<{ valid: boolean; city?: string; state?: string; checked?: boolean } | null>(null);
  const [checkingZip, setCheckingZip] = useState<"origin" | "dest" | null>(null);

  // Car image state
  const [carImageFile, setCarImageFile] = useState<File | null>(null);
  const [carImagePreview, setCarImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      transport_type: (preselectedType as any) || undefined,
      vehicle_condition: (preselectedCondition as any) || undefined,
    },
  });

  const validateZip = async (zip: string, field: "origin" | "dest") => {
    if (!/^\d{5}$/.test(zip)) return;
    setCheckingZip(field);
    try {
      const res = await fetch(`/api/validate-zip?zip=${zip}`);
      const data = await res.json();
      if (field === "origin") setOriginZipInfo({ ...data, checked: true });
      else setDestZipInfo({ ...data, checked: true });
    } catch {
      if (field === "origin") setOriginZipInfo({ valid: true, checked: true });
      else setDestZipInfo({ valid: true, checked: true });
    }
    setCheckingZip(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB");
      return;
    }
    setCarImageFile(file);
    setCarImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: LeadFormData) => {
    // Block if ZIP invalid
    if (originZipInfo?.checked && !originZipInfo.valid) {
      setSubmitError("Please enter a valid pickup ZIP code.");
      return;
    }
    if (destZipInfo?.checked && !destZipInfo.valid) {
      setSubmitError("Please enter a valid delivery ZIP code.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Upload car image if present
      let carImageUrl: string | null = null;
      if (carImageFile) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append("file", carImageFile);
        const uploadRes = await fetch("/api/upload-car-image", { method: "POST", body: formData });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          carImageUrl = uploadData.url ?? null;
        }
        setUploadingImage(false);
      }

      const payload = {
        ...data,
        vehicle_year: parseInt(data.vehicle_year),
        created_at: new Date().toISOString(),
        ...(carImageUrl ? { car_image_url: carImageUrl } : {}),
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
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
      setUploadingImage(false);
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
            <input {...register("name")} placeholder="John Smith" className={inputClass} />
          </FormField>
          <FormField label="Email Address" error={errors.email?.message}>
            <input {...register("email")} type="email" placeholder="john@example.com" className={inputClass} />
          </FormField>
          <FormField label="Phone Number" error={errors.phone?.message}>
            <input {...register("phone")} type="tel" placeholder="(800) 555-0100" className={inputClass} />
          </FormField>
        </div>
      </div>

      {/* Section: Route */}
      <div>
        <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-4">
          Shipping Route
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={
              <span className="flex items-center gap-1.5">
                Pickup ZIP Code
                <Link href="/zip-code-guide" target="_blank"
                  className="inline-flex items-center gap-0.5 text-[10px] text-blue-400 hover:text-orange-400 transition-colors font-normal"
                  title="What is a ZIP code?">
                  <HelpCircle className="w-3 h-3" /> What's this?
                </Link>
              </span>
            }
            error={errors.origin_zip?.message}>
            <div className="relative">
              <input
                {...register("origin_zip")}
                placeholder="e.g. 90210"
                maxLength={5}
                className={inputClass}
                onBlur={(e) => validateZip(e.target.value, "origin")}
              />
              {checkingZip === "origin" && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2"><Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" /></div>
              )}
            </div>
            {originZipInfo?.checked && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${originZipInfo.valid ? "text-green-400" : "text-red-400"}`}>
                {originZipInfo.valid
                  ? <><CheckCircle className="w-3 h-3" /> {originZipInfo.city ? `${originZipInfo.city}, ${originZipInfo.state}` : "Valid ZIP"}</>
                  : <>⚠ ZIP code not found in US postal system</>}
              </p>
            )}
          </FormField>
          <FormField
            label={
              <span className="flex items-center gap-1.5">
                Delivery ZIP Code
                <Link href="/zip-code-guide" target="_blank"
                  className="inline-flex items-center gap-0.5 text-[10px] text-blue-400 hover:text-orange-400 transition-colors font-normal"
                  title="What is a ZIP code?">
                  <HelpCircle className="w-3 h-3" /> What's this?
                </Link>
              </span>
            }
            error={errors.destination_zip?.message}>
            <div className="relative">
              <input
                {...register("destination_zip")}
                placeholder="e.g. 10001"
                maxLength={5}
                className={inputClass}
                onBlur={(e) => validateZip(e.target.value, "dest")}
              />
              {checkingZip === "dest" && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2"><Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" /></div>
              )}
            </div>
            {destZipInfo?.checked && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${destZipInfo.valid ? "text-green-400" : "text-red-400"}`}>
                {destZipInfo.valid
                  ? <><CheckCircle className="w-3 h-3" /> {destZipInfo.city ? `${destZipInfo.city}, ${destZipInfo.state}` : "Valid ZIP"}</>
                  : <>⚠ ZIP code not found in US postal system</>}
              </p>
            )}
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
                <option key={make} value={make} className="bg-blue-950">{make}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Vehicle Model" error={errors.vehicle_model?.message}>
            <input {...register("vehicle_model")} placeholder="Camry, F-150, Model 3..." className={inputClass} />
          </FormField>
          <FormField label="Vehicle Year" error={errors.vehicle_year?.message}>
            <select {...register("vehicle_year")} className={selectClass}>
              <option value="" className="bg-blue-950">Select year...</option>
              {years.map((year) => (
                <option key={year} value={year} className="bg-blue-950">{year}</option>
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
              {TRANSPORT_OPTIONS.map(({ value, sub }) => (
                <label
                  key={value}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedType === value
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-blue-800/50 bg-blue-950/20 hover:border-orange-500/50"
                  }`}
                >
                  <input
                    {...register("transport_type")}
                    type="radio"
                    value={value}
                    checked={selectedType === value}
                    onChange={() => {
                      setSelectedType(value);
                      setValue("transport_type", value as any);
                    }}
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

      {/* Section: Vehicle Photo (Optional) */}
      <div>
        <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-4">
          Vehicle Photo <span className="text-blue-500 font-normal normal-case">(Optional)</span>
        </h3>
        <div
          onClick={() => imageInputRef.current?.click()}
          className="relative border-2 border-dashed border-blue-800/50 hover:border-orange-500/50 rounded-xl p-6 cursor-pointer transition-all text-center group"
        >
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageChange}
          />
          {carImagePreview ? (
            <div className="relative">
              <img src={carImagePreview} alt="Car preview" className="mx-auto max-h-48 rounded-lg object-contain" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setCarImageFile(null); setCarImagePreview(null); }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <p className="text-xs text-blue-400 mt-2">{carImageFile?.name} — click to change</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-blue-400 group-hover:text-orange-400 transition-colors">
              <Upload className="w-8 h-8" />
              <p className="text-sm font-medium">Upload a photo of your vehicle</p>
              <p className="text-xs text-blue-600">JPG, PNG or WebP · Max 5MB</p>
            </div>
          )}
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
