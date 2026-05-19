import type { Metadata } from "next";
import { Suspense } from "react";
import TrackPageClient from "./TrackPageClient";

interface Props {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ payment?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  return {
    title: "Track My Shipment — WESAutoTransport",
    description: "Real-time shipment status for your vehicle transport.",
    robots: { index: false, follow: false }, // don't index tracking pages
    openGraph: { title: "Track My Shipment", description: `Tracking ID: ${token.slice(0, 8)}...` },
  };
}

export default async function TrackPage({ params, searchParams }: Props) {
  const { token }   = await params;
  const { payment } = await searchParams;
  return (
    <Suspense fallback={null}>
      <TrackPageClient token={token} paymentResult={payment} />
    </Suspense>
  );
}
