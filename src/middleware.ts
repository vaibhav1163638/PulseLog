import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware for PulseLog.
 * 
 * Uses manual cookie checking instead of `export { auth as middleware }`
 * because that pattern is broken with next-auth@5.0.0-beta.30 + Next.js 14.1.0.
 * 
 * Auth.js v5 uses these cookie names:
 * - Development: "authjs.session-token"
 * - Production (HTTPS): "__Secure-authjs.session-token"
 */

const PUBLIC_ROUTES = new Set(["/", "/login"]);

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Never block Auth.js API routes — this is critical for /api/auth/session
    if (pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    // 2. Allow public routes
    if (PUBLIC_ROUTES.has(pathname)) {
        return NextResponse.next();
    }

    // 3. Allow other public API routes
    if (pathname.startsWith("/api/public")) {
        return NextResponse.next();
    }

    // 4. Check for Auth.js session cookie
    const token =
        request.cookies.get("authjs.session-token")?.value ||
        request.cookies.get("__Secure-authjs.session-token")?.value;

    if (!token) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", encodeURI(pathname));
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico
         * - public assets
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
    ],
};
