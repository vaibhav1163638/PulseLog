import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { extractMedicalData } from "@/lib/openrouter";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
    try {
        // Auth
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Rate limit
        const rl = checkRateLimit(session.user.id);
        if (!rl.allowed) {
            return NextResponse.json(
                { error: "Rate limit exceeded. Try again shortly." },
                { status: 429 }
            );
        }

        // Parse body
        let body: { transcript?: string };
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid JSON body" },
                { status: 400 }
            );
        }

        const transcript = body.transcript?.trim();

        if (!transcript || transcript.length < 10) {
            return NextResponse.json(
                { error: "Transcript is missing or too short (min 10 chars)." },
                { status: 400 }
            );
        }

        // Extract structured medical data via OpenRouter
        const structuredData = await extractMedicalData(transcript);

        return NextResponse.json({
            success: true,
            structuredData,
        });
    } catch (error) {
        console.error("[/api/process] Error:", error);
        return NextResponse.json(
            {
                error: error instanceof Error
                    ? error.message
                    : "Processing failed",
            },
            { status: 500 }
        );
    }
}
