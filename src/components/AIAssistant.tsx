"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, User, Sparkles, Sparkle } from "lucide-react";
import { useUI } from "@/context/UIContext";

const GeminiIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" />
  </svg>
);

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function AIAssistant() {
  const { isAssistantOpen: isOpen, setIsAssistantOpen: setIsOpen } = useUI();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm Nora, your Root Nexus AI Assistant. How can I help you today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: messages.concat(userMessage).map(m => ({ role: m.role, content: m.content })) 
        }),
      });

      const data = await response.json();
      
      if (data.content) {
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: data.content,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <AnimatePresence>
        {!isOpen && !isScrolled && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-[210px] right-8 z-50 w-14 h-14 rounded-full bg-secondary text-white flex items-center justify-center shadow-2xl shadow-secondary/40 group"
          >
            <GeminiIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-ping" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[60] w-[90vw] md:w-[400px] h-[80vh] md:h-[600px] bg-white border border-secondary/20 rounded-[2rem] shadow-[0_0_50px_rgba(139,92,246,0.15)] flex flex-col overflow-hidden"
          >
            {/* Animated Background Bubbles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 600, opacity: 0, x: Math.random() * 400 }}
                  animate={{ 
                    y: -100, 
                    opacity: [0, 0.5, 0],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 10 + Math.random() * 10,
                    repeat: Infinity,
                    delay: Math.random() * 10,
                    ease: "linear"
                  }}
                  className="absolute w-20 h-20 rounded-full bg-gradient-to-t from-secondary/10 to-transparent blur-2xl"
                />
              ))}
            </div>

            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-secondary/10 to-transparent border-b border-secondary/10 flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center border border-secondary/30">
                  <GeminiIcon className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <div className="relative inline-flex mb-0.5 mt-1">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-[#D96570] via-[#8B5CF6] to-[#4285F4] text-transparent bg-clip-text font-display tracking-tight pr-3">
                      Nora AI
                    </h3>
                    <Sparkle className="absolute -top-1.5 right-1 w-4 h-4 text-[#4285F4] fill-[#4285F4]" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_10px_#8B5CF6]" />
                    <span className="text-[10px] uppercase tracking-widest text-secondary/60 font-bold">Secure Connection</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide relative z-10"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex items-start space-x-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      msg.role === "assistant" ? "bg-secondary/10 border-secondary/30 text-secondary" : "bg-gray-100 border-gray-200 text-gray-400"
                    }`}>
                      {msg.role === "assistant" ? <GeminiIcon className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "assistant" 
                        ? "bg-gray-50 border border-gray-100 text-gray-700" 
                        : "bg-secondary text-white font-medium shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2 bg-secondary/5 p-4 rounded-2xl border border-secondary/10">
                    <div className="w-2 h-2 bg-secondary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-secondary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form 
              onSubmit={handleSubmit}
              className="p-6 border-t border-secondary/10 bg-gray-50/80 relative z-10"
            >
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-white border border-gray-200 rounded-xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-secondary/50 transition-colors text-gray-900"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-secondary text-white flex items-center justify-center hover:bg-secondary/90 transition-all disabled:opacity-50 shadow-lg shadow-secondary/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 flex items-center justify-center space-x-2 opacity-30">
                <Sparkles className="w-3 h-3 text-secondary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Nora AI Intelligence</span>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
