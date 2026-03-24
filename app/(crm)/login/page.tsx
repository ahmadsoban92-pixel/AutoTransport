import { redirect } from "next/navigation";

// The real login page is at /crm/login — redirect permanently to avoid
// the browser caching credentials for this ghost URL
export default function LegacyLoginRedirect() {
  redirect("/crm/login");
}
