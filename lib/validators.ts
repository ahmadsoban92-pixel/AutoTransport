import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .transform((val) => val.replace(/\s+/g, " ").trim())
    .refine(
      (val) => {
        // Strip all non-digit chars except leading + to count real digits
        const digits = val.replace(/\D/g, "");
        // Must be 7–15 digits (local to full international)
        if (digits.length < 7 || digits.length > 15) return false;
        // Allow common phone chars: digits, spaces, dashes, dots, parens, plus
        return /^[+\d][\d\s\-.()+]{6,}$/.test(val);
      },
      { message: "Please enter a valid phone number (e.g. (555) 555-5555 or +1 800 555 0100)" }
    ),
  origin_zip: z
    .string()
    .length(5, "ZIP code must be 5 digits")
    .regex(/^\d{5}$/, "ZIP code must contain only numbers"),
  destination_zip: z
    .string()
    .length(5, "ZIP code must be 5 digits")
    .regex(/^\d{5}$/, "ZIP code must contain only numbers"),
  vehicle_make: z.string().min(1, "Vehicle make is required"),
  vehicle_model: z.string().min(1, "Vehicle model is required"),
  vehicle_year: z
    .string()
    .regex(/^\d{4}$/, "Please enter a valid 4-digit year")
    .refine(
      (val) => {
        const year = parseInt(val);
        return year >= 1900 && year <= new Date().getFullYear() + 1;
      },
      { message: "Please enter a valid vehicle year" }
    ),
  transport_type: z.enum(["Open", "Enclosed", "Expedited", "Door-to-Door", "Snowbird/Seasonal"] as const, {
    error: "Please select a transport type",
  }),
  vehicle_condition: z.enum(["Running", "Non-Running"] as const, {
    error: "Please select vehicle condition",
  }),
});

export type LeadFormData = z.infer<typeof leadSchema>;

export const statusUpdateSchema = z.object({
  status: z.enum(["New", "Contacted", "Quoted", "Booked", "Lost"]),
});

export type StatusUpdate = z.infer<typeof statusUpdateSchema>;
