'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProjectGalleryProps {
  images: string[]
  title: string
}

export default function ProjectGallery({ images, title }: ProjectGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  // Filter out empty or duplicate entries just in case
  const galleryImages = images.filter(Boolean)

  if (galleryImages.length === 0) return null

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % galleryImages.length)
  }

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
  }

  const activeImage = galleryImages[activeIndex]

  // Map medium path to original for higher resolution details
  const displayActiveImage = activeImage.startsWith('/')
    ? activeImage.replace('/projects/medium/', '/projects/original/')
    : activeImage

  return (
    <div className="space-y-6">
      {/* Main Container */}
      <div className="relative w-full h-[300px] md:h-[600px] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-black/20 group">
        
        {/* Ambient Background Blur (Updates based on active image) */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`ambient-${activeIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 select-none pointer-events-none"
          >
            <Image
              src={displayActiveImage}
              alt=""
              fill
              sizes="100vw"
              className="object-cover blur-3xl scale-105"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Main Foreground Image Container */}
        <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8 z-10">
          <div className="relative w-full h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={`main-${activeIndex}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full relative"
              >
                <Image
                  src={displayActiveImage}
                  alt={`${title} screenshot ${activeIndex + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 90vw"
                  className="object-contain object-center rounded-lg drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Ambient Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent pointer-events-none z-10" />

        {/* Navigation Arrows */}
        {galleryImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition border border-white/5 opacity-0 group-hover:opacity-100 focus:opacity-100 z-20"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition border border-white/5 opacity-0 group-hover:opacity-100 focus:opacity-100 z-20"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Slide Counter Indicator */}
        {galleryImages.length > 1 && (
          <div className="absolute bottom-6 right-6 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md text-[10px] font-bold text-white/80 tracking-widest border border-white/10 z-20">
            {activeIndex + 1} / {galleryImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails Grid underneath */}
      {galleryImages.length > 1 && (
        <div className="flex flex-wrap justify-center gap-3 px-2">
          {galleryImages.map((image, index) => {
            const displayThumb = image.startsWith('/')
              ? image.replace('/projects/medium/', '/projects/thumbnails/')
              : image

            return (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`relative w-20 h-16 md:w-28 md:h-20 rounded-xl overflow-hidden border-2 bg-black/10 transition-all ${
                  index === activeIndex
                    ? 'border-primary scale-105 shadow-lg shadow-primary/20'
                    : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                }`}
              >
                <Image
                  src={displayThumb}
                  alt={`${title} thumbnail ${index + 1}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
