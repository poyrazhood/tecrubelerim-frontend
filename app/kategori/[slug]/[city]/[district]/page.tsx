import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { KATEGORI_MAP } from '@/lib/kategori-map'
import { IL_ILCE_MAP } from '@/lib/il-ilce-map'
import KategoriDistrictClient from './kategori-district-client'

const SITE_URL = 'https://tecrubelerim.com'

export async function generateMetadata({ params }: { params: { slug: string; city: string; district: string } }): Promise<Metadata> {
  const kat = KATEGORI_MAP[params.slug]
  const cityData = IL_ILCE_MAP[params.city]
  if (!kat || !cityData) return { title: 'Tecrubelerim' }
  const districtName = cityData.ilceler[params.district]
  if (!districtName) return { title: 'Tecrubelerim' }
  const title = districtName + ' ' + kat.name + ' - ' + cityData.il + ' | Tecrubelerim'
  const description = districtName + ' bolgesindeki en guvenilir ' + kat.name.toLowerCase() + ' isletmeleri. Gercek kullanici yorumlari ve TrustScore degerlendirmeleri.'
  const url = SITE_URL + '/kategori/' + params.slug + '/' + params.city + '/' + params.district
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', siteName: 'Tecrubelerim', locale: 'tr_TR' },
  }
}

export default function KategoriDistrictPage({ params }: { params: { slug: string; city: string; district: string } }) {
  const kat = KATEGORI_MAP[params.slug]
  const cityData = IL_ILCE_MAP[params.city]
  if (!kat || !cityData) notFound()
  const districtName = cityData.ilceler[params.district]
  if (!districtName) notFound()
  return <KategoriDistrictClient slug={params.slug} katName={kat.name} city={params.city} cityName={cityData.il} district={params.district} districtName={districtName} />
}
