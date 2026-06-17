import { notFound } from 'next/navigation'
import { verifyAdminSession } from '@/lib/dal'
import { getProjectById } from '@/lib/db'
import { serializeProject } from '@/lib/serialize'
import ProjectForm from '@/components/admin/ProjectForm'
import { updateProjectAction } from '@/app/actions/projects'

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await verifyAdminSession()

  const { id } = await params
  const project = await getProjectById(id)

  if (!project) {
    notFound()
  }

  const serializedProject = serializeProject(project)
  const boundAction = updateProjectAction.bind(null, id)

  return (
    <div className="container mx-auto px-6 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-8">Edit Project</h1>
      <ProjectForm
        action={boundAction}
        initialData={serializedProject}
        submitLabel="Update Project"
      />
    </div>
  )
}
