"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your Root Nexus AI Assistant. How can I help you today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[210px] right-8 z-50 w-14 h-14 rounded-full bg-primary text-black flex items-center justify-center shadow-2xl shadow-primary/40 group"
      >
        <Bot className="w-7 h-7 group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full animate-ping" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[60] w-[90vw] md:w-[400px] h-[600px] bg-black border border-blue-500/20 rounded-[2rem] shadow-[0_0_50px_rgba(0,242,255,0.15)] flex flex-col overflow-hidden"
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
                  className="absolute w-20 h-20 rounded-full bg-gradient-to-t from-blue-500/10 to-transparent blur-2xl"
                />
              ))}
            </div>

            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-blue-600/10 to-transparent border-b border-blue-500/10 flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <Bot className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Nexus AI</h3>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#00f2ff]" />
                    <span className="text-[10px] uppercase tracking-widest text-blue-400/60 font-bold">Secure Connection</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/40" />
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
                      msg.role === "assistant" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-white/5 border-white/10 text-white/40"
                    }`}>
                      {msg.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "assistant" 
                        ? "bg-white/5 border border-white/10 text-white/90" 
                        : "bg-blue-600 text-white font-medium shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2 bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form 
              onSubmit={handleSubmit}
              className="p-6 border-t border-blue-500/10 bg-black/40 relative z-10"
            >
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-blue-500/50 transition-colors text-white"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 flex items-center justify-center space-x-2 opacity-30">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white">Root Nexus AI Intelligence</span>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
