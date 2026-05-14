"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { sendContactForm } from "@/app/actions";

export default function ContactSection() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await sendContactForm(formData);
    
    if (result.success) {
      setIsSuccess(true);
    }
    setIsPending(false);
  }

  return (
    <section id="contact" className="py-16 md:py-24 relative overflow-hidden bg-grid">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto glass-dark rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Contact Info */}
            <div className="p-8 md:p-16 bg-gradient-to-br from-primary/10 to-secondary/10 relative">
              <div className="relative z-10">
                <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-4">
                  Connect with Us
                </h2>
                <h3 className="text-3xl md:text-4xl font-display font-bold mb-8">
                  Let&apos;s Start Your <span className="text-gradient">Journey</span>
                </h3>
                <p className="text-foreground/60 mb-12 leading-relaxed">
                  Have a vision that needs scaling? Our team is ready to help you 
                  bridge the gap between idea and digital reality.
                </p>

                <div className="space-y-8">
                  {[
                    { icon: Mail, label: "Email", value: "mrajpandi192005@gmail.com" },
                    { icon: Phone, label: "Phone", value: "+91 7012402892" },
                    { icon: MapPin, label: "Location", value: "Kanthalloor, Kerala" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-xl glass flex items-center justify-center text-primary shrink-0">
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-1">
                          {item.label}
                        </p>
                        <p className="text-lg font-medium break-words md:break-normal">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Removed Decorative Blob */}
            </div>

            {/* Contact Form */}
            <div className="p-8 md:p-16 bg-background relative">
              {isSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-bold">Message Sent!</h3>
                  <p className="text-foreground/60">
                    Thank you for reaching out. Our team will review your project 
                    details and get back to you within 24 hours.
                  </p>
                  <button 
                    onClick={() => setIsSuccess(false)}
                    className="text-primary font-bold hover:underline"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground/60 px-2">Name</label>
                      <input
                        name="name"
                        type="text"
                        required
                        placeholder="John Doe"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground/60 px-2">Email</label>
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="john@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground/60 px-2">Service Needed</label>
                      <select 
                        name="service"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary outline-none transition-colors appearance-none"
                      >
                        <option className="bg-background">Web Development</option>
                        <option className="bg-background">Digital Marketing</option>
                        <option className="bg-background">Automation & AI</option>
                        <option className="bg-background">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground/60 px-2">Timeline</label>
                      <select 
                        name="timeline"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary outline-none transition-colors appearance-none"
                      >
                        <option className="bg-background">ASAP (within 1 month)</option>
                        <option className="bg-background">1-3 Months</option>
                        <option className="bg-background">3-6 Months</option>
                        <option className="bg-background">Flexible</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground/60 px-2">Budget Range</label>
                    <select 
                      name="budget"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary outline-none transition-colors appearance-none"
                    >
                      <option className="bg-background">Less than ₹50,000</option>
                      <option className="bg-background">₹50,000 - ₹1,00,000</option>
                      <option className="bg-background">₹1,00,000 - ₹5,00,000</option>
                      <option className="bg-background">More than ₹5,00,000</option>
                      <option className="bg-background">To be discussed</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground/60 px-2">Message & Scope</label>
                    <textarea
                      name="message"
                      rows={4}
                      required
                      placeholder="Tell us about your project scope..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary outline-none transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-black font-bold py-5 rounded-2xl flex items-center justify-center space-x-3 transition-transform hover:scale-[1.02] shadow-xl shadow-primary/20 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isPending ? (
                      <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
