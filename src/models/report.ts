import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMedicine {
    name: string;
    dosage: string;
    duration: string;
}

export interface IStructuredData {
    symptoms: string[];
    observations: string[];
    diagnosis: string;
    prescribed_medicines: IMedicine[];
    doctor_notes: string;
}

export interface IReport extends Document {
    doctorId: mongoose.Types.ObjectId;
    patientId: mongoose.Types.ObjectId;
    transcription: string;
    structuredData: IStructuredData;
    pdfUrl: string | null;
    status: "draft" | "finalized";
    createdAt: Date;
    updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
    {
        doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
        transcription: { type: String, default: "" },
        structuredData: {
            type: Schema.Types.Mixed,
            default: {
                symptoms: [],
                observations: [],
                diagnosis: "",
                prescribed_medicines: [],
                doctor_notes: "",
            },
        },
        pdfUrl: { type: String, default: null },
        status: { type: String, enum: ["draft", "finalized"], default: "draft" },
    },
    {
        timestamps: true,
    }
);

ReportSchema.index({ doctorId: 1, createdAt: -1 });

const Report: Model<IReport> =
    mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema);

export default Report;
