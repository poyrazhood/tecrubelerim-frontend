import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/profil', '/bildirimler', '/sahip-paneli'],
      },
    ],
    sitemap: 'https://tecrubelerim.com/sitemap.xml',
  }
}