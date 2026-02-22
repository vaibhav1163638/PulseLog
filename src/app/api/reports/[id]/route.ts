import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db/mongoose";
import Report from "@/models/report";
import Patient from "@/models/patient";

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

        const report = await Report.findOne({
            _id: params.id,
            doctorId: session.user.id,
        }).populate("patientId", "name age gender contact");

        if (!report) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        return NextResponse.json(report);
    } catch (error) {
        console.error("Get report error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const report = await Report.findOne({
            _id: params.id,
            doctorId: session.user.id,
        });

        if (!report) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        const patientId = report.patientId;

        await report.deleteOne();

        // Check if the patient has any other reports
        const remainingReports = await Report.countDocuments({
            patientId: patientId,
            doctorId: session.user.id,
        });

        let patientDeleted = false;
        if (remainingReports === 0) {
            // Delete the patient if they have no other reports
            await Patient.findByIdAndDelete(patientId);
            patientDeleted = true;
        }

        return NextResponse.json({ 
            message: "Report deleted successfully",
            patientDeleted 
        });
    } catch (error) {
        console.error("Delete report error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        await dbConnect();

        const report = await Report.findOneAndUpdate(
            {
                _id: params.id,
                doctorId: session.user.id,
            },
            {
                structuredData: {
                    symptoms: body.symptoms || [],
                    observations: body.observations || [],
                    diagnosis: body.diagnosis || "",
                    prescribed_medicines: body.prescribed_medicines || [],
                    doctor_notes: body.doctor_notes || "",
                },
            },
            { new: true }
        ).populate("patientId", "name age gender contact");

        if (!report) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        return NextResponse.json(report);
    } catch (error) {
        console.error("Update report error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
