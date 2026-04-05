// lib/rateLimit.ts
// In-memory rate limiter for public API routes (e.g. /api/leads, /api/contact POST).
// Resets on process restart (cold start) — sufficient for Vercel serverless.
// For persistent rate limiting, replace with Redis/Upstash.

interface RateBucket {
  count:     number;
  windowStart: number;
}

// Maps IP → bucket
const store = new Map<string, RateBucket>();

/**
 * Returns true if the request is ALLOWED (under the limit).
 * Returns false if the caller should respond with 429.
 *
 * @param ip        - Client IP (from x-forwarded-for header)
 * @param limit     - Max requests per window (default 10)
 * @param windowMs  - Window duration in ms (default 60 000 = 1 minute)
 */
export function rateLimit(
  ip: string,
  limit  = 10,
  windowMs = 60_000
): boolean {
  const now    = Date.now();
  const bucket = store.get(ip);

  if (!bucket || now - bucket.windowStart > windowMs) {
    // Start a fresh window
    store.set(ip, { count: 1, windowStart: now });
    return true;
  }

  bucket.count++;
  if (bucket.count > limit) return false;
  return true;
}

/** Helper: extract best-effort IP from a Next.js request */
export function getClientIp(request: Request): string {
  const ff = (request.headers as Headers).get("x-forwarded-for");
  return ff ? ff.split(",")[0].trim() : "unknown";
}
