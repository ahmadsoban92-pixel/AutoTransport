"use client";

import { useState, useRef, useEffect } from "react";
import { Mail, ExternalLink } from "lucide-react";

const COMPANY_EMAIL = "info@wessolutions.com";
const SUBJECT = "Inquiry – AutoTransportPro";
const BODY = "Hi AutoTransportPro team,\n\nI'd like to get in touch regarding ";

interface Props {
  /** Class applied to the trigger button */
  className?: string;
  /** Class applied to the outer wrapper div — use for flex-1, width, etc. */
  wrapperClassName?: string;
  children?: React.ReactNode;
  showIcon?: boolean;
}

/**
 * EmailLink — shows a small popover letting users pick Gmail, Outlook Web,
 * or their default mail client. Prevents Edge from opening a blank tab on mailto:.
 */
export function EmailLink({ className, wrapperClassName, children, showIcon = false }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const gmail = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(COMPANY_EMAIL)}&su=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(BODY)}`;
  const outlook = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(COMPANY_EMAIL)}&subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(BODY)}`;
  const tel = `mailto:${COMPANY_EMAIL}?subject=${encodeURIComponent(SUBJECT)}`;

  return (
    <div ref={ref} className={`relative${wrapperClassName ? " " + wrapperClassName : " inline-block"}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={className}
        type="button"
      >
        {showIcon && <Mail className="w-4 h-4" />}
        {children ?? COMPANY_EMAIL}
      </button>

      {open && (
        <div className="absolute z-50 bottom-full mb-2 left-0 w-56 bg-[#0f1f3d] border border-blue-700/40 rounded-xl shadow-2xl p-2 text-sm">
          <p className="text-xs text-blue-500 px-2 py-1 mb-1">Open email with…</p>
          <a
            href={gmail}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-blue-900/40 text-white transition-colors"
          >
            <span className="flex items-center gap-2"><span className="text-base">📧</span> Gmail</span>
            <ExternalLink className="w-3 h-3 text-blue-500" />
          </a>
          <a
            href={outlook}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-blue-900/40 text-white transition-colors"
          >
            <span className="flex items-center gap-2"><span className="text-base">📮</span> Outlook Web</span>
            <ExternalLink className="w-3 h-3 text-blue-500" />
          </a>
          <a
            href={tel}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-900/40 text-blue-300 transition-colors"
          >
            <span className="text-base">✉️</span> Default Mail App
          </a>
        </div>
      )}
    </div>
  );
}
