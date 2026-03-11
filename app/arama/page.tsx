'use client'

import { useState, useEffect, useRef } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import {
  Search, X, Sparkles, SlidersHorizontal, MapPin,
  TrendingUp, Clock, ArrowRight, Star, Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_BUSINESSES, MOCK_REVIEWS, MOCK_MUHTARLAR } from '@/lib/mock-data'
import { BusinessCard } from '@/components/business/BusinessCard'
import { ReviewCard } from '@/components/feed/ReviewCard'
import Link from 'next/link'
import { TrustScoreRing } from '@/components/ui/TrustScoreRing'

const RECENT_SEARCHES = [
  'Kadıköy sakin kafe WiFi',
  'Oto servis şeffaf fiyat',
  'Matematik kursu Kadıköy',
  'Pazar sabahı kahvaltı',
]

const TRENDING = [
  { q: 'Gönül alma', count: '2.4K' },
  { q: 'Şeffaf fiyat oto servis', count: '1.8K' },
  { q: 'Sakin çalışma kafe', count: '1.2K' },
  { q: 'Öğrenci dostu mekan', count: '987' },
]

const CATEGORIES = ['Tümü', 'Kafe', 'Restoran', 'Oto Servis', 'Eğitim', 'Hukuk', 'Sağlık']
const SORT_OPTIONS = ['En İlgili', 'TrustScore', 'En Yeni', 'En Çok Yorum']

type ResultTab = 'isletmeler' | 'yorumlar' | 'kullanicilar'

export default function AramaPage() {
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [category, setCategory] = useState('Tümü')
  const [sort, setSort] = useState('En İlgili')
  const [tab, setTab] = useState<ResultTab>('isletmeler')
  const [showFilters, setShowFilters] = useState(false)
  const [minTrust, setMinTrust] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSearch = (q: string) => {
    setQuery(q)
    setSubmitted(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) setSubmitted(true)
  }

  const clearSearch = () => {
    setQuery('')
    setSubmitted(false)
    inputRef.current?.focus()
  }

  // Filter results
  const filteredBusinesses = MOCK_BUSINESSES.filter(b => {
    const matchesQ = !query || b.name.toLowerCase().includes(query.toLowerCase()) ||
      b.category.toLowerCase().includes(query.toLowerCase()) ||
      b.culturalTags.some(t => t.toLowerCase().includes(query.toLowerCase())) ||
      b.district.toLowerCase().includes(query.toLowerCase())
    const matchesCat = category === 'Tümü' || b.category === category
    const matchesTrust = b.trustScore.score >= minTrust
    return matchesQ && matchesCat && matchesTrust
  })

  const filteredReviews = MOCK_REVIEWS.filter(r =>
    !query || r.content.toLowerCase().includes(query.toLowerCase()) ||
    r.businessName.toLowerCase().includes(query.toLowerCase()) ||
    r.userName.toLowerCase().includes(query.toLowerCase())
  )

  const filteredUsers = MOCK_MUHTARLAR.filter(u =>
    !query || u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.neighborhood.toLowerCase().includes(query.toLowerCase()) ||
    u.expertise.some(e => e.toLowerCase().includes(query.toLowerCase()))
  )

  const totalResults = filteredBusinesses.length + filteredReviews.length + filteredUsers.length

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
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit(e as any)}
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

          {/* AI badge */}
          {submitted && (
            <div className="flex items-center gap-2 mt-2.5">
              <div className="flex items-center gap-1.5 text-[11px] text-indigo-400/80 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2.5 py-1">
                <Sparkles size={10} />
                <span>Semantik arama aktif — anlam bazlı eşleşme</span>
              </div>
              <span className="text-xs text-white/30">{totalResults} sonuç</span>
            </div>
          )}
        </div>

        {/* ── EMPTY STATE: show suggestions ── */}
        {!submitted && (
          <div className="px-4 pt-5">
            {/* Recent searches */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={13} className="text-white/30" />
                <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Son Aramalar</span>
              </div>
              <div className="space-y-1">
                {RECENT_SEARCHES.map(q => (
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

            {/* Category shortcuts */}
            <div>
              <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Kategoriler</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Kafe', emoji: '☕', color: 'from-amber-500/20 to-amber-600/10' },
                  { label: 'Restoran', emoji: '🍽️', color: 'from-red-500/20 to-red-600/10' },
                  { label: 'Oto Servis', emoji: '🔧', color: 'from-blue-500/20 to-blue-600/10' },
                  { label: 'Eğitim', emoji: '📚', color: 'from-purple-500/20 to-purple-600/10' },
                  { label: 'Sağlık', emoji: '🏥', color: 'from-emerald-500/20 to-emerald-600/10' },
                  { label: 'Hukuk', emoji: '⚖️', color: 'from-indigo-500/20 to-indigo-600/10' },
                ].map(cat => (
                  <button
                    key={cat.label}
                    onClick={() => { setQuery(cat.label); setSubmitted(true); setCategory(cat.label) }}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-xl border border-white/[0.06] bg-gradient-to-b hover:border-white/[0.12] transition-all',
                      cat.color
                    )}
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <span className="text-xs font-semibold text-white/70">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {submitted && (
          <div>
            {/* Filters panel */}
            {showFilters && (
              <div className="px-4 py-3 border-b border-white/[0.06] bg-surface-2/50 space-y-3">
                {/* Category filter */}
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={cn(
                        'flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all',
                        category === cat
                          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                          : 'text-white/40 border border-white/[0.08] hover:text-white/70'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Sort */}
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                  {SORT_OPTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => setSort(s)}
                      className={cn(
                        'flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all',
                        sort === s
                          ? 'bg-white/10 text-white border border-white/20'
                          : 'text-white/40 border border-white/[0.08] hover:text-white/70'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Min trust score */}
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

            {/* Result tabs */}
            <div className="flex border-b border-white/[0.06]">
              {([
                { key: 'isletmeler', label: 'İşletmeler', count: filteredBusinesses.length },
                { key: 'yorumlar',   label: 'Yorumlar',   count: filteredReviews.length },
                { key: 'kullanicilar', label: 'Kişiler',  count: filteredUsers.length },
              ] as { key: ResultTab; label: string; count: number }[]).map(t => (
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
              {/* Businesses */}
              {tab === 'isletmeler' && (
                <>
                  {filteredBusinesses.length === 0 ? (
                    <EmptyResults query={query} />
                  ) : (
                    filteredBusinesses.map(b => <BusinessCard key={b.id} business={b} />)
                  )}
                </>
              )}

              {/* Reviews */}
              {tab === 'yorumlar' && (
                <>
                  {filteredReviews.length === 0 ? (
                    <EmptyResults query={query} />
                  ) : (
                    filteredReviews.map(r => <ReviewCard key={r.id} review={r} />)
                  )}
                </>
              )}

              {/* Users */}
              {tab === 'kullanicilar' && (
                <>
                  {filteredUsers.length === 0 ? (
                    <EmptyResults query={query} />
                  ) : (
                    <div className="space-y-2">
                      {filteredUsers.map(u => (
                        <Link href={`/kullanici/${u.handle.replace('@', '')}`} key={u.id}>
                          <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-1 border border-white/[0.06] hover:border-white/[0.12] transition-all cursor-pointer">
                            {u.image ? (
                              <img src={u.image} alt={u.name} className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/20 flex-shrink-0" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-300 flex-shrink-0">
                                {u.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-white">{u.name}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                  {u.neighborhood} Muhtarı
                                </span>
                              </div>
                              <div className="text-xs text-white/40 mt-0.5">{u.handle} · {u.expertise.join(', ')}</div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="font-bold text-sm text-emerald-400">{u.helpfulCount.toLocaleString('tr-TR')}</div>
                              <div className="text-[10px] text-white/30">faydalı</div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
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

function EmptyResults({ query }: { query: string }) {
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
          <span key={s} className="text-xs px-3 py-1.5 rounded-full border border-white/[0.08] text-white/40">
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}
