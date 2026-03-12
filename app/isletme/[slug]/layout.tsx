import type { Metadata } from 'next'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  try {
    const res = await fetch(`${API_BASE}/businesses/${params.slug}`, { next: { revalidate: 3600 } })
    if (!res.ok) return { title: 'Isletme Bulunamadi' }
    const data = await res.json()
    const b = data.business ?? data

    const title = `${b.name} — ${b.district ?? ''} ${b.city ?? ''}`.trim()
    const description = b.description
      ? b.description.slice(0, 155)
      : `${b.name} hakkinda yorumlar, puanlar ve bilgiler. Tecrubelerim'de guvenilir kullanici deneyimleri.`
    const image = b.photos?.[0]?.url ?? 'https://tecrubelerim.com/og-default.png'
    const url = `https://tecrubelerim.com/isletme/${params.slug}`

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        url,
        type: 'website',
        siteName: 'Tecrubelerim',
        images: [{ url: image, width: 1200, height: 630, alt: b.name }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
    }
  } catch {
    return { title: 'Tecrubelerim' }
  }
}

export default function SlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}