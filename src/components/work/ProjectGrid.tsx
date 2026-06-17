'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProjectCard from './ProjectCard'
import type { Project } from '@/types/admin'

interface ProjectGridProps {
  projects: Omit<Project, '_id'>[]
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
  const [activeCategory, setActiveCategory] = useState('All')

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category)))]

  const filtered = activeCategory === 'All'
    ? projects
    : projects.filter(p => p.category === activeCategory)

  if (projects.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-foreground/40 text-lg">No projects available yet. Check back soon.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Category filter pills */}
      {categories.length > 2 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-3 mb-12"
        >
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-primary text-black shadow-lg shadow-primary/25'
                  : 'glass border border-white/10 text-foreground/50 hover:text-foreground hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>
      )}

      {/* Projects grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filtered.map((project, index) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <ProjectCard project={project} index={index} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty filtered state */}
      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <p className="text-foreground/40">No projects in this category yet.</p>
        </motion.div>
      )}
    </div>
  )
}
