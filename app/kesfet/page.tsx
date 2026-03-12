'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { BusinessCard } from '@/components/business/BusinessCard'
import { SkeletonBusinessCard } from '@/components/ui/SkeletonCard'
import { Filter, MapPin, Sparkles, X, Search, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Business, TrustScore, TrustStack } from '@/types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

const TRUST_GRADES = ['Tümü', 'A', 'B', 'C']
const SORT_OPTIONS = [
  { value: 'rating',       label: 'En Yüksek Puan' },
  { value: 'mostReviewed', label: 'En Çok Yorum' },
  { value: 'newest',       label: 'En Yeni' },
]

// ─── Mapper ───────────────────────────────────────────────────────────────────

function mapTrustScore(raw: number): TrustScore {
  const score   = raw > 100 ? Math.round((raw / 1000000) * 20) : raw > 5 ? raw : Math.round(raw * 20)
  const clamped = Math.max(0, Math.min(100, score))
  const grade   = clamped >= 90 ? 'A' : clamped >= 75 ? 'B' : clamped >= 60 ? 'C' : clamped >= 40 ? 'D' : 'F'
  return {
    grade, score: clamped,
    breakdown: { reviewDepth: Math.round(clamped * 0.9), recencyTrend: Math.round(clamped * 1.05), verifiedRatio: Math.round(clamped * 0.95), engagement: Math.round(clamped * 0.85) },
    trend: 'stable',
  }
}

function mapTrustStack(b: any): TrustStack {
  return {
    sms:         b.isVerified ?? false,
    transaction: (b.totalReviews ?? 0) > 20,
    photo:       !!(b.attributes?.photos?.length || b.attributes?.coverPhoto),
  }
}

function mapBusiness(b: any): Business {
  const coverImage = b.attributes?.coverPhoto ?? b.attributes?.photos?.[0] ?? `https://picsum.photos/seed/${b.slug}/800/400`
  return {
    id: b.id, slug: b.slug, name: b.name,
    category:     b.category?.name ?? 'Genel',
    city:         b.city ?? 'Türkiye',
    district:     b.district ?? '',
    address:      b.address ?? '',
    phone:        b.phoneNumber ?? '',
    website:      b.website,
    trustScore:   mapTrustScore(b.averageRating ?? 50),
    trustStack:   mapTrustStack(b),
    hasGonulAlma: false,
    priceRange:   b.attributes?.priceRange ?? '₺₺',
    features:     Object.values(b.attributes?.about ?? {}).flat() as string[],
    hours:        '09:00–22:00',
    isOpen:       true,
    image:        coverImage,
    reviewCount:  b.totalReviews ?? 0,
    culturalTags: (b.attributes?.about?.['Özellikler'] ?? []).slice(0, 3).map((t: string) => t.replace(/^[\uE000-\uF8FF\u{E0000}-\u{FFFFF}]/u, '').trim()),
    badges:       [],
    subscriptionPlan: b.subscriptionPlan ?? 'FREE',
    aiSummary:    { atmosphere: '', price: '', bestTime: '', highlights: [] },
    aiSummary:    { atmosphere: '', price: '', bestTime: '', highlights: [] },
  }
}

export default function KesfetPage() {
  const [query, setQuery]                   = useState('')
  const [inputValue, setInputValue]         = useState('')
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string; slug: string; icon: string | null } | null>(null)
  const [selectedCity, setSelectedCity]     = useState('')
  const [selectedGrade, setSelectedGrade]   = useState('Tümü')
  const [sort, setSort]                     = useState('rating')
  const [showFilters, setShowFilters]       = useState(false)

  const [categories, setCategories]         = useState<any[]>([])
  const [businesses, setBusinesses]         = useState<Business[]>([])
  const [loading, setLoading]               = useState(true)
  const [loadingMore, setLoadingMore]       = useState(false)
  const [page, setPage]                     = useState(1)
  const [total, setTotal]                   = useState(0)
  const [hasMore, setHasMore]               = useState(true)

  const searchTimer = useRef<NodeJS.Timeout>()

  // Kategorileri yükle
  useEffect(() => {
    fetch(`${API}/categories`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setCategories(d.data ?? d.categories ?? []) })
      .catch(() => {})
  }, [])

  // İşletmeleri yükle (filtre değişince sıfırdan)
  useEffect(() => {
    setPage(1)
    setBusinesses([])
    fetchBusinesses(1, true)
  }, [query, selectedCategory, selectedCity, selectedGrade, sort])

  async function fetchBusinesses(pageNum: number, reset = false) {
    if (pageNum === 1) setLoading(true)
    else setLoadingMore(true)

    const params = new URLSearchParams({
      page:  String(pageNum),
      limit: '20',
      sort,
      ...(query             && { search: query }),
      ...(selectedCategory  && { categorySlug: selectedCategory.slug }),
      ...(selectedCity      && { city: selectedCity }),
      ...(selectedGrade !== 'Tümü' && { minRating: selectedGrade === 'A' ? '80' : selectedGrade === 'B' ? '60' : '40' }),
    })

    try {
      const res = await fetch(`${API}/businesses?${params}`)
      if (!res.ok) return
      const d = await res.json()
      const list: Business[] = (d.data ?? []).map(mapBusiness)

      setBusinesses(prev => reset ? list : [...prev, ...list])
      setTotal(d.pagination?.total ?? 0)
      setHasMore(list.length === 20)
    } catch (err) {
      console.error('İşletmeler yüklenemedi:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  function loadMore() {
    const next = page + 1
    setPage(next)
    fetchBusinesses(next)
  }

  // Arama debounce
  function handleInputChange(val: string) {
    setInputValue(val)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => setQuery(val), 400)
  }

  function clearFilters() {
    setSelectedCategory(null)
    setSelectedCity('')
    setSelectedGrade('Tümü')
    setSort('rating')
    setQuery('')
    setInputValue('')
  }

  const activeFilters = [
    selectedCategory && selectedCategory.name,
    selectedCity     && selectedCity,
    selectedGrade !== 'Tümü' && `TrustScore ${selectedGrade}+`,
    sort !== 'rating' && SORT_OPTIONS.find(s => s.value === sort)?.label,
  ].filter(Boolean) as string[]

  // Şehirler (işletmelerden dinamik değil, sabit liste yeterli)
  const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Konya', 'Adana', 'Gaziantep']

  return (
    <AppLayout>
      <div className="px-4 pt-4 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-black text-white">Keşfet</h1>
            <div className="flex items-center gap-1.5 text-xs text-white/40 mt-0.5">
              <MapPin size={11} className="text-indigo-400" />
              <span>{total > 0 ? `${total.toLocaleString('tr-TR')} işletme` : 'Türkiye geneli'}</span>
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all',
              showFilters || activeFilters.length > 0
                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                : 'bg-white/[0.04] text-white/50 border-white/[0.08] hover:bg-white/[0.08]'
            )}
          >
            <SlidersHorizontal size={13} />
            Filtrele
            {activeFilters.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] font-black flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
          </button>
        </div>

        {/* Arama */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={inputValue}
            onChange={e => handleInputChange(e.target.value)}
            placeholder="İşletme, kategori veya şehir ara…"
            className="w-full bg-surface-2 border border-white/[0.08] rounded-2xl pl-9 pr-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-indigo-500/50 focus:bg-surface-1 transition-all"
          />
          {inputValue && (
            <button onClick={() => { setInputValue(''); setQuery('') }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Aktif filtre chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilters.map(f => (
              <span key={f} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                {f}
                <button onClick={() => {
                  if (f === selectedCategory?.name)    setSelectedCategory(null)
                  if (f === selectedCity)              setSelectedCity('')
                  if (f.startsWith('TrustScore'))     setSelectedGrade('Tümü')
                  if (f === SORT_OPTIONS.find(s => s.value === sort)?.label) setSort('rating')
                }}>
                  <X size={11} />
                </button>
              </span>
            ))}
            <button onClick={clearFilters} className="text-xs px-2.5 py-1 rounded-full text-white/30 hover:text-white/60 transition-colors">
              Temizle
            </button>
          </div>
        )}

        {/* Genişletilmiş filtre paneli */}
        {showFilters && (
          <div className="rounded-2xl border border-white/[0.08] bg-surface-2 p-4 mb-4 space-y-4">
            {/* Sıralama */}
            <div>
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">Sıralama</div>
              <div className="flex gap-1.5">
                {SORT_OPTIONS.map(s => (
                  <button key={s.value} onClick={() => setSort(s.value)}
                    className={cn('flex-1 text-xs py-2 px-2 rounded-xl font-medium border transition-all',
                      sort === s.value
                        ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                        : 'bg-white/[0.03] text-white/50 border-white/[0.06] hover:bg-white/[0.06]'
                    )}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Şehir */}
            <div>
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">Şehir</div>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setSelectedCity('')}
                  className={cn('text-xs px-3 py-1.5 rounded-xl font-medium border transition-all',
                    !selectedCity ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40' : 'bg-white/[0.03] text-white/50 border-white/[0.06] hover:bg-white/[0.06]'
                  )}>
                  Tümü
                </button>
                {CITIES.map(city => (
                  <button key={city} onClick={() => setSelectedCity(city)}
                    className={cn('text-xs px-3 py-1.5 rounded-xl font-medium border transition-all',
                      selectedCity === city ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40' : 'bg-white/[0.03] text-white/50 border-white/[0.06] hover:bg-white/[0.06]'
                    )}>
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* TrustScore */}
            <div>
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">Minimum TrustScore</div>
              <div className="flex gap-1.5">
                {TRUST_GRADES.map(g => (
                  <button key={g} onClick={() => setSelectedGrade(g)}
                    className={cn('flex-1 text-xs py-2 rounded-xl font-bold border transition-all',
                      selectedGrade === g
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-white/[0.03] text-white/50 border-white/[0.06] hover:bg-white/[0.06]'
                    )}>
                    {g === 'Tümü' ? 'Tümü' : `${g}+`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Kategori pills - API'den */}
        {!showFilters && categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 -mx-4 px-4 pb-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn('flex-shrink-0 text-xs px-3.5 py-2 rounded-xl font-semibold border transition-all',
                !selectedCategory ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40' : 'bg-white/[0.04] text-white/50 border-white/[0.07] hover:bg-white/[0.08]'
              )}>
              Tümü
            </button>
            {categories.map((c: any) => (
              <button key={c.id}
                onClick={() => setSelectedCategory(selectedCategory?.id === c.id ? null : c)}
                className={cn('flex-shrink-0 text-xs px-3.5 py-2 rounded-xl font-semibold border transition-all whitespace-nowrap',
                  selectedCategory?.id === c.id ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40' : 'bg-white/[0.04] text-white/50 border-white/[0.07] hover:bg-white/[0.08]'
                )}>
                {c.icon && <span className="mr-1">{c.icon}</span>}{c.name}
              </button>
            ))}
          </div>
        )}

        {/* AI arama banner */}
        {query && !loading && (
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
            <Sparkles size={15} className="text-indigo-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-indigo-400 mb-1">Arama Sonuçları</div>
              <p className="text-xs text-white/60 leading-relaxed">
                "<span className="text-white font-medium">{query}</span>" için{' '}
                <span className="text-white font-medium">{total.toLocaleString('tr-TR')}</span> işletme bulundu.
              </p>
            </div>
          </div>
        )}

        {/* Sonuç sayısı + sıralama */}
        {!loading && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-white/40">
              {total.toLocaleString('tr-TR')} işletme
            </span>
            <div className="flex items-center gap-2">
              {SORT_OPTIONS.map(s => (
                <button key={s.value} onClick={() => setSort(s.value)}
                  className={cn('text-xs transition-colors',
                    sort === s.value ? 'text-indigo-400 font-semibold' : 'text-white/30 hover:text-white/60'
                  )}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="space-y-0">
            {[1,2,3,4].map(i => <SkeletonBusinessCard key={i} />)}
          </div>
        )}

        {/* İşletme listesi */}
        {!loading && businesses.length > 0 && (
          <>
            {businesses.map(b => <BusinessCard key={b.id} business={b} showSemanticMatch={!!query} />)}

            {hasMore && (
              <button onClick={loadMore} disabled={loadingMore}
                className="w-full py-3.5 mt-2 rounded-2xl border border-white/[0.08] text-sm text-white/50 hover:bg-white/5 hover:text-white/70 transition-all font-medium disabled:opacity-40">
                {loadingMore ? 'Yükleniyor…' : 'Daha Fazla Göster'}
              </button>
            )}
          </>
        )}

        {/* Boş durum */}
        {!loading && businesses.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <div className="text-white/50 text-sm font-medium mb-1">Sonuç bulunamadı</div>
            <div className="text-white/30 text-xs mb-5">Farklı filtreler veya arama terimi deneyin</div>
            <button onClick={clearFilters}
              className="px-5 py-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-sm font-medium hover:bg-indigo-500/30 transition-colors">
              Filtreleri Temizle
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
