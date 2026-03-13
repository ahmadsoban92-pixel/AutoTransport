import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Broker Terminal | AutoTransportPro CRM",
  description: "Internal CRM for AutoTransportPro brokers",
};

// Bare wrapper — the inner crm/layout.tsx handles all nav UI
export default function CRMGroupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
