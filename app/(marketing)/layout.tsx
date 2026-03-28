import { SiteNavbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import PriceEstimatorChat from "@/components/PriceEstimatorChat";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#060d1f]">
      <ScrollProgress className="fixed top-0 z-[100] bg-orange-500" />
      <SiteNavbar />
      <main>{children}</main>
      <Footer />
      <PriceEstimatorChat />
    </div>
  );
}
