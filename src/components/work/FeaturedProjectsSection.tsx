'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, ExternalLink } from 'lucide-react'
import type { Project } from '@/types/admin'

interface FeaturedProjectsSectionProps {
  projects: Omit<Project, '_id'>[]
}

export default function FeaturedProjectsSection({ projects }: FeaturedProjectsSectionProps) {
  if (!projects || projects.length === 0) return null

  const featured = projects.filter(p => p.isFeatured).slice(0, 3)
  if (featured.length === 0) return null

  return (
    <section className="py-20 relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <p className="text-xs font-bold text-primary tracking-[0.3em] uppercase mb-3">Featured Work</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold">
              Selected <span className="text-gradient">Projects</span>
            </h2>
          </div>
          <Link
            href="#all-projects"
            className="hidden md:inline-flex items-center gap-2 text-sm text-foreground/50 hover:text-primary transition-colors font-medium"
          >
            View All Projects
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Featured grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] hover:border-primary/30 transition-all duration-500 ${
                index === 0 && featured.length >= 2 ? 'md:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <Link href={`/work/${project.slug}`} className="block">
                {/* Image */}
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-white/5">
                  <Image
                    src={project.thumbnail || project.image}
                    alt={project.imageAlt || project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                  {/* Category badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="text-[10px] font-bold text-white/90 tracking-[0.2em] uppercase px-3 py-1.5 rounded-full glass-dark border border-white/10">
                      {project.category}
                    </span>
                  </div>

                  {/* Arrow icon on hover */}
                  <div className="absolute top-4 right-4 z-10 w-10 h-10 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-1 group-hover:translate-x-1">
                    <ArrowUpRight className="w-5 h-5 text-black" />
                  </div>

                  {/* Featured badge */}
                  <div className="absolute bottom-4 right-4 z-10">
                    <span className="text-[9px] font-bold text-primary tracking-widest uppercase px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
                      Featured
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-sm text-foreground/50 line-clamp-2 leading-relaxed mb-4">
                    {project.shortDescription}
                  </p>

                  {/* Website link preview */}
                  {project.websiteUrl && (
                    <div className="flex items-center gap-1.5 text-xs text-foreground/30 group-hover:text-primary/60 transition-colors">
                      <ExternalLink className="w-3 h-3" />
                      <span className="truncate">{project.websiteUrl.replace(/^https?:\/\//, '')}</span>
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile view all link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center md:hidden"
        >
          <Link
            href="#all-projects"
            className="inline-flex items-center gap-2 text-sm text-foreground/50 hover:text-primary transition-colors font-medium"
          >
            View All Projects
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
