import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAudioFile extends Document {
    doctorId: mongoose.Types.ObjectId;
    patientId: mongoose.Types.ObjectId;
    reportId: mongoose.Types.ObjectId;
    fileUrl: string;
    createdAt: Date;
    updatedAt: Date;
}

const AudioFileSchema = new Schema<IAudioFile>(
    {
        doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
        reportId: { type: Schema.Types.ObjectId, ref: "Report", required: true },
        fileUrl: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

const AudioFile: Model<IAudioFile> =
    mongoose.models.AudioFile || mongoose.model<IAudioFile>("AudioFile", AudioFileSchema);

export default AudioFile;
