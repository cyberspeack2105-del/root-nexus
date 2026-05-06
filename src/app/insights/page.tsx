"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import { insightsData } from "@/data/insights";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function InsightsPage() {
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
              Knowledge & Strategy
            </h2>
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-8 leading-tight">
              Deep <span className="text-gradient">Insights</span> for the Digital Age
            </h1>
            <p className="text-xl text-foreground/60 leading-relaxed">
              Explore our latest thoughts on technology, strategy, and the 
              future of the digital ecosystem.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog List Grid */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {insightsData.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Link href={`/insights/${post.slug}`}>
                  <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden mb-8 border border-white/10 glass-dark">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-6 left-6">
                      <span className="px-4 py-2 rounded-full glass text-xs font-bold text-primary uppercase tracking-wider">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 px-2">
                    <div className="flex items-center space-x-6 text-sm text-foreground/40 font-medium">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-primary/60" />
                        {post.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-primary/60" />
                        {post.readTime}
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold group-hover:text-primary transition-colors leading-tight">
                      {post.title}
                    </h3>

                    <p className="text-foreground/60 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="pt-4 flex items-center text-primary font-bold group-hover:translate-x-2 transition-transform duration-300">
                      <span>Read Full Article</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
