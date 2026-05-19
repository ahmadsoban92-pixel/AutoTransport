import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";

// Public endpoint — returns only anonymised recent activity.
// NO PII: name, email, phone, ZIP are never exposed.
// Cached at the Next.js layer for 60 s to avoid spamming the DB.
export const revalidate = 60;

export async function GET() {
  try {
    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from("leads")
      .select("vehicle_year, vehicle_make, vehicle_model, origin_zip, created_at")
      .order("created_at", { ascending: false })
      .limit(12);

    if (error || !data) {
      return NextResponse.json({ activity: [] }, { status: 200 });
    }

    // Map ZIP → approximate state name using a small lookup
    // (avoids any geocoding call for this simple feature)
    const activity = data.map((row) => ({
      vehicle:    `${row.vehicle_year} ${row.vehicle_make} ${row.vehicle_model}`,
      state:      zipToState(row.origin_zip),
      created_at: row.created_at,
    }));

    return NextResponse.json({ activity }, { status: 200 });
  } catch {
    return NextResponse.json({ activity: [] }, { status: 200 });
  }
}

// Lightweight ZIP-prefix → US state lookup (no external API needed)
function zipToState(zip: string): string {
  const prefix = parseInt(zip.slice(0, 3), 10);
  if (isNaN(prefix)) return "the US";
  if (prefix >= 10 && prefix <= 99)   return "New York";
  if (prefix >= 100 && prefix <= 199) return "New York";
  if (prefix >= 200 && prefix <= 205) return "Washington D.C.";
  if (prefix >= 206 && prefix <= 212) return "Maryland";
  if (prefix >= 220 && prefix <= 246) return "Virginia";
  if (prefix >= 247 && prefix <= 268) return "West Virginia";
  if (prefix >= 270 && prefix <= 289) return "North Carolina";
  if (prefix >= 290 && prefix <= 299) return "South Carolina";
  if (prefix >= 300 && prefix <= 319) return "Georgia";
  if (prefix >= 320 && prefix <= 349) return "Florida";
  if (prefix >= 350 && prefix <= 369) return "Alabama";
  if (prefix >= 370 && prefix <= 385) return "Tennessee";
  if (prefix >= 386 && prefix <= 397) return "Mississippi";
  if (prefix >= 398 && prefix <= 399) return "Georgia";
  if (prefix >= 400 && prefix <= 427) return "Kentucky";
  if (prefix >= 430 && prefix <= 458) return "Ohio";
  if (prefix >= 460 && prefix <= 479) return "Indiana";
  if (prefix >= 480 && prefix <= 499) return "Michigan";
  if (prefix >= 500 && prefix <= 528) return "Iowa";
  if (prefix >= 530 && prefix <= 549) return "Wisconsin";
  if (prefix >= 550 && prefix <= 567) return "Minnesota";
  if (prefix >= 570 && prefix <= 577) return "South Dakota";
  if (prefix >= 580 && prefix <= 588) return "North Dakota";
  if (prefix >= 590 && prefix <= 599) return "Montana";
  if (prefix >= 600 && prefix <= 629) return "Illinois";
  if (prefix >= 630 && prefix <= 658) return "Missouri";
  if (prefix >= 660 && prefix <= 679) return "Kansas";
  if (prefix >= 680 && prefix <= 693) return "Nebraska";
  if (prefix >= 700 && prefix <= 714) return "Louisiana";
  if (prefix >= 716 && prefix <= 729) return "Arkansas";
  if (prefix >= 730 && prefix <= 749) return "Oklahoma";
  if (prefix >= 750 && prefix <= 799) return "Texas";
  if (prefix >= 800 && prefix <= 816) return "Colorado";
  if (prefix >= 820 && prefix <= 831) return "Wyoming";
  if (prefix >= 832 && prefix <= 838) return "Idaho";
  if (prefix >= 840 && prefix <= 847) return "Utah";
  if (prefix >= 850 && prefix <= 865) return "Arizona";
  if (prefix >= 870 && prefix <= 884) return "New Mexico";
  if (prefix >= 889 && prefix <= 898) return "Nevada";
  if (prefix >= 900 && prefix <= 961) return "California";
  if (prefix >= 970 && prefix <= 979) return "Oregon";
  if (prefix >= 980 && prefix <= 994) return "Washington";
  if (prefix >= 995 && prefix <= 999) return "Alaska";
  return "the US";
}
