"use client";

import { motion } from "framer-motion";
import { Cpu, Globe, Shield, Target, Award, Users, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const stats = [
  { label: "Technologies", value: "15+" },
  { label: "AI Models", value: "Custom" },
  { label: "Security", value: "JWT-Based" },
  { label: "Performance", value: "99.9%" },
];

const values = [
  {
    icon: Target,
    title: "The Root",
    description: "Every great digital product starts with a solid foundation. We focus on deep technical expertise in FastAPI, Python, and React to ensure your 'roots' are unbreakable."
  },
  {
    icon: Globe,
    title: "The Nexus",
    description: "Connectivity is everything. We build the bridges between your foundational ideas and the modern digital ecosystem, ensuring seamless integration across all platforms."
  },
  {
    icon: Shield,
    title: "Security First",
    description: "Leveraging advanced JWT authentication and secure data collection protocols to protect your intellectual property and user data."
  }
];

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-24 bg-background overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-24 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1.5 mb-6 rounded-full glass border-white/10 text-primary text-sm font-medium tracking-wider uppercase"
            >
              Our Story
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-display font-bold mb-8 leading-tight"
            >
              Engineering the <span className="text-primary text-glow">Future</span> of Digital Growth
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-foreground/60 leading-relaxed"
            >
              Founded by Rajapandi M, Root Nexus is a technology startup dedicated to 
              transforming foundational concepts into scalable, AI-powered digital ecosystems. 
              We bridge the gap between human innovation and technical precision.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-white/5 bg-white/2">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-display font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-foreground/40 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="text-4xl font-display font-bold mb-8">
                The Root Nexus <span className="text-primary">Philosophy</span>
              </h2>
              <div className="space-y-12">
                {values.map((value, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex space-x-6"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <value.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                      <p className="text-foreground/60 leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square glass rounded-[3rem] p-12 flex items-center justify-center border-white/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 group-hover:opacity-20 transition-opacity" />
                <Cpu className="w-48 h-48 text-primary animate-pulse" />
                
                {/* Achievement Badge */}
                <div className="absolute bottom-8 right-8 glass p-6 rounded-2xl border-white/10">
                  <div className="flex items-center space-x-3">
                    <Award className="text-primary w-6 h-6" />
                    <span className="font-bold">Next-Gen AI Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-24 px-6 bg-white/2">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 text-primary mb-8"
          >
            <Users className="w-5 h-5" />
            <span className="font-bold uppercase tracking-widest text-sm">Leadership</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-12">Meet the Architect</h2>
          
          <div className="glass p-12 rounded-[3rem] border-white/10 flex flex-col md:flex-row items-center gap-12 text-left">
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-primary/20 shrink-0">
              <img 
                src="/rajapandi.jpeg" 
                alt="Rajapandi M - Founder" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-2">Rajapandi M</h3>
              <p className="text-primary font-medium mb-6 uppercase tracking-wider text-sm">Founder & Lead Architect</p>
              <p className="text-lg text-foreground/70 leading-relaxed mb-8">
                With a strong foundation in Computer Science and a passion for 
                intelligent digital systems, Rajapandi founded Root Nexus to 
                bridge the gap between foundational ideas and modern digital ecosystems. 
                His expertise in FastAPI, React, and Neural Networks drives the 
                innovation behind every project we deliver.
              </p>
              <div className="flex flex-wrap gap-4">
                {["Python", "FastAPI", "React", "AI/ML"].map((skill) => (
                  <span key={skill} className="px-4 py-2 rounded-full glass border-white/10 text-xs font-bold uppercase tracking-widest text-foreground/40">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass p-16 rounded-[4rem] border-white/10 relative overflow-hidden text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -z-10" />
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">
              Ready to Expand Your <span className="text-primary">Nexus?</span>
            </h2>
            <p className="text-xl text-foreground/60 mb-12 max-w-2xl mx-auto">
              Join us at the intersection of technology and vision. Let&apos;s build 
              something future-ready together.
            </p>
            <Link 
              href="/#contact"
              className="inline-flex items-center px-12 py-5 rounded-full bg-primary text-black font-bold hover:bg-primary/90 transition-all hover:scale-105 shadow-xl shadow-primary/20 group"
            >
              <span>Get in Touch</span>
              <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
