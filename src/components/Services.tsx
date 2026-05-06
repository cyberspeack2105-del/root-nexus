"use client";

import { motion } from "framer-motion";
import { services } from "@/data/services";
import { Code, Megaphone, Cpu, Layers, Globe, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

const iconMap: any = {
  Globe,
  TrendingUp: Megaphone, // Mapping to available icons
  Cpu,
  Zap,
};

export default function Services() {
  return (
    <section id="services" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 space-y-4 md:space-y-0">
          <div className="max-w-2xl">
            <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-4">
              Our Expertise
            </h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold">
              Integrated Solutions for the{" "}
              <span className="text-gradient">Modern Era</span>
            </h3>
          </div>
          <p className="max-w-md text-foreground/60">
            We don&apos;t just build tools; we create digital ecosystems that adapt, 
            scale, and outperform the competition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon] || Code;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link
                  href={`/services/${service.id}`}
                  className="group relative block p-8 rounded-[2.5rem] glass hover:bg-white/5 transition-all duration-500 border border-white/5 h-full"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 text-primary`}>
                    <Icon className="w-8 h-8" />
                  </div>

                  <h4 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                    {service.title}
                  </h4>
                  <p className="text-foreground/60 leading-relaxed group-hover:text-foreground/80 transition-colors mb-8">
                    {service.description}
                  </p>

                  <div className="flex items-center text-sm font-bold text-primary group-hover:translate-x-2 transition-transform duration-500">
                    <span>Explore Service</span>
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
