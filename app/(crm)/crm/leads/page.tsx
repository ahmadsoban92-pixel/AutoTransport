import { LeadTable } from "@/components/LeadTable";

export const dynamic = "force-dynamic";

export default function CRMLeadsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">All Leads</h1>
        <p className="text-blue-400 text-sm mt-1">Manage and track your customer quote requests</p>
      </div>
      <LeadTable basePath="/crm/leads" />
    </div>
  );
}
