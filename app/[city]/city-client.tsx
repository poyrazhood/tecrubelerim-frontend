'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { IL_ILCE_MAP } from '@/lib/il-ilce-map'
import { MapPin, Building2, ChevronRight, Search } from 'lucide-react'
import Link from 'next/link'

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '')

interface Business {
  id: string; name: string; slug: string
  category?: { name: string }; district?: string
  trustScore: number; trustGrade: string; totalReviews: number
  photos?: { url: string }[]
}

export default function CityPageClient({ city, cityName }: { city: string; cityName: string }) {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const router = useRouter()

  const cityData = IL_ILCE_MAP[city]
  const districts = cityData ? Object.entries(cityData.ilceler) : []

  useEffect(() => {
    const url = API + '/api/businesses?city=' + encodeURIComponent(cityName) + '&limit=20&sortBy=trustScore'
    fetch(url)
      .then(r => r.json())
      .then(d => { setBusinesses(d.businesses ?? d.data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [cityName])

  const gradeColor = (g: string) => g === 'A' ? '#22C55E' : g === 'B' ? '#84CC16' : '#EAB308'

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#0A0A0A]">
        <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0A0A0A] px-4 pt-8 pb-6">
          <div className="flex items-center gap-2 text-white/40 text-sm mb-3">
            <Link href="/" className="hover:text-white">Ana Sayfa</Link>
            <ChevronRight size={14} />
            <span className="text-white">{cityName}</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{cityName} Isletmeleri</h1>
          <p className="text-white/50 text-sm">Gercek yorumlar ve TrustScore degerlendirmeleri</p>
          <div className="mt-4 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={cityName + "de ara..."}
              className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-white/30 outline-none"
              onKeyDown={e => { if (e.key === 'Enter') router.push('/arama?q=' + search + '&city=' + cityName) }}
            />
          </div>
        </div>
        <div className="px-4 pb-8">
          {districts.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Ilceler</h2>
              <div className="flex flex-wrap gap-2">
                {districts.map(([slug, name]) => (
                  <Link key={slug} href={'/' + city + '/' + slug}
                    className="px-3 py-1.5 bg-white/[0.05] border border-white/[0.08] rounded-full text-sm text-white/70 hover:bg-white/[0.1] hover:text-white transition-all">
                    {name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">En Guvenilir Isletmeler</h2>
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-white/[0.03] rounded-xl animate-pulse" />)}</div>
          ) : businesses.length === 0 ? (
            <div className="text-center py-12 text-white/30">
              <Building2 size={40} className="mx-auto mb-3 opacity-30" />
              <p>Henuz isletme bulunamadi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {businesses.map(b => (
                <Link key={b.id} href={'/isletme/' + b.slug}
                  className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:bg-white/[0.06] transition-all">
                  <div className="w-12 h-12 rounded-lg bg-white/[0.05] overflow-hidden flex-shrink-0">
                    {b.photos?.[0]?.url
                      ? <img src={b.photos[0].url} alt={b.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Building2 size={20} className="text-white/20" /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm truncate">{b.name}</div>
                    <div className="text-white/40 text-xs flex items-center gap-1 mt-0.5">
                      <MapPin size={10} />{b.district ?? cityName} · {b.category?.name}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-lg font-bold" style={{ color: gradeColor(b.trustGrade) }}>{b.trustGrade}</div>
                    <div className="text-white/30 text-xs">{b.totalReviews} yorum</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
