import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongoose";
import User from "@/models/user";

// ─────────────────────────────────────────────────────────────
// GET /api/db-seed
//
// ONE-TIME utility route that forces database creation by
// inserting a seed admin document. MongoDB does NOT create a
// database until at least one document is written.
//
// ⚠️  Remove this route once your DB is visible in Compass/Atlas.
// ─────────────────────────────────────────────────────────────

export async function GET() {
    try {
        await dbConnect();

        // Check if seed user already exists
        const existing = await User.findOne({ email: "admin@pulselog.dev" });

        if (existing) {
            return NextResponse.json({
                status: "already_seeded",
                message: "Seed document already exists. Your database should be visible in Compass/Atlas.",
                database: existing.db?.name ?? "unknown",
            });
        }

        // Insert a seed document — this forces MongoDB to materialise the database
        const seedUser = await User.create({
            name: "Admin (Seed)",
            email: "admin@pulselog.dev",
            image: "",
            provider: "seed",
            role: "admin",
            clinicName: "PulseLog Dev Clinic",
        });

        return NextResponse.json({
            status: "seeded",
            message: "✅ Seed document created. Your database is now visible in Compass/Atlas!",
            document: {
                _id: seedUser._id.toString(),
                email: seedUser.email,
                name: seedUser.name,
            },
        });
    } catch (error) {
        console.error("[db-seed] Error:", error);
        return NextResponse.json(
            {
                status: "error",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
