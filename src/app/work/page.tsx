"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { portfolioData } from "@/data/portfolio";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function WorkListPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-40 pb-20 relative overflow-hidden bg-grid">
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-4">
              Our Portfolio
            </h2>
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-8 leading-tight">
              Crafting Digital <span className="text-gradient">Masterpieces</span>
            </h1>
            <p className="text-xl text-foreground/60 leading-relaxed">
              Discover how we connect foundational roots with modern digital nexus 
              to drive real-world results for our clients.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
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
                  <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden mb-8 border border-white/10 glass-dark">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-6 right-6 z-20 w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-1 group-hover:translate-x-1">
                      <ArrowUpRight className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-xs font-bold text-primary tracking-wider uppercase px-4 py-1.5 glass rounded-full">
                        {project.category}
                      </span>
                    </div>
                    <h4 className="text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {project.title}
                    </h4>
                    <p className="text-foreground/60 text-lg line-clamp-2 leading-relaxed">
                      {project.shortDescription}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
