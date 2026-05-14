"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Phone } from "lucide-react";
import { useUI } from "@/context/UIContext";

export default function FloatingActions() {
  const { isAssistantOpen } = useUI();
  const phoneNumber = "+917012402892";
  const whatsappMessage = encodeURIComponent("Hello Root Nexus! I'm interested in starting a project with you.");

  return (
    <AnimatePresence>
      {!isAssistantOpen && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="fixed bottom-8 right-8 z-[100] flex flex-col space-y-4"
        >
          {/* Phone Link */}
          <motion.a
            href={`tel:${phoneNumber}`}
            initial={{ opacity: 0, scale: 0.5, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 bg-white text-black rounded-full shadow-2xl flex items-center justify-center border border-white/20 glass transition-colors hover:bg-primary/20"
            title="Call Us"
          >
            <Phone className="w-6 h-6" />
          </motion.a>

          {/* WhatsApp Link */}
          <motion.a
            href={`https://wa.me/${phoneNumber.replace('+', '')}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.5, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 bg-[#25D366] text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-[#20ba5a] transition-colors"
            title="Chat on WhatsApp"
          >
            <MessageCircle className="w-7 h-7" />
          </motion.a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
