import { z } from "zod";

export const patientFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    age: z.coerce.number().min(0, "Age must be positive").max(150, "Invalid age"),
    gender: z.enum(["male", "female", "other"], {
        required_error: "Please select a gender",
    }),
    contact: z.string().min(5, "Contact must be at least 5 characters"),
    consent: z.literal(true, {
        errorMap: () => ({ message: "You must obtain patient consent before recording" }),
    }),
});

export type PatientFormData = z.infer<typeof patientFormSchema>;

export const reportUpdateSchema = z.object({
    symptoms: z.array(z.string()),
    observations: z.array(z.string()),
    diagnosis: z.string(),
    prescribed_medicines: z.array(
        z.object({
            name: z.string(),
            dosage: z.string(),
            duration: z.string(),
        })
    ),
    doctor_notes: z.string(),
});

export type ReportUpdateData = z.infer<typeof reportUpdateSchema>;

export const settingsSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    clinicName: z.string().optional(),
});

export type SettingsData = z.infer<typeof settingsSchema>;
