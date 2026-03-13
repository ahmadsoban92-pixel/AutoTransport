"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, PhoneCall, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function AnimatedHero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["Fast", "Reliable", "Safe", "Affordable", "Trusted"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container mx-auto px-4">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div>
            <Link href="/get-quote">
              <Button variant="secondary" size="sm" className="gap-4 bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200">
                Get your free quote today <MoveRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-3xl tracking-tighter text-center font-bold text-white">
              <span>Auto Transport That&apos;s</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-bold text-orange-400"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? { y: 0, opacity: 1 }
                        : {
                          y: titleNumber > index ? -150 : 150,
                          opacity: 0,
                        }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-blue-200 max-w-2xl text-center">
              We connect you with the nation&apos;s top auto carriers to ship your
              vehicle safely, on time, and at the best price. Get a free quote in
              under 60 seconds.
            </p>
          </div>
          <div className="flex flex-row gap-3 flex-wrap justify-center">
            <Link href="/get-quote">
              <Button size="lg" className="gap-4 bg-orange-500 hover:bg-orange-600 text-white border-0">
                Get a Free Quote <MoveRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="tel:+923059846727">
              <Button size="lg" className="gap-4" variant="outline">
                Call +92 305 9846727 <PhoneCall className="w-4 h-4" />
              </Button>
            </a>
            <a href="https://wa.me/923059846727" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-4 bg-green-600 hover:bg-green-700 text-white border-0">
                WhatsApp Us <MessageCircle className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export { AnimatedHero };
