import { redirect } from "next/navigation";

// This route is superseded by /crm/leads — redirect permanently
export default function OldLeads() {
  redirect("/crm/leads");
}
