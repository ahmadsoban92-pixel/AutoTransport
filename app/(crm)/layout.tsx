import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Broker Terminal | WESAutoTransport CRM",
  description: "Internal CRM for WESAutoTransport brokers",
};

// Bare wrapper — the inner crm/layout.tsx handles all nav UI
export default function CRMGroupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
