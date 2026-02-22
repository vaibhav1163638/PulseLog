import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPatient extends Document {
    doctorId: mongoose.Types.ObjectId;
    name: string;
    age: number;
    gender: "male" | "female" | "other";
    contact: string;
    createdAt: Date;
    updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>(
    {
        doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        name: { type: String, required: true },
        age: { type: Number, required: true },
        gender: { type: String, enum: ["male", "female", "other"], required: true },
        contact: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

PatientSchema.index({ doctorId: 1, name: 1 });

const Patient: Model<IPatient> =
    mongoose.models.Patient || mongoose.model<IPatient>("Patient", PatientSchema);

export default Patient;
