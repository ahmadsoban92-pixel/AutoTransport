"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Resets scroll position to the top on every route change.
 * Fixes: nav clicks from bottom of page leave new page scrolled down,
 * which also causes whileInView animations to fire before the user scrolls.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
