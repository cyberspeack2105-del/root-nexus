'use client'

import Link from 'next/link'
import type { Project } from '@/types/admin'
import DeleteConfirmButton from './DeleteConfirmButton'

function formatDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

interface ProjectListProps {
  projects: Omit<Project, '_id'>[]
  error?: string
}

export default function ProjectList({ projects, error }: ProjectListProps) {
  if (error) {
    return (
      <div role="alert" className="text-red-400 py-4">
        {error}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-gray-400 py-8 text-center">
        No projects yet. Add your first project above.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="border-b border-gray-700">
          <tr>
            <th className="py-3 pr-4 text-gray-400 font-medium">Title</th>
            <th className="py-3 pr-4 text-gray-400 font-medium">Category</th>
            <th className="py-3 pr-4 text-gray-400 font-medium">Slug</th>
            <th className="py-3 pr-4 text-gray-400 font-medium">Created</th>
            <th className="py-3 text-gray-400 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr
              key={project.id}
              className="border-b border-gray-800 hover:bg-gray-900/50"
            >
              <td className="py-3 pr-4 text-white font-medium max-w-[200px] truncate">
                {project.title}
              </td>
              <td className="py-3 pr-4 text-gray-300">{project.category}</td>
              <td className="py-3 pr-4 text-gray-400 font-mono text-xs max-w-[150px] truncate">
                {project.slug}
              </td>
              <td className="py-3 pr-4 text-gray-400">
                {formatDate(project.createdAt)}
              </td>
              <td className="py-3">
                <div className="flex items-center gap-4">
                  <Link
                    href={`/rn-secure-admin/edit/${project.id}`}
                    className="text-blue-400 hover:text-blue-300 text-sm transition"
                  >
                    Edit
                  </Link>
                  <DeleteConfirmButton id={project.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
