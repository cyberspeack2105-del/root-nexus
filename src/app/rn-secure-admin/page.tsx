import Link from 'next/link'
import { verifyAdminSession } from '@/lib/dal'
import { getAllProjects } from '@/lib/db'
import { serializeProjects } from '@/lib/serialize'
import ProjectList from '@/components/admin/ProjectList'
import type { Project } from '@/types/admin'

export default async function AdminDashboard() {
  await verifyAdminSession()

  let projects: Omit<Project, '_id'>[] = []
  let error: string | undefined

  try {
    const dbProjects = await getAllProjects()
    projects = serializeProjects(dbProjects)
  } catch (err) {
    console.error('[AdminDashboard] Failed to fetch projects:', err)
    error = 'Failed to load projects. Please refresh the page.'
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Projects</h1>
        <Link
          href="/rn-secure-admin/new"
          className="bg-white text-black py-2 px-4 rounded font-semibold text-sm hover:bg-gray-200 transition"
        >
          Add New Project
        </Link>
      </div>
      <ProjectList projects={projects} error={error} />
    </div>
  )
}
