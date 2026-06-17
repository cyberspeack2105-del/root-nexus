import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/', '/rn-secure-admin/'],
    },
    sitemap: 'https://rootnexus.com/sitemap.xml',
  }
}
