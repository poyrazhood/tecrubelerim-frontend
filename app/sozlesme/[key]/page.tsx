import { AppLayout } from '@/components/layout/AppLayout'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '')

const TITLES: Record<string, string> = {
  privacy_policy:   'Gizlilik Politikası',
  terms_of_service: 'Kullanım Koşulları',
  help:             'Yardım',
}

const DESCRIPTIONS: Record<string, string> = {
  privacy_policy:   'tecrubelerim.com gizlilik politikası — kişisel verilerinizi nasıl topladığımızı ve kullandığımızı öğrenin.',
  terms_of_service: 'tecrubelerim.com kullanım koşulları — platformu kullanırken uymanız gereken kurallar.',
  help:             'tecrubelerim.com yardım merkezi — sıkça sorulan sorular ve destek bilgileri.',
}

type Props = {
  params: { key: string }
}

async function getContent(key: string): Promise<string> {
  try {
    const res = await fetch(`${API}/api/site-config/${key}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return ''
    const data = await res.json()
    return data.value ?? ''
  } catch {
    return ''
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const title = TITLES[params.key]
  if (!title) return {}
  return {
    title:       `${title} — tecrubelerim.com`,
    description: DESCRIPTIONS[params.key] ?? '',
    robots:      { index: false },
  }
}

export default async function SozlesmePage({ params }: Props) {
  const { key } = params

  if (!TITLES[key]) notFound()

  const content = await getContent(key)
  const lines = content.split('\n').filter((l: string) => l.trim() !== '')

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link
          href="/profil"
          className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-6 transition-colors"
        >
          <ChevronLeft size={16} /> Geri
        </Link>

        <h1 className="text-xl font-black text-white mb-6">{TITLES[key]}</h1>

        {lines.length === 0 ? (
          <p className="text-sm text-white/40">İçerik henüz yüklenmedi.</p>
        ) : (
          <div className="prose prose-invert max-w-none">
            {lines.map((line: string, i: number) => {
              const isHeading = i > 0 && line.length <= 60 && !line.endsWith('.')
              return isHeading ? (
                <h2 key={i} className="text-base font-bold text-white mt-6 mb-2">
                  {line}
                </h2>
              ) : (
                <p key={i} className="text-sm text-white/60 leading-relaxed mb-3">
                  {line}
                </p>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
