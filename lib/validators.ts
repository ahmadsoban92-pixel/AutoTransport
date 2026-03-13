import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[\d\s\-\+\(\)]+$/, "Please enter a valid phone number"),
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
