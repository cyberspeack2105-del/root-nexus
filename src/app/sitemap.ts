import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://rootnexus.com' // Replace with actual domain when ready
  
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

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...serviceRoutes,
  ]
}
