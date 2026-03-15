import { MetadataRoute } from 'next'

const SITE_URL = 'https://tecrubelerim.com'
const BATCH_SIZE = 50000

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Toplam işletme sayısını çek
  let total = 432361 // fallback
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/businesses/count`, { next: { revalidate: 86400 } })
    if (res.ok) {
      const data = await res.json()
      total = data.total ?? total
    }
  } catch {}

  const batchCount = Math.ceil(total / BATCH_SIZE)
  const now = new Date()

  const sitemaps: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/sitemap/static.xml`, lastModified: now },
    { url: `${SITE_URL}/sitemap/cities.xml`, lastModified: now },
    { url: `${SITE_URL}/sitemap/categories.xml`, lastModified: now },
    { url: `${SITE_URL}/sitemap/districts.xml`, lastModified: now },
    { url: `${SITE_URL}/sitemap/kategori-cities.xml`, lastModified: now },
  ]

  for (let i = 1; i <= batchCount; i++) {
    sitemaps.push({
      url: `${SITE_URL}/sitemap/businesses-${i}.xml`,
      lastModified: now,
    })
  }

  return sitemaps
}
