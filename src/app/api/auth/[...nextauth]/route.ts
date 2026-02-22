import { handlers } from "@/lib/auth";

/**
 * Auth.js v5 App Router handler.
 * Exports GET and POST as named exports — required by Next.js App Router.
 * 
 * This handles:
 * - GET  /api/auth/session       → session JSON
 * - GET  /api/auth/signin        → sign-in page redirect
 * - GET  /api/auth/signout       → sign-out page
 * - GET  /api/auth/callback/:id  → OAuth callback
 * - POST /api/auth/signin/:id    → initiate OAuth
 * - POST /api/auth/signout       → sign out
 * - GET  /api/auth/csrf          → CSRF token
 * - GET  /api/auth/providers     → available providers
 */
export const { GET, POST } = handlers;

// Force dynamic rendering — auth endpoints must never be statically cached
export const dynamic = "force-dynamic";
