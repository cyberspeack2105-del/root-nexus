"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import WorkSection from "@/components/WorkSection";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <Hero />
      
      <FadeIn>
        <Services />
      </FadeIn>
      
      {/* Dynamic Section Separator */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <FadeIn>
        <WorkSection />
      </FadeIn>

      {/* Dynamic Section Separator */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      {/* About / Philosophy Section Preview */}
      <section id="about" className="py-16 md:py-24 bg-grid relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

            {/* Business Animation / Video */}
            <FadeIn direction="right">
              <div className="relative group">
                {/* Decorative Blur Background */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
                
                <div className="relative aspect-video glass rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                  <motion.img
                    src="/nexus_bg.png"
                    alt="Futuristic Digital Nexus"
                    className="w-full h-full object-cover origin-center"
                    animate={{
                      scale: [1, 1.1, 1],
                      x: [0, -10, 0],
                      y: [0, -5, 0]
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  {/* Subtle Gradient Overlay for blending */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-background/20 to-transparent pointer-events-none" />
                </div>
              </div>
            </FadeIn>
            <FadeIn direction="left">
              <div className="space-y-8">
                <h2 className="text-sm font-bold text-secondary tracking-widest uppercase">
                  The Nexus Philosophy
                </h2>
                <h3 className="text-4xl md:text-5xl font-display font-bold leading-tight">
                  Where Strategy Meets <span className="text-gradient">Pure Execution</span>
                </h3>
                <p className="text-xl text-foreground/60 leading-relaxed">
                  Root Nexus was born from the need to bridge the gap between complex 
                  technology and human-centric business goals. We don&apos;t just provide 
                  services; we provide a nexus—a point of connection where your brand 
                  expands into new digital territories.
                </p>
                <ul className="space-y-4">
                  {[
                    "Agile Development Workflows",
                    "Data-Driven Growth Strategies",
                    "AI-First Automation Engineering",
                    "Immersive Brand Storytelling"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center space-x-3 text-lg font-medium">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>


      <Footer />
    </main>
  );
}
