import { NextRequest, NextResponse } from "next/server";

/**
 * Validates a US ZIP code using the free Zippopotam.us API.
 * Returns { valid, city, state } — no API key required.
 * Caches valid results for 24 hours via Next.js fetch cache.
 */
export async function GET(request: NextRequest) {
  const zip = request.nextUrl.searchParams.get("zip")?.trim();

  // Basic format check first
  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ valid: false, error: "ZIP must be exactly 5 digits" });
  }

  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`, {
      next: { revalidate: 86400 }, // cache 24h
    });

    if (!res.ok) {
      // 404 = ZIP does not exist
      return NextResponse.json({ valid: false, error: "ZIP code not found in the US postal system" });
    }

    const data = await res.json();
    const place = data.places?.[0];
    return NextResponse.json({
      valid: true,
      city: place?.["place name"] ?? "",
      state: place?.["state abbreviation"] ?? "",
    });
  } catch {
    // If API is unreachable, fail open (don't block the user)
    return NextResponse.json({ valid: true, city: "", state: "", warning: "Could not verify ZIP (network error)" });
  }
}
