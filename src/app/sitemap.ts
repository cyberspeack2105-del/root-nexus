import { MetadataRoute } from 'next'
import { getAllProjects } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://rootnexus.com'
  
  const serviceRoutes = [
    'web-development',
    'digital-marketing',
    'automation-ai',
    'smart-experiences'
  ].map(slug => ({
    url: `${baseUrl}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  let projectRoutes: MetadataRoute.Sitemap = []
  try {
    const projects = await getAllProjects()
    projectRoutes = projects.map(p => ({
      url: `${baseUrl}/work/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch (err) {
    console.error('[sitemap] Failed to fetch projects:', err)
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/work`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    ...serviceRoutes,
    ...projectRoutes,
  ]
}
