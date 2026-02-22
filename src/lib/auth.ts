import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Auth.js v5 configuration for PulseLog.
 *
 * KEY DESIGN DECISIONS:
 * - JWT strategy (no DB adapter for sessions) — fast, stateless, Vercel-friendly.
 * - DB writes happen ONLY in signIn callback (user creation).
 * - jwt/session callbacks NEVER throw — they catch errors and return safe defaults.
 * - DB connection is lazy; if MongoDB is down, sessions still work (just without custom fields).
 * - trustHost: true — required to avoid NextRequest host resolution bug in beta.30.
 */

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID ?? "",
            clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
        }),
    ],
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        /**
         * signIn — runs ONCE when the user clicks "Sign in with Google".
         * Creates the user in MongoDB if they don't exist.
         */
        async signIn({ user, account }) {
            if (!account || !user.email) return false;

            try {
                const dbConnect = (await import("@/lib/db/mongoose")).default;
                const User = (await import("@/models/user")).default;

                await dbConnect();
                const existingUser = await User.findOne({ email: user.email });

                if (!existingUser) {
                    await User.create({
                        name: user.name || "Doctor",
                        email: user.email,
                        image: user.image || "",
                        provider: account.provider,
                        role: "doctor",
                        clinicName: null,
                    });
                }

                return true;
            } catch (error) {
                console.error("[Auth] signIn error:", error);
                return true;
            }
        },

        /**
         * jwt — enriches the JWT token with DB fields.
         * Only queries DB on sign-in or explicit update, NOT on every request.
         * MUST NEVER THROW.
         */
        async jwt({ token, user, account, trigger }) {
            if ((user && account) || trigger === "update") {
                try {
                    const dbConnect = (await import("@/lib/db/mongoose")).default;
                    const User = (await import("@/models/user")).default;

                    await dbConnect();
                    const dbUser = await User.findOne({ email: token.email });
                    if (dbUser) {
                        token.id = dbUser._id.toString();
                        token.role = dbUser.role;
                        token.clinicName = dbUser.clinicName;
                    }
                } catch (error) {
                    console.error("[Auth] jwt callback DB error:", error);
                }
            }
            return token;
        },

        /**
         * session — maps JWT token fields to the session object.
         * MUST NEVER THROW.
         */
        async session({ session, token }) {
            if (session.user) {
                session.user.id = (token.id as string) ?? "";
                session.user.role = (token.role as "doctor" | "admin") ?? "doctor";
                session.user.clinicName = (token.clinicName as string | null) ?? null;
            }
            return session;
        },
    },
    debug: process.env.NODE_ENV === "development",
});
