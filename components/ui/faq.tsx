"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FaqSectionProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  items: { question: string; answer: string }[];
  contactInfo?: {
    title: string;
    description: string;
    buttonText: string;
    onContact?: () => void;
  };
}

const FaqSection = React.forwardRef<HTMLElement, FaqSectionProps>(
  ({ className, title, description, items, contactInfo, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          "py-16 w-full bg-gradient-to-b from-transparent via-blue-950/30 to-transparent",
          className
        )}
        {...props}
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center mb-12"
          >
            <h2 className="text-3xl font-semibold mb-3 text-white">{title}</h2>
            {description && (
              <p className="text-sm text-blue-300">{description}</p>
            )}
          </motion.div>

          <div className="max-w-2xl mx-auto space-y-2">
            {items.map((item, index) => (
              <FaqItem
                key={index}
                question={item.question}
                answer={item.answer}
                index={index}
              />
            ))}
          </div>

          {contactInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="max-w-md mx-auto mt-12 p-6 rounded-lg text-center border border-blue-800/30 bg-blue-950/20"
            >
              <div className="inline-flex items-center justify-center p-1.5 rounded-full mb-4 bg-orange-500/20">
                <Mail className="h-4 w-4 text-orange-400" />
              </div>
              <p className="text-sm font-medium text-white mb-1">
                {contactInfo.title}
              </p>
              <p className="text-xs text-blue-300 mb-4">{contactInfo.description}</p>
              <Button
                size="sm"
                onClick={contactInfo.onContact}
                className="bg-orange-500 hover:bg-orange-600 text-white border-0"
              >
                {contactInfo.buttonText}
              </Button>
            </motion.div>
          )}
        </div>
      </section>
    );
  }
);
FaqSection.displayName = "FaqSection";

const FaqItem = React.forwardRef<
  HTMLDivElement,
  { question: string; answer: string; index: number }
>((props, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { question, answer, index } = props;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.06 }}
      className={cn(
        "group rounded-lg transition-all duration-200 ease-in-out border border-blue-800/30",
        isOpen ? "bg-blue-950/40" : "hover:bg-blue-950/20"
      )}
    >
      {/* ── Use a plain <button> so we control the box model fully ── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 sm:px-6 py-4 text-left"
      >
        <h3
          className={cn(
            "flex-1 min-w-0 text-sm sm:text-base font-medium transition-colors duration-200 break-words leading-snug",
            isOpen ? "text-white" : "text-blue-200"
          )}
        >
          {question}
        </h3>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "flex-shrink-0 p-0.5 rounded-full transition-colors duration-200",
            isOpen ? "text-orange-400" : "text-blue-400"
          )}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1, transition: { duration: 0.2, ease: "easeOut" } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.15, ease: "easeIn" } }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-6 pb-4 pt-1">
              <p className="text-sm text-blue-300 leading-relaxed">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
FaqItem.displayName = "FaqItem";

export { FaqSection };
