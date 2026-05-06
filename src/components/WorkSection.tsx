"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { portfolioData } from "@/data/portfolio";

export default function WorkSection() {
  return (
    <section id="work" className="py-24 relative overflow-hidden">
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
              className="group cursor-pointer"
            >
              <Link href={`/work/${project.slug}`}>
                <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden mb-6">
                  <div className="absolute inset-0 bg-primary/20 mix-blend-overlay z-10 group-hover:opacity-0 transition-opacity duration-500" />
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 z-20 w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:-translate-y-1 group-hover:translate-x-1">
                    <ArrowUpRight className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-xs font-bold text-primary tracking-wider uppercase px-3 py-1 glass rounded-full">
                      {project.category}
                    </span>
                  </div>
                  <h4 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {project.title}
                  </h4>
                  <p className="text-foreground/60 line-clamp-2">
                    {project.shortDescription}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
