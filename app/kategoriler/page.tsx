'use client'
import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useRouter } from 'next/navigation'
import {
  ShoppingBag, GraduationCap, Music, PawPrint, Sparkles,
  Wrench, Hotel, Heart, Car, UtensilsCrossed,
  ChevronRight, Search, TrendingUp, Star, Building2, Grid3X3
} from 'lucide-react'

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '')

const CATEGORY_META: Record<string, { icon: any; color: string; bg: string; description: string }> = {
  'alisveris':      { icon: ShoppingBag,     color: '#818CF8', bg: 'rgba(129,140,248,0.08)', description: 'Mağaza & AVM' },
  'egitim':         { icon: GraduationCap,   color: '#34D399', bg: 'rgba(52,211,153,0.08)',  description: 'Kurs & Okul' },
  'eglence-kultur': { icon: Music,           color: '#FBBF24', bg: 'rgba(251,191,36,0.08)',  description: 'Etkinlik & Kültür' },
  'evcil-hayvan':   { icon: PawPrint,        color: '#F472B6', bg: 'rgba(244,114,182,0.08)', description: 'Veteriner & Petshop' },
  'guzellik-bakim': { icon: Sparkles,        color: '#C084FC', bg: 'rgba(192,132,252,0.08)', description: 'Kuaför & Spa' },
  'hizmetler':      { icon: Wrench,          color: '#60A5FA', bg: 'rgba(96,165,250,0.08)',  description: 'Tamir & Servis' },
  'konaklama':      { icon: Hotel,           color: '#FB923C', bg: 'rgba(251,146,60,0.08)',  description: 'Otel & Konaklama' },
  'saglik-medikal': { icon: Heart,           color: '#F87171', bg: 'rgba(248,113,113,0.08)', description: 'Sağlık & Klinik' },
  'ulasim':         { icon: Car,             color: '#2DD4BF', bg: 'rgba(45,212,191,0.08)',  description: 'Araç & Ulaşım' },
  'yeme-icme':      { icon: UtensilsCrossed, color: '#FCD34D', bg: 'rgba(252,211,77,0.08)',  description: 'Restoran & Kafe' },
}

interface Category {
  id: string
  name: string
  slug: string
  _count: { businesses: number }
  children?: Category[]
}

export default function KategorilerPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [bizTotal, setBizTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch(`${API}/api/categories`)
      .then(r => r.json())
      .then(d => { setCategories(d.data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
    fetch(`${API}/api/businesses/count`).then(r=>r.json()).then(d=>setBizTotal(d.total??0)).catch(()=>{})
  }, [])

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.children?.some(ch => ch.name.toLowerCase().includes(search.toLowerCase()))
  )

  const totalSubCategories = categories.reduce((s, c) => s + (c.children?.length ?? 0), 0)

  return (
    <AppLayout>
      <div className="px-4 pt-4 pb-10 max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <Grid3X3 size={16} className="text-indigo-400" />
            <h1 className="text-base font-bold text-white tracking-tight">Kategoriler</h1>
          </div>
          <p className="text-xs text-white/30">
            {loading ? '...' : `${(bizTotal).toLocaleString('tr-TR')} işletme · ${categories.length} kategori · ${totalSubCategories} alt kategori`}
          </p>
        </div>

        {/* Arama */}
        <div className="relative mb-4">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            type="text"
            placeholder="Kategori ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl pl-8 pr-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/40 focus:bg-white/[0.06] transition-all"
          />
        </div>

        {/* İstatistikler — sadece arama yokken */}
        {!search && (
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { label: 'İşletme', value: bizTotal.toLocaleString('tr-TR'), color: '#818CF8' },
              { label: 'Kategori', value: categories.length, color: '#34D399' },
              { label: 'Alt Kategori', value: totalSubCategories, color: '#FBBF24' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-3 text-center" style={{ background: `${s.color}0A`, border: `1px solid ${s.color}20` }}>
                <div className="text-sm font-bold text-white">{s.value}</div>
                <div className="text-[10px] mt-0.5" style={{ color: `${s.color}99` }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Kategori listesi */}
        {loading ? (
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-[72px] rounded-2xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map((cat) => {
              const meta = CATEGORY_META[cat.slug]
              const Icon = meta?.icon ?? Building2
              const isExpanded = expanded === cat.id
              const hasChildren = (cat.children?.length ?? 0) > 0
              const color = meta?.color ?? '#818CF8'

              return (
                <div key={cat.id} className="rounded-2xl overflow-hidden"
                  style={{ border: `1px solid ${isExpanded ? color + '30' : 'rgba(255,255,255,0.06)'}`, transition: 'border-color 0.2s' }}>

                  {/* Ana kategori */}
                  <button
                    onClick={() => {
                      if (hasChildren) setExpanded(isExpanded ? null : cat.id)
                      else router.push(`/kesfet?category=${cat.slug}`)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.03]"
                    style={{ background: isExpanded ? `${color}06` : 'transparent' }}
                  >
                    {/* İkon */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: meta?.bg ?? 'rgba(129,140,248,0.08)' }}>
                      <Icon size={17} style={{ color }} />
                    </div>

                    {/* Bilgi */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white leading-tight">{cat.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-white/30">{meta?.description ?? ''}</span>
                        <span className="text-[11px]" style={{ color: color + 'CC' }}>
                          {(cat._count?.businesses ?? 0).toLocaleString('tr-TR')} işletme
                        </span>
                      </div>
                    </div>

                    {/* Chevron */}
                    <ChevronRight size={14} className="flex-shrink-0 transition-transform duration-200"
                      style={{ color: color + '80', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }} />
                  </button>

                  {/* Alt kategoriler */}
                  {isExpanded && hasChildren && (
                    <div style={{ borderTop: `1px solid ${color}15`, background: 'rgba(0,0,0,0.2)' }}>
                      <div className="p-2 grid grid-cols-2 gap-1">
                        {cat.children!.map(sub => (
                          <button
                            key={sub.id}
                            onClick={() => router.push(`/kesfet?category=${sub.slug}`)}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-white/[0.05] active:scale-95 group cursor-pointer"
                          >
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 group-hover:scale-125 transition-transform"
                              style={{ background: color }} />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs text-white/70 group-hover:text-white transition-colors truncate leading-tight font-medium">
                                {sub.name}
                              </div>
                              <div className="text-[10px] text-white/25 mt-0.5 group-hover:text-white/40 transition-colors">
                                {(sub._count?.businesses ?? 0).toLocaleString('tr-TR')} işletme
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="px-3 pb-3">
                        <button
                          onClick={() => router.push(`/kesfet?category=${cat.slug}`)}
                          className="w-full py-2 rounded-xl text-xs font-medium transition-all"
                          style={{
                            border: `1px solid ${color}25`,
                            color: color + 'BB',
                            background: `${color}08`,
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = `${color}15`)}
                          onMouseLeave={e => (e.currentTarget.style.background = `${color}08`)}
                        >
                          Tümünü Gör →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {filtered.length === 0 && search && (
              <div className="text-center py-12">
                <Search size={24} className="mx-auto mb-3 text-white/10" />
                <p className="text-sm text-white/25">"{search}" için sonuç bulunamadı</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
