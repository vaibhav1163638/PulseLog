import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db/mongoose";
import Patient from "@/models/patient";
import Report from "@/models/report";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const doctorId = session.user.id;

        const [totalPatients, totalReports, recentReports] = await Promise.all([
            Patient.countDocuments({ doctorId }),
            Report.countDocuments({ doctorId }),
            Report.find({ doctorId })
                .sort({ createdAt: -1 })
                .limit(10)
                .populate("patientId", "name age gender")
                .lean(),
        ]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recentConsultations = recentReports.map((report: any) => ({
            _id: report._id?.toString(),
            patientName: report.patientId?.name || "Unknown",
            diagnosis: report.structuredData?.diagnosis || "",
            createdAt: report.createdAt,
            status: report.status,
        }));

        return NextResponse.json({
            totalPatients,
            totalReports,
            recentConsultations,
        });
    } catch (error) {
        console.error("Dashboard API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
