"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";

const navLinks = [
  { name: "Services", href: "/#services" },
  { name: "Projects", href: "/work" },
  { name: "Insights", href: "/insights" },
  { name: "About", href: "/about" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "py-4" : "py-6"
        }`}
    >
      <div className="container mx-auto px-6">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${scrolled ? "glass-dark rounded-full px-8 py-3" : ""
            }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative w-36 h-12 md:w-[240px] md:h-[70px] flex items-center justify-center transition-transform hover:scale-105">
              <img
                src="/nex.png"
                alt="Root Nexus Logo"
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="https://wa.me/917012402892"
              target="_blank"
              className="bg-primary hover:bg-primary/90 text-black px-6 py-2.5 rounded-full text-sm font-bold flex items-center space-x-2 transition-all transform hover:scale-105"
            >
              <span>Start Your Project</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-foreground p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 glass-dark border-t border-white/5 md:hidden overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[60]"
          >
            <div className="flex flex-col p-8 space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-xl font-bold text-white hover:text-primary transition-colors flex items-center justify-between"
                  onClick={() => setIsOpen(false)}
                >
                  <span>{link.name}</span>
                  <ArrowRight className="w-5 h-5 text-white/20" />
                </Link>
              ))}
              <Link
                href="https://wa.me/917012402892"
                target="_blank"
                className="bg-primary text-black text-center py-5 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 shadow-lg shadow-primary/20"
                onClick={() => setIsOpen(false)}
              >
                <span>Start Your Project</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
