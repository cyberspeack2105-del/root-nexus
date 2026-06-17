import type { Project } from '@/types/admin'

/**
 * Converts a MongoDB Project object to a plain serializable object.
 * Strips the _id field (which contains ObjectId) and returns only
 * serializable fields that can be passed from Server Components to Client Components.
 */
export function serializeProject(project: Project): Omit<Project, '_id'> {
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    category: project.category,
    shortDescription: project.shortDescription,
    image: project.image,
    thumbnail: project.thumbnail,
    imageAlt: project.imageAlt,
    websiteUrl: project.websiteUrl,
    demoUrl: project.demoUrl,
    client: project.client,
    timeline: project.timeline,
    results: project.results ?? [],
    content: project.content,
    isFeatured: project.isFeatured ?? false,
    tags: project.tags ?? [],
    screenshots: project.screenshots ?? [],
    createdAt: project.createdAt ? String(project.createdAt) : '',
    updatedAt: project.updatedAt ? String(project.updatedAt) : '',
  }
}

/**
 * Converts an array of MongoDB Project objects to plain serializable objects.
 */
export function serializeProjects(projects: Project[]): Omit<Project, '_id'>[] {
  return projects.map(serializeProject)
}
