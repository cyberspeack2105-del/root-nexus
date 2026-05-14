"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { portfolioData } from "@/data/portfolio";

export default function WorkSection() {
  return (
    <section id="work" className="py-16 md:py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 space-y-4 md:space-y-0">
          <div>
            <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-2">
              Our Work
            </h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold">
              Featured <span className="text-gradient">Case Studies</span>
            </h3>
          </div>
          <Link
            href="/work"
            className="flex items-center space-x-2 text-foreground/60 hover:text-primary transition-colors font-medium group"
          >
            <span>View All Projects</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolioData.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <Link href={`/work/${project.slug}`} className="block">
                <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden mb-8 border border-white/5 glass-dark shadow-xl">
                  <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10 group-hover:opacity-0 transition-opacity duration-500" />
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-lg shadow-primary/40">
                      <ArrowUpRight className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-white font-bold tracking-widest uppercase text-xs transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                      View Case Study
                    </span>
                  </div>

                  <div className="absolute top-6 left-6 z-30">
                    <span className="text-[10px] font-bold text-white tracking-[0.2em] uppercase px-4 py-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
                      {project.category}
                    </span>
                  </div>
                </div>
                
                <div className="px-1 md:px-2">
                  <h4 className="text-2xl md:text-3xl font-display font-bold mb-3 md:mb-4 group-hover:text-primary transition-colors leading-tight">
                    {project.title}
                  </h4>
                  <p className="text-foreground/50 text-base md:text-lg leading-relaxed line-clamp-2 font-light">
                    {project.shortDescription}
                  </p>
                  
                  <div className="mt-4 md:mt-6 flex items-center space-x-2 text-primary font-bold text-xs md:text-sm tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Read More</span>
                    <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
