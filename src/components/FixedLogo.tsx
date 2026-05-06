"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function FixedLogo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-2 left-2 md:top-6 md:left-10 z-[60] pointer-events-auto"
    >
      <Link href="/" className="block group">
        <div className="relative w-24 h-16 md:w-[400px] md:h-[200px] flex items-center justify-center transition-all duration-500 hover:scale-105">
          <img
            src="/nex.png"
            alt="Root Nexus Fixed Logo"
            className="w-full h-full object-contain mix-blend-multiply"
          />
        </div>
      </Link>
    </motion.div>
  );
}
