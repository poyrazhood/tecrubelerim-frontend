import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { IL_ILCE_MAP } from '@/lib/il-ilce-map'
import DistrictPageClient from './district-client'

const SITE_URL = 'https://tecrubelerim.com'

export async function generateStaticParams() {
  return [
    { city: 'istanbul', category: 'kadikoy' },
    { city: 'istanbul', category: 'besiktas' },
    { city: 'istanbul', category: 'sisli' },
    { city: 'istanbul', category: 'uskudar' },
    { city: 'istanbul', category: 'maltepe' },
    { city: 'ankara', category: 'cankaya' },
    { city: 'ankara', category: 'kecioren' },
    { city: 'ankara', category: 'yenimahalle' },
    { city: 'izmir', category: 'karsiyaka' },
    { city: 'izmir', category: 'bornova' },
    { city: 'izmir', category: 'buca' },
    { city: 'bursa', category: 'osmangazi' },
    { city: 'bursa', category: 'nilufer' },
    { city: 'antalya', category: 'muratpasa' },
    { city: 'antalya', category: 'kepez' },
  ]
}

export async function generateMetadata({ params }: { params: { city: string; category: string } }): Promise<Metadata> {
  const cityData = IL_ILCE_MAP[params.city]
  if (!cityData) return { title: 'Tecrubelerim' }
  const districtName = cityData.ilceler[params.category]
  if (!districtName) return { title: 'Tecrubelerim' }

  const title = districtName + ', ' + cityData.il + ' Isletmeleri - Yorumlar | Tecrubelerim'
  const description = districtName + ' bolgesindeki en guvenilir isletmeler. Gercek kullanici yorumlari ve TrustScore degerlendirmeleri.'
  const url = SITE_URL + '/' + params.city + '/' + params.category

  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', siteName: 'Tecrubelerim', locale: 'tr_TR' },
  }
}

export default function DistrictPage({ params }: { params: { city: string; category: string } }) {
  const cityData = IL_ILCE_MAP[params.city]
  if (!cityData) notFound()
  const districtName = cityData.ilceler[params.category]
  if (!districtName) notFound()
  return <DistrictPageClient city={params.city} cityName={cityData.il} district={params.category} districtName={districtName} />
}
