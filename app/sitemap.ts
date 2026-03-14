import { MetadataRoute } from 'next'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
const SITE_URL = 'https://tecrubelerim.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL,                   lastModified: new Date(), changeFrequency: 'daily',   priority: 1 },
    { url: `${SITE_URL}/kesfet`,       lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${SITE_URL}/arama`,        lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${SITE_URL}/giris`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/kayit`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  try {
    // Tum isletme slug'larini cek — sayfalama ile
    const allSlugs: string[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const res = await fetch(`${API_BASE}/businesses?page=${page}&limit=1000`, { next: { revalidate: 86400 } })
      if (!res.ok) break
      const data = await res.json()
      const businesses = data.businesses ?? []
      businesses.forEach((b: { slug: string }) => allSlugs.push(b.slug))
      hasMore = businesses.length === 1000
      page++
    }

    const businessPages: MetadataRoute.Sitemap = allSlugs.map(slug => ({
      url: `${SITE_URL}/isletme/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    return [...staticPages, ...businessPages]
  } catch {
    return staticPages
  }
}