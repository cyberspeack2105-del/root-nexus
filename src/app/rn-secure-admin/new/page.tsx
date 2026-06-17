import { verifyAdminSession } from '@/lib/dal'
import ProjectForm from '@/components/admin/ProjectForm'
import { createProjectAction } from '@/app/actions/projects'

export default async function NewProjectPage() {
  await verifyAdminSession()

  return (
    <div className="container mx-auto px-6 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-8">Add New Project</h1>
      <ProjectForm action={createProjectAction} submitLabel="Create Project" />
    </div>
  )
}
