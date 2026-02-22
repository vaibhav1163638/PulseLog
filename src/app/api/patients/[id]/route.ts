import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db/mongoose";
import Patient from "@/models/patient";
import Report from "@/models/report";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const patient = await Patient.findOne({
            _id: params.id,
            doctorId: session.user.id,
        }).lean();

        if (!patient) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }

        const reports = await Report.find({
            patientId: params.id,
            doctorId: session.user.id,
        })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ patient, reports });
    } catch (error) {
        console.error("Patient detail error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
