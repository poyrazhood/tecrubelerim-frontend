import type { Metadata } from 'next'
import Script from 'next/script'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
const SITE_URL = 'https://tecrubelerim.com'

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  try {
    const res = await fetch(`${API_BASE}/businesses/${params.slug}`, { next: { revalidate: 3600 } })
    if (!res.ok) return { title: 'İşletme Bulunamadı | Tecrübelerim' }
    const data = await res.json()
    const b = data.business ?? data

    const location = [b.district, b.city].filter(Boolean).join(', ')
    const title = `${b.name} – ${location} | Tecrübelerim`
    const description = b.description
      ? b.description.slice(0, 155)
      : `${b.name} hakkında yorumlar, puanlar ve bilgiler. ${location} bölgesinde ${b.category?.name ?? 'işletme'}. Tecrübelerim'de güvenilir kullanıcı deneyimleri.`
    const image = b.photos?.[0]?.url ?? `${SITE_URL}/og-default.png`
    const url = `${SITE_URL}/isletme/${params.slug}`

    return {
      title,
      description,
      alternates: { canonical: url },
      keywords: [b.name, b.category?.name, b.city, b.district, 'yorum', 'değerlendirme', 'güvenilir'].filter(Boolean),
      openGraph: {
        title,
        description,
        url,
        type: 'website',
        siteName: 'Tecrübelerim',
        locale: 'tr_TR',
        images: [{ url: image, width: 1200, height: 630, alt: b.name }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
        site: '@tecrubelerim',
      },
    }
  } catch {
    return { title: 'Tecrübelerim – Güvenilir İşletme Yorumları' }
  }
}

async function getBusinessForSchema(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/businesses/${slug}`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const data = await res.json()
    return data.business ?? data
  } catch { return null }
}

export default async function SlugLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode
  params: { slug: string }
}) {
  const b = await getBusinessForSchema(params.slug)
  
  const jsonLd = b ? {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: b.name,
    description: b.description ?? undefined,
    url: `${SITE_URL}/isletme/${params.slug}`,
    telephone: b.phoneNumber ?? undefined,
    address: b.address ? {
      '@type': 'PostalAddress',
      streetAddress: b.address,
      addressLocality: b.district ?? b.city,
      addressRegion: b.city,
      addressCountry: 'TR',
    } : undefined,
    geo: (b.latitude && b.longitude) ? {
      '@type': 'GeoCoordinates',
      latitude: b.latitude,
      longitude: b.longitude,
    } : undefined,
    aggregateRating: b.totalReviews > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: (b.averageRating ?? 0).toFixed(1),
      reviewCount: b.totalReviews,
      bestRating: '5',
      worstRating: '1',
    } : undefined,
    image: b.photos?.[0]?.url ?? undefined,
    priceRange: b.priceRange ?? undefined,
    openingHoursSpecification: b.openingHours?.map((h: any) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.dayOfWeek,
      opens: h.opensAt,
      closes: h.closesAt,
    })) ?? undefined,
  } : null

  return (
    <>
      {jsonLd && (
        <Script
          id="business-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          strategy="beforeInteractive"
        />
      )}
      {children}
    </>
  )
}
