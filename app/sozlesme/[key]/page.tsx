'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '')

const TITLES: Record<string, string> = {
  privacy_policy:   'Gizlilik Politikasi',
  terms_of_service: 'Kullanim Kosullari',
  help:             'Yardim',
}

export default function SozlesmePage() {
  const { key } = useParams<{ key: string }>()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/site-config/${key}`)
      .then(r => r.json())
      .then(d => { setContent(d.value || ''); setLoading(false) })
      .catch(() => setLoading(false))
  }, [key])

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link href="/profil" className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-6 transition-colors">
          <ChevronLeft size={16} /> Geri
        </Link>
        <h1 className="text-xl font-black text-white mb-6">{TITLES[key] ?? key}</h1>
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-4 bg-white/[0.06] rounded animate-pulse" />)}
          </div>
        ) : (
          <div className="prose prose-invert max-w-none">
            {content.split('\n').map((line, i) => (
              <p key={i} className="text-sm text-white/60 leading-relaxed mb-3">{line}</p>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}