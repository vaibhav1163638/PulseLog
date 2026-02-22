import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db/mongoose";
import Report from "@/models/report";
import User from "@/models/user";
import { generateMedicalPDF } from "@/lib/pdf";
import { uploadPDF } from "@/lib/s3";
import { formatDate } from "@/lib/utils";

export async function POST(
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

        const doctor = await User.findById(session.user.id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const patient = report.patientId as any;

        // Generate PDF
        const pdfBytes = await generateMedicalPDF({
            clinicName: doctor?.clinicName || "PulseLog Clinic",
            doctorName: doctor?.name || session.user.name || "Doctor",
            date: formatDate(report.createdAt),
            patientName: patient?.name || "Unknown",
            patientAge: patient?.age || 0,
            patientGender: patient?.gender || "Unknown",
            patientContact: patient?.contact || "N/A",
            structuredData: report.structuredData,
        });

        // Try to upload to S3
        let pdfUrl: string | null = null;
        try {
            pdfUrl = await uploadPDF(pdfBytes, session.user.id, report._id.toString());
        } catch (s3Error) {
            console.warn("S3 PDF upload failed:", s3Error);
        }

        // Update report
        await Report.findByIdAndUpdate(report._id, {
            pdfUrl,
            status: "finalized",
        });

        if (pdfUrl) {
            return NextResponse.json({ pdfUrl });
        }

        // Fallback: return base64 PDF
        const base64 = Buffer.from(pdfBytes).toString("base64");
        return NextResponse.json({ pdf: base64 });
    } catch (error) {
        console.error("PDF generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate PDF" },
            { status: 500 }
        );
    }
}
