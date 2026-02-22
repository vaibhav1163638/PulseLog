import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db/mongoose";
import User from "@/models/user";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const fetchCache = "force-no-store";

const NO_CACHE_HEADERS = {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
} as const;

export async function GET(): Promise<NextResponse> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: NO_CACHE_HEADERS }
            );
        }

        await dbConnect();
        const user = await User.findById(session.user.id).lean();

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404, headers: NO_CACHE_HEADERS }
            );
        }

        return NextResponse.json(user, { headers: NO_CACHE_HEADERS });
    } catch (error: unknown) {
        console.error("Settings GET error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: NO_CACHE_HEADERS }
        );
    }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: NO_CACHE_HEADERS }
            );
        }

        const body: { name?: string; clinicName?: string | null } =
            await request.json();

        await dbConnect();

        const user = await User.findByIdAndUpdate(
            session.user.id,
            {
                name: body.name,
                clinicName: body.clinicName || null,
            },
            { new: true }
        ).lean();

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404, headers: NO_CACHE_HEADERS }
            );
        }

        return NextResponse.json(user, { headers: NO_CACHE_HEADERS });
    } catch (error: unknown) {
        console.error("Settings PUT error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: NO_CACHE_HEADERS }
        );
    }
}
