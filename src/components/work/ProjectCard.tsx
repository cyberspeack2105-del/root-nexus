'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, ExternalLink } from 'lucide-react'
import type { Project } from '@/types/admin'

interface ProjectCardProps {
  project: Omit<Project, '_id'>
  index: number
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
      className="group flex flex-col rounded-3xl border border-white/8 bg-white/[0.015] hover:border-primary/25 hover:bg-white/[0.03] transition-all duration-500 overflow-hidden"
    >
      <Link href={`/work/${project.slug}`} className="flex flex-col h-full">
        {/* Thumbnail */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-white/5">
          <Image
            src={project.thumbnail || project.image}
            alt={project.imageAlt || project.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Category badge */}
          <div className="absolute top-4 left-4">
            <span className="text-[10px] font-bold text-white/80 tracking-[0.2em] uppercase px-3 py-1.5 rounded-full glass-dark">
              {project.category}
            </span>
          </div>

          {/* Arrow icon */}
          <div className="absolute top-4 right-4 w-10 h-10 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <ArrowUpRight className="w-5 h-5 text-black" />
          </div>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {project.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-[9px] font-medium text-white/60 tracking-wide px-2 py-0.5 rounded bg-black/40 backdrop-blur-sm">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-6">
          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
            {project.title}
          </h3>
          <p className="text-sm text-foreground/50 line-clamp-2 leading-relaxed flex-1 mb-4">
            {project.shortDescription}
          </p>

          {/* Footer row */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            {/* Website link */}
            {project.websiteUrl && (
              <div className="flex items-center gap-1.5 text-xs text-foreground/30 group-hover:text-primary/60 transition-colors truncate max-w-[150px]">
                <ExternalLink className="w-3 h-3 shrink-0" />
                <span className="truncate">{project.websiteUrl.replace(/^https?:\/\//, '').split('/')[0]}</span>
              </div>
            )}

            {/* Read more */}
            <span className="text-xs font-semibold text-primary/0 group-hover:text-primary transition-colors ml-auto flex items-center gap-1">
              Read More <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
