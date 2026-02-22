import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    image: string;
    provider: string;
    role: "doctor" | "admin";
    clinicName: string | null;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, index: true },
        image: { type: String, default: "" },
        provider: { type: String, required: true },
        role: { type: String, enum: ["doctor", "admin"], default: "doctor" },
        clinicName: { type: String, default: null },
    },
    {
        timestamps: true,
    }
);

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
