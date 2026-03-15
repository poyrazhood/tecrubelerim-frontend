import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { KATEGORI_MAP } from '@/lib/kategori-map'
import { IL_ILCE_MAP } from '@/lib/il-ilce-map'
import KategoriCityClient from './kategori-city-client'
import Script from 'next/script'

const SITE_URL = 'https://tecrubelerim.com'

export async function generateStaticParams() {
  const slugs = ["restoran","kafe","oto-servis","guzellik-bakim","spor-fitness","hastane","otel","market","eczane","kuafor-berber"]
  const cities = ["istanbul","ankara","izmir","bursa","antalya","adana","konya","gaziantep","mersin","kayseri"]
  const params = []
  for (const slug of slugs) {
    for (const city of cities) {
      params.push({ slug, city })
    }
  }
  return params
}

export async function generateMetadata({ params }: { params: { slug: string; city: string } }): Promise<Metadata> {
  const kat = KATEGORI_MAP[params.slug]
  const cityData = IL_ILCE_MAP[params.city]
  if (!kat || !cityData) return { title: 'Tecrubelerim' }
  const title = cityData.il + ' ' + kat.name + ' - Yorumlar | Tecrubelerim'
  const description = cityData.il + ' ilindeki en guvenilir ' + kat.name.toLowerCase() + ' isletmeleri. Gercek kullanici yorumlari ve TrustScore degerlendirmeleri.'
  const url = SITE_URL + '/kategori/' + params.slug + '/' + params.city
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', siteName: 'Tecrubelerim', locale: 'tr_TR' },
  }
}

export default async function KategoriCityPage({ params }: { params: { slug: string; city: string } }) {
  const kat = KATEGORI_MAP[params.slug]
  const cityData = IL_ILCE_MAP[params.city]
  if (!kat || !cityData) notFound()

  let businesses: any[] = []
  try {
    const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '')
    const res = await fetch(API + '/api/businesses?categorySlug=' + params.slug + '&city=' + encodeURIComponent(cityData.il) + '&limit=10&sortBy=trustScore', { next: { revalidate: 3600 } })
    if (res.ok) { const d = await res.json(); businesses = d.businesses ?? d.data ?? [] }
  } catch {}

  const itemListLd = businesses.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: cityData.il + ' ' + kat.name,
    description: cityData.il + ' ilindeki en guvenilir ' + kat.name.toLowerCase() + ' isletmeleri',
    numberOfItems: businesses.length,
    itemListElement: businesses.map((b: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: 'https://tecrubelerim.com/isletme/' + b.slug,
      name: b.name,
    }))
  } : null

  return (
    <>
      {itemListLd && (
        <Script
          id="itemlist-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
          strategy="beforeInteractive"
        />
      )}
      <KategoriCityClient slug={params.slug} katName={kat.name} city={params.city} cityName={cityData.il} />
    </>
  )
}
