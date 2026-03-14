'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import {
  Search, X, Sparkles, SlidersHorizontal, MapPin,
  TrendingUp, Clock, ArrowRight, Star, Filter, Building2, MessageSquare, Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { BusinessCard } from '@/components/business/BusinessCard'
import Link from 'next/link'

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '')

const TRENDING = [
  { q: 'Gönül alma', count: '2.4K' },
  { q: 'Şeffaf fiyat oto servis', count: '1.8K' },
  { q: 'Sakin çalışma kafe', count: '1.2K' },
  { q: 'Öğrenci dostu mekan', count: '987' },
]

const SORT_OPTIONS = [
  { label: 'En İlgili', value: 'relevance' },
  { label: 'TrustScore', value: 'trust' },
  { label: 'En Çok Yorum', value: 'reviews' },
  { label: 'En Yeni', value: 'newest' },
]

const CATEGORY_ICONS: Record<string, string> = {
  'Kafe': '☕',
  'Restoran': '🍽️',
  'Oto Servis': '🔧',
  'Eğitim': '📚',
  'Sağlık': '🏥',
  'Hukuk': '⚖️',
  'Market': '🛒',
  'Güzellik': '💅',
  'Spor': '🏋️',
  'Otel': '🏨',
}

type ResultTab = 'isletmeler' | 'yorumlar' | 'kullanicilar'

interface ApiCategory {
  id: string
  name: string
  slug: string
  icon?: string
  businessCount?: number
}

interface ApiBusiness {
  id: string
  name: string
  slug: string
  description?: string
  address: string
  city: string
  district?: string
  reason?: string
  vec_score?: number
  final_score?: number
  averageRating?: number
  reviewCount?: number
  externalReviewCount?: number
  category?: { id: string; name: string; slug: string; icon?: string }
  photos?: { url: string }[]
  trustScore?: number
  isVerified?: boolean
}

interface ApiExternalReview {
  id: string
  businessId: string
  businessName?: string
  businessSlug?: string
  authorName?: string
  content: string
  rating?: number
  publishedAt?: string
  source: string
}

interface ApiUser {
  id: string
  username: string
  fullName?: string
  avatarUrl?: string
  trustScore?: number
  trustLevel?: string
  badgeLevel?: string
  reviewCount?: number
}

function mapBusiness(b: ApiBusiness) {
  const rating = b.averageRating || 0
  const score = Math.round(rating * 20)
  const grade = (score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F') as 'A' | 'B' | 'C' | 'D' | 'F'
  return {
    id: b.id,
    slug: b.slug,
    name: b.name,
    category: b.category?.name || 'Genel',
    city: b.city || '',
    district: b.district || '',
    address: b.address || '',
    phone: '',
    trustScore: {
      grade, score,
      breakdown: { reviewDepth: score, recencyTrend: score, verifiedRatio: score, engagement: score },
      trend: 'stable' as const,
    },
    trustStack: { sms: false, transaction: false, photo: (b.photos?.length || 0) > 0 },
    priceRange: '₺₺',
    features: [],
    hours: '',
    isOpen: true,
    image: b.photos?.[0]?.url || '',
    reviewCount: (b.reviewCount || 0) + (b.externalReviewCount || 0),
    culturalTags: [],
    badges: b.isVerified ? ['Onaylı'] : [],
    aiSummary: {
      atmosphere: b.description || '',
      price: '',
      bestTime: '',
      highlights: [],
    },
  }
}

export default function AramaPage() {
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [category, setCategory] = useState('Tümü')
  const [sort, setSort] = useState('relevance')
  const [tab, setTab] = useState<ResultTab>('isletmeler')
  const [showFilters, setShowFilters] = useState(false)
  const [minTrust, setMinTrust] = useState(0)

  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [businesses, setBusinesses] = useState<ApiBusiness[]>([])
  const [reviews, setReviews] = useState<ApiExternalReview[]>([])
  const [users, setUsers] = useState<ApiUser[]>([])
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const [userLat, setUserLat] = useState<number|null>(null)
  const [userLng, setUserLng] = useState<number|null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => { setUserLat(pos.coords.latitude); setUserLng(pos.coords.longitude) },
        () => {}
      )
    }
  }, [])
  // Kategorileri çek
  useEffect(() => {
    fetch(`${API}/api/categories`)
      .then(r => r.json())
      .then(d => setCategories(Array.isArray(d) ? d : (d.categories || d.data || [])))
      .catch(() => {})
  }, [])

  // Local recent searches
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('recentSearches') || '[]')
      setRecentSearches(saved.slice(0, 5))
    } catch {}
    inputRef.current?.focus()
  }, [])

  const saveRecentSearch = (q: string) => {
    try {
      const saved = JSON.parse(localStorage.getItem('recentSearches') || '[]')
      const updated = [q, ...saved.filter((s: string) => s !== q)].slice(0, 5)
      localStorage.setItem('recentSearches', JSON.stringify(updated))
      setRecentSearches(updated)
    } catch {}
  }

  const doSearch = useCallback(async (q: string, cat: string, sortVal: string) => {
    if (!q.trim()) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ q, limit: '20' })
      if (userLat && userLng) { params.set('userLat', userLat.toString()); params.set('userLng', userLng.toString()) }
      if (cat !== 'Tümü') params.set('category', cat)
      if (sortVal !== 'relevance') params.set('sort', sortVal)

      // Paralel aramalar
      const [bizRes, revRes, usrRes] = await Promise.allSettled([
        fetch(`${API}/api/search?${params}&type=business`).then(r => r.json()),
        fetch(`${API}/api/search?${params}&type=review`).then(r => r.json()),
        fetch(`${API}/api/search?${params}&type=user`).then(r => r.json()),
      ])

      if (bizRes.status === 'fulfilled') {
        const d = bizRes.value
        setBusinesses(Array.isArray(d) ? d : (d.businesses || d.data || d.results || []))
      }
      if (revRes.status === 'fulfilled') {
        const d = revRes.value
        setReviews(Array.isArray(d) ? d : (d.reviews || d.data || d.results || []))
      }
      if (usrRes.status === 'fulfilled') {
        const d = usrRes.value
        setUsers(Array.isArray(d) ? d : (d.users || d.data || d.results || []))
      }
    } catch (e) {
      // fallback: sadece işletme ara
      try {
        const r = await fetch(`${API}/api/businesses?search=${encodeURIComponent(q)}&limit=20`)
        const d = await r.json()
        setBusinesses(Array.isArray(d) ? d : (d.data || []))
      } catch {}
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = (q: string) => {
    setQuery(q)
    setSubmitted(true)
    saveRecentSearch(q)
    doSearch(q, category, sort)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setSubmitted(true)
      saveRecentSearch(query)
      doSearch(query, category, sort)
    }
  }

  // Filtre değişince yeniden ara
  useEffect(() => {
    if (!submitted || !query.trim()) return
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(query, category, sort), 300)
  }, [category, sort, minTrust])

  const clearSearch = () => {
    setQuery('')
    setSubmitted(false)
    setBusinesses([])
    setReviews([])
    setUsers([])
    inputRef.current?.focus()
  }

  const filteredBusinesses = businesses.filter(b => {
    if (minTrust === 0) return true
    const score = Math.round((b.averageRating || 0) * 20)
    return score >= minTrust
  })

  const totalResults = filteredBusinesses.length + reviews.length + users.length

  const displayCategories = [
    { name: 'Tümü', icon: '🔍', slug: 'tumu' },
    ...categories.slice(0, 8).map(c => ({
      name: c.name,
      icon: CATEGORY_ICONS[c.name] || '🏢',
      slug: c.slug,
    }))
  ]

  return (
    <AppLayout>
      <div className="pb-6">
        {/* Search bar */}
        <div className="sticky top-0 z-20 bg-surface/95 backdrop-blur-xl border-b border-white/[0.06] px-4 pt-4 pb-3">
          <form onSubmit={handleSubmit}>
            <div className="relative flex items-center gap-2">
              <div className="flex-1 relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => {
                    setQuery(e.target.value)
                    if (!e.target.value.trim()) { setSubmitted(false); setBusinesses([]); setReviews([]); setUsers([]) }
                  }}
                  placeholder="İşletme, yer, deneyim ara..."
                  className="w-full bg-surface-2 border border-white/[0.08] rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all"
                />
                {query && (
                  <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>
              {submitted && (
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    'w-10 h-10 rounded-xl border flex items-center justify-center transition-all flex-shrink-0',
                    showFilters
                      ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                      : 'bg-surface-2 border-white/[0.08] text-white/40 hover:text-white/70'
                  )}
                >
                  <SlidersHorizontal size={15} />
                </button>
              )}
            </div>
          </form>

          {submitted && (
            <div className="flex items-center gap-2 mt-2.5">
              <div className="flex items-center gap-1.5 text-[11px] text-indigo-400/80 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2.5 py-1">
                <Sparkles size={10} />
                <span>Semantik arama aktif</span>
              </div>
              {!loading && (
                <span className="text-xs text-white/30">{totalResults} sonuç</span>
              )}
              {loading && (
                <span className="text-xs text-white/30 animate-pulse">Aranıyor...</span>
              )}
            </div>
          )}
        </div>

        {/* EMPTY STATE */}
        {!submitted && (
          <div className="px-4 pt-5">
            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={13} className="text-white/30" />
                  <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Son Aramalar</span>
                </div>
                <div className="space-y-1">
                  {recentSearches.map(q => (
                    <button
                      key={q}
                      onClick={() => handleSearch(q)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Clock size={13} className="text-white/20 flex-shrink-0" />
                        <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">{q}</span>
                      </div>
                      <ArrowRight size={13} className="text-white/20 group-hover:text-white/50 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={13} className="text-indigo-400" />
                <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Trend Aramalar</span>
              </div>
              <div className="space-y-1">
                {TRENDING.map((item, i) => (
                  <button
                    key={item.q}
                    onClick={() => handleSearch(item.q)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        'text-xs font-black w-5 text-center',
                        i === 0 ? 'text-amber-400' : i === 1 ? 'text-white/50' : 'text-white/30'
                      )}>
                        {i + 1}
                      </span>
                      <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">{item.q}</span>
                    </div>
                    <span className="text-xs text-white/30">{item.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category shortcuts - API'den */}
            <div>
              <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Kategoriler</div>
              <div className="grid grid-cols-3 gap-2">
                {displayCategories.filter(c => c.name !== 'Tümü').slice(0, 6).map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => { setQuery(cat.name); setSubmitted(true); setCategory(cat.name); doSearch(cat.name, cat.name, sort) }}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent hover:border-white/[0.12] hover:from-indigo-500/10 transition-all"
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-xs font-semibold text-white/70">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RESULTS */}
        {submitted && (
          <div>
            {/* Filters */}
            {showFilters && (
              <div className="px-4 py-3 border-b border-white/[0.06] bg-surface-2/50 space-y-3">
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                  {displayCategories.map(cat => (
                    <button
                      key={cat.name}
                      onClick={() => setCategory(cat.name)}
                      className={cn(
                        'flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all',
                        category === cat.name
                          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                          : 'text-white/40 border border-white/[0.08] hover:text-white/70'
                      )}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>

                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                  {SORT_OPTIONS.map(s => (
                    <button
                      key={s.value}
                      onClick={() => setSort(s.value)}
                      className={cn(
                        'flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all',
                        sort === s.value
                          ? 'bg-white/10 text-white border border-white/20'
                          : 'text-white/40 border border-white/[0.08] hover:text-white/70'
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/40 flex-shrink-0">Min TrustScore:</span>
                  <input
                    type="range" min="0" max="100" step="10" value={minTrust}
                    onChange={e => setMinTrust(Number(e.target.value))}
                    className="flex-1 accent-indigo-500"
                  />
                  <span className="text-xs font-bold text-indigo-400 w-6">{minTrust}</span>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-white/[0.06]">
              {([
                { key: 'isletmeler', label: 'İşletmeler', count: filteredBusinesses.length, icon: Building2 },
                { key: 'yorumlar', label: 'Yorumlar', count: reviews.length, icon: MessageSquare },
                { key: 'kullanicilar', label: 'Kişiler', count: users.length, icon: Users },
              ] as { key: ResultTab; label: string; count: number; icon: any }[]).map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    'flex-1 text-xs font-semibold py-3 px-2 transition-all border-b-2 flex items-center justify-center gap-1.5',
                    tab === t.key
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-white/40 hover:text-white/70'
                  )}
                >
                  <t.icon size={12} />
                  {t.label}
                  <span className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                    tab === t.key ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/[0.06] text-white/30'
                  )}>
                    {t.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Results content */}
            <div className="px-4 pt-4">
              {loading ? (
                <SearchSkeleton />
              ) : (
                <>
                  {/* Businesses */}
                  {tab === 'isletmeler' && (
                    filteredBusinesses.length === 0
                      ? <EmptyResults query={query} onSuggest={handleSearch} />
                      : filteredBusinesses.map(b => (
                        <div key={b.id} className="relative">
                          <BusinessCard business={mapBusiness(b)} />
                          {b.reason && (
                            <div className="mx-3 -mt-2 mb-3 px-3 py-1.5 rounded-b-xl bg-indigo-500/[0.07] border border-indigo-500/10 border-t-0">
                              <span className="text-[11px] text-indigo-400/70">✦ {b.reason}</span>
                            </div>
                          )}
                        </div>
                      ))
                  )}

                  {/* Reviews */}
                  {tab === 'yorumlar' && (
                    reviews.length === 0
                      ? <EmptyResults query={query} onSuggest={handleSearch} />
                      : (
                        <div className="space-y-3">
                          {reviews.map(r => (
                            <Link href={`/isletme/${r.businessSlug || r.businessId}`} key={r.id}>
                              <div className="p-4 rounded-2xl bg-surface-1 border border-white/[0.06] hover:border-white/[0.12] transition-all">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-300 flex-shrink-0">
                                    {(r.authorName || 'A').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <span className="text-xs font-semibold text-white/80">{r.authorName || 'Anonim'}</span>
                                    {r.rating && (
                                      <span className="ml-2 text-[10px] text-amber-400">{'★'.repeat(r.rating)}</span>
                                    )}
                                  </div>
                                  <span className="ml-auto text-[10px] text-white/30">{r.source}</span>
                                </div>
                                <p className="text-sm text-white/70 line-clamp-3">{r.content}</p>
                                {r.businessName && (
                                  <div className="mt-2 text-xs text-indigo-400/70 flex items-center gap-1">
                                    <Building2 size={10} />
                                    {r.businessName}
                                  </div>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      )
                  )}

                  {/* Users */}
                  {tab === 'kullanicilar' && (
                    users.length === 0
                      ? <EmptyResults query={query} onSuggest={handleSearch} />
                      : (
                        <div className="space-y-2">
                          {users.map(u => (
                            <Link href={`/kullanici/${u.username}`} key={u.id}>
                              <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-1 border border-white/[0.06] hover:border-white/[0.12] transition-all">
                                {u.avatarUrl ? (
                                  <img src={u.avatarUrl} alt={u.fullName || u.username} className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/20 flex-shrink-0" />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-300 flex-shrink-0">
                                    {(u.fullName || u.username || 'U').slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-sm text-white">{u.fullName || u.username}</span>
                                    {u.badgeLevel && (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                        {u.badgeLevel}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-white/40 mt-0.5">@{u.username} · Güven: {u.trustScore || 0}</div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="font-bold text-sm text-emerald-400">{(u.reviewCount || 0).toLocaleString('tr-TR')}</div>
                                  <div className="text-[10px] text-white/30">yorum</div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

function SearchSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-24 rounded-2xl bg-white/[0.04] animate-pulse" />
      ))}
    </div>
  )
}

function EmptyResults({ query, onSuggest }: { query: string; onSuggest: (q: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl mb-4">🔍</div>
      <div className="text-sm font-semibold text-white/50 mb-1">
        "{query}" için sonuç bulunamadı
      </div>
      <div className="text-xs text-white/30 mb-4">
        Farklı kelimeler deneyin veya filtreleri temizleyin
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {['Kafe', 'Oto Servis', 'Eğitim'].map(s => (
          <button
            key={s}
            onClick={() => onSuggest(s)}
            className="text-xs px-3 py-1.5 rounded-full border border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/20 transition-all"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
