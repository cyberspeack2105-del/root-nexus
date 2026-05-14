"use client";

import Link from "next/link";
import { ArrowUpRight, Globe, MessageCircle, Users } from "lucide-react";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="pt-16 md:pt-24 pb-12 relative overflow-hidden bg-grid">
      <div className="container mx-auto px-6">
        {/* CTA Section */}
        <div className="glass-dark rounded-[3rem] p-12 md:p-20 text-center mb-24 relative overflow-hidden border border-white/10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 pointer-events-none" />
          <h2 className="text-4xl md:text-7xl font-display font-bold mb-8 relative z-10">
            Ready to Build the <span className="text-gradient">Future?</span>
          </h2>
          <p className="text-xl text-foreground/60 mb-12 max-w-2xl mx-auto relative z-10">
            Join the Nexus. Let&apos;s discuss how we can scale your vision with 
            cutting-edge technology and strategic marketing.
          </p>
          <Link
            href="https://wa.me/917012402892"
            target="_blank"
            className="inline-flex items-center space-x-3 bg-white text-black px-12 py-6 rounded-full font-bold text-xl transition-all hover:scale-105 hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.4)]"
          >
            <span>Let&apos;s Talk</span>
            <ArrowUpRight className="w-6 h-6" />
          </Link>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 md:gap-12 mb-24">
          <div className="col-span-2 lg:col-span-1 space-y-8">
            <Link href="/" className="flex items-center">
              <div className="relative w-36 h-12 md:w-48 md:h-16 flex items-center justify-start transition-transform hover:scale-105">
                <img 
                  src="/nex.png" 
                  alt="Root Nexus Logo" 
                  className="w-full h-full object-contain mix-blend-multiply object-left"
                />
              </div>
            </Link>
            <p className="text-foreground/50 leading-relaxed">
              Connecting foundational ideas with modern digital ecosystems. 
              Innovation at the root, expansion at the nexus.
            </p>
            <div className="flex items-center space-x-4">
              {[
                { Icon: Globe, href: "#" },
                { Icon: MessageCircle, href: "#" },
                { Icon: Users, href: "#" },
                { Icon: InstagramIcon, href: "https://instagram.com/root_nexusr" }
              ].map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  target={item.href !== "#" ? "_blank" : undefined}
                  rel={item.href !== "#" ? "noopener noreferrer" : undefined}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-primary hover:text-black transition-all"
                >
                  <item.Icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          <div className="col-span-1">
            <h4 className="font-bold text-lg mb-8">Solutions</h4>
            <ul className="space-y-4 text-foreground/50">
              <li><Link href="#" className="hover:text-primary transition-colors">Web Development</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Digital Marketing</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">AI & Automation</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Smart Experiences</Link></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="font-bold text-lg mb-8">Company</h4>
            <ul className="space-y-4 text-foreground/50">
              <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Our Process</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Case Studies</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-foreground/40">
          <p>© {currentYear} Root Nexus. All rights reserved.</p>
          <div className="flex space-x-8">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
