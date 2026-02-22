import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db/mongoose";
import Patient from "@/models/patient";
import Report from "@/models/report";
import AudioFile from "@/models/audio-file";
import { extractMedicalData } from "@/lib/openrouter";
import { uploadAudio } from "@/lib/s3";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const doctorId = session.user.id;

        // Rate limiting
        const rateLimitResult = checkRateLimit(doctorId);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { error: "Rate limit exceeded. Please wait before making another request." },
                { status: 429 }
            );
        }

        const formData = await request.formData();
        const audioFile = formData.get("audio") as File | null;
        const transcript = formData.get("transcript") as string | null;
        const patientName = formData.get("patientName") as string;
        const patientAge = parseInt(formData.get("patientAge") as string);
        const patientGender = formData.get("patientGender") as string;
        const patientContact = formData.get("patientContact") as string;

        // Transcript is required — audio is optional (stored for records only)
        if (!transcript || transcript.trim().length < 10) {
            return NextResponse.json(
                { error: "Transcript is missing or too short. Please provide conversation text." },
                { status: 400 }
            );
        }

        await dbConnect();

        // Step 1: Create or find patient
        let patient = await Patient.findOne({
            doctorId,
            name: patientName,
            contact: patientContact,
        });

        if (!patient) {
            patient = await Patient.create({
                doctorId,
                name: patientName,
                age: patientAge,
                gender: patientGender,
                contact: patientContact,
            });
        }

        // Step 2: Create initial report
        const report = await Report.create({
            doctorId,
            patientId: patient._id,
            transcription: "",
            structuredData: {
                symptoms: [],
                observations: [],
                diagnosis: "",
                prescribed_medicines: [],
                doctor_notes: "",
            },
            status: "draft",
        });

        // Step 3: Upload audio to S3 (optional — for record keeping)
        let audioUrl = "no-audio";
        if (audioFile && audioFile.size > 0) {
            if (audioFile.size > 25 * 1024 * 1024) {
                return NextResponse.json(
                    { error: "File size exceeds 25MB limit" },
                    { status: 400 }
                );
            }
            const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
            try {
                audioUrl = await uploadAudio(audioBuffer, doctorId, patient._id.toString());
            } catch (s3Error) {
                console.warn("S3 upload failed, continuing without storage:", s3Error);
                audioUrl = "local://audio-not-stored";
            }
        }

        // Step 4: Save audio file record
        await AudioFile.create({
            doctorId,
            patientId: patient._id,
            reportId: report._id,
            fileUrl: audioUrl,
        });

        // Step 5: Extract medical data via OpenRouter
        const structuredData = await extractMedicalData(transcript);

        // Step 6: Update report with results
        await Report.findByIdAndUpdate(report._id, {
            transcription: transcript,
            structuredData,
        });

        return NextResponse.json({
            reportId: report._id.toString(),
            transcription: transcript,
            structuredData,
        });
    } catch (error) {
        console.error("[Transcribe API] Error:", error);

        const message = error instanceof Error ? error.message : "Processing failed";

        return NextResponse.json(
            { error: message, timestamp: new Date().toISOString() },
            { status: 500 }
        );
    }
}
