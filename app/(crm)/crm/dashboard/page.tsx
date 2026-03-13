import { DashboardCards } from "@/components/DashboardCards";
import { LeadTable } from "@/components/LeadTable";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default function CRMDashboard() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-blue-400 text-sm mt-1">Overview of your lead pipeline</p>
      </div>
      <DashboardCards />
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Leads</h2>
          <Link href="/crm/leads" className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <LeadTable basePath="/crm/leads" />
      </div>
    </div>
  );
}
