import type { Variants } from "framer-motion";

/** Standard fade-up animation props for motion elements.
 *  Using explicit numeric easing array to satisfy Framer Motion's strict Easing type. */
export function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" } as const,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as const, delay },
  };
}

/** Stagger container variant */
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

/** Stagger child variant */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};
