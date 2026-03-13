import { redirect } from "next/navigation";

// This route is superseded by /crm/dashboard — redirect permanently
export default function OldDashboard() {
  redirect("/crm/dashboard");
}
