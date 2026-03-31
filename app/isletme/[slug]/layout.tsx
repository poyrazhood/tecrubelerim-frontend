import type { Metadata } from 'next'
import Script from 'next/script'

const CATEGORY_SCHEMA_MAP: Record<string, string> = {
  'yeme-icme': 'Restaurant',
  'restoran': 'Restaurant',
  'kafe': 'CafeOrCoffeeShop',
  'konaklama': 'LodgingBusiness',
  'otel': 'Hotel',
  'saglik-medikal': 'MedicalBusiness',
  'hastane': 'Hospital',
  'eczane': 'Pharmacy',
  'guzellik-bakim': 'BeautySalon',
  'kuafor-berber': 'HairSalon',
  'spor-fitness': 'SportsActivityLocation',
  'egitim': 'EducationalOrganization',
  'ulasim': 'AutoRepair',
  'oto-servis': 'AutoRepair',
  'hizmetler': 'HomeAndConstructionBusiness',
  'alisveris': 'Store',
  'market': 'GroceryStore',
  'evcil-hayvan': 'VeterinaryCare',
  'veteriner': 'VeterinaryCare',
  'eglence-kultur': 'EntertainmentBusiness',
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
const SITE_URL = 'https://tecrubelerim.com'

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  try {
    const res = await fetch(`${API_BASE}/businesses/${params.slug}`, { next: { revalidate: 3600 } })
    // FIX 1: "| Tecrübelerim" suffix kaldırıldı.
    // Root layout'taki template: '%s | Tecrubelerim' zaten ekliyor.
    // Eskisi: `${b.name} – ${location} | Tecrübelerim`
    // Yenisi: `${b.name} – ${location}` → render: `${b.name} – ${location} | Tecrubelerim`
    if (!res.ok) return { title: 'İşletme Bulunamadı' }
    const data = await res.json()
    const b = data.business ?? data

    const location = [b.district, b.city].filter(Boolean).join(', ')
    const title = `${b.name} Yorumları – ${location}`
    const description = b.description
      ? b.description.slice(0, 155)
      : `${b.name} hakkında ${b.totalReviews > 0 ? `${b.totalReviews} yorum, ${(b.averageRating ?? 0).toFixed(1)}/5 puan. ` : ''}${location} bölgesinde ${b.category?.name ?? 'işletme'}. Tecrübelerim'de güvenilir kullanıcı deneyimleri.`
    const image = b.photos?.[0]?.url ?? `${SITE_URL}/og-default.png`
    const url = `${SITE_URL}/isletme/${params.slug}`

    return {
      title,
      description,
      alternates: { canonical: url },
      keywords: [b.name, b.category?.name, b.city, b.district, 'yorum', 'değerlendirme', 'güvenilir', ...(b.attributes?.about?.['Özellikler'] ?? [])].filter(Boolean),
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
    return { title: 'Güvenilir İşletme Yorumları' }
  }
}

async function getBusinessForSchema(slug: string) {
  try {
    const [bRes, rRes, qaRes] = await Promise.all([
      fetch(`${API_BASE}/businesses/${slug}`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE}/businesses/${slug}/reviews?limit=3&sortBy=rating`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE}/businesses/${slug}/qa`, { next: { revalidate: 3600 } }),
    ])
    if (!bRes.ok) return null
    const data = await bRes.json()
    const b = data.business ?? data
    if (qaRes.ok) {
      const qaData = await qaRes.json()
      b._qa = (qaData.qa ?? qaData.data ?? []).filter((q: any) => !q.answer?.includes('bilgi bulunmuyor')).slice(0, 5)
    }
    if (rRes.ok) {
      const rData = await rRes.json()
      b._reviews = rData.reviews ?? rData.data ?? []
    }
    return b
  } catch { return null }
}

export default async function SlugLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { slug: string }
}) {
  const b = await getBusinessForSchema(params.slug)

  const jsonLd = b ? {
    '@context': 'https://schema.org',
    '@type': [CATEGORY_SCHEMA_MAP[b.category?.slug ?? ''] ?? 'LocalBusiness', 'LocalBusiness'].filter((v, i, a) => a.indexOf(v) === i),
    name: b.name,
    description: b.description ?? undefined,
    url: `${SITE_URL}/isletme/${params.slug}`,
    telephone: b.phoneNumber ?? undefined,
    address: b.address ? {
      '@type': 'PostalAddress',
      streetAddress: b.address,
      postalCode: b.postalCode ?? b.address?.match(/\b\d{5}\b/)?.[0] ?? undefined,
      addressLocality: b.district ?? b.city,
      addressRegion: b.city,
      addressCountry: 'TR',
    } : undefined,
    geo: (b.latitude && b.longitude) ? {
      '@type': 'GeoCoordinates',
      latitude: b.latitude,
      longitude: b.longitude,
    } : undefined,
    // FIX 2: > 0 yerine >= 3
    // Google'ın yıldız göstermesi için minimum 3 yorum gerekli.
    // 1-2 yorumlu sayfalarda "1 yorum" göstermek CTR'yi düşürüyor.
    aggregateRating: b.totalReviews >= 3 ? {
      '@type': 'AggregateRating',
      ratingValue: (b.averageRating ?? 0).toFixed(1),
      reviewCount: b.totalReviews,
      bestRating: '5',
      worstRating: '1',
    } : undefined,
    image: b.photos?.[0]?.url ?? b.attributes?.coverPhoto ?? undefined,
    priceRange: b.priceRange ?? undefined,
    review: b._reviews?.slice(0, 3).map((r: any) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating,
        bestRating: '5',
        worstRating: '1',
      },
      author: { '@type': 'Person', name: r.user?.name ?? r.user?.username ?? 'Kullanıcı' },
      reviewBody: r.content?.slice(0, 200) ?? undefined,
      datePublished: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : undefined,
    })) ?? undefined,
    openingHoursSpecification: b.openingHours?.map((h: any) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.dayOfWeek,
      opens: h.opensAt,
      closes: h.closesAt,
    })) ?? undefined,
  } : null

  const faqLd = b?._qa?.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: b._qa.map((q: any) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.answer },
    })),
  } : null

  // FIX 3: BreadcrumbList schema eklendi.
  // Google arama sonuçlarında URL'yi "tecrubelerim.com › İstanbul › Konaklama › Royal Escape"
  // formatında gösterir — CTR'yi artırır.
  const breadcrumbLd = b ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Tecrübelerim',
        item: SITE_URL,
      },
      b.city && {
        '@type': 'ListItem',
        position: 2,
        name: b.city,
        item: `${SITE_URL}/${b.citySlug ?? b.city?.toLowerCase().replace(/\s+/g, '-')}`,
      },
      b.category?.name && {
        '@type': 'ListItem',
        position: 3,
        name: b.category.name,
        item: `${SITE_URL}/${b.citySlug ?? b.city?.toLowerCase().replace(/\s+/g, '-')}/${b.category.slug ?? ''}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: b.name,
        item: `${SITE_URL}/isletme/${params.slug}`,
      },
    ].filter(Boolean),
  } : null

  return (
    <>
      {breadcrumbLd && (
        <Script
          id="business-breadcrumbld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
          strategy="beforeInteractive"
        />
      )}
      {faqLd && (
        <Script
          id="business-faqld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
          strategy="beforeInteractive"
        />
      )}
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
