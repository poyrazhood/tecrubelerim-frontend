import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { KATEGORI_MAP } from '@/lib/kategori-map'
import KategoriClient from './kategori-client'

const SITE_URL = 'https://tecrubelerim.com'

export async function generateStaticParams() {
  const slugs = ["alisveris","egitim","eglence-kultur","evcil-hayvan","guzellik-bakim","hizmetler","konaklama","saglik-medikal","ulasim","yeme-icme","restoran","kafe","oto-servis","spor-fitness","hastane","otel","kuafor-berber","veteriner","eczane","market"]
  return slugs.map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const kat = KATEGORI_MAP[params.slug]
  if (!kat) return { title: 'Tecrubelerim' }
  const title = kat.name + ' - Tum Turkiye | Tecrubelerim'
  const description = 'Turkiye genelinde en guvenilir ' + kat.name.toLowerCase() + ' isletmeleri. Gercek kullanici yorumlari ve TrustScore degerlendirmeleri.'
  const url = SITE_URL + '/kategori/' + params.slug
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', siteName: 'Tecrubelerim', locale: 'tr_TR' },
  }
}

export default function KategoriPage({ params }: { params: { slug: string } }) {
  const kat = KATEGORI_MAP[params.slug]
  if (!kat) notFound()
  return <KategoriClient slug={params.slug} katName={kat.name} />
}
