'use client'

import { useEffect, useRef, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { SearchBar } from '@/components/search/SearchBar'
import { BusinessCard } from '@/components/business/BusinessCard'
import { MuhtarLeaderboard } from '@/components/feed/MuhtarLeaderboard'
import { SkeletonReviewCard, SkeletonBusinessCard } from '@/components/ui/SkeletonCard'
import { MapPin, Sparkles, TrendingUp, Star, ThumbsUp, Share2, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { Business, MuhtarUser, TrustScore, TrustStack } from '@/types'

const TABS = ['Tümü', 'Yakınımda', 'Muhtarlar', 'Trend']
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// ─── Mapper'lar ────────────────────────────────────────────────────────────────

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
    phone:        b.phone ?? '',
    website:      b.website,
    trustScore:   mapTrustScore(b.averageRating ?? 50),
    trustStack:   mapTrustStack(b),
    hasGonulAlma: b.hasGonulAlma ?? false,
    priceRange:   b.attributes?.priceRange ?? '₺₺',
    features:     Object.values(b.attributes?.about ?? {}).flat() as string[],
    hours:        b.workingHours ?? '09:00–22:00',
    isOpen:       b.isOpen ?? true,
    image:        coverImage,
    reviewCount:  b.totalReviews ?? 0,
    culturalTags: (b.attributes?.about?.['Özellikler'] ?? []).slice(0, 3),
    badges:       b.badges ?? [],
    aiSummary:    { atmosphere: '', price: '', bestTime: '', highlights: [] },
  }
}

function mapMuhtar(u: any, rank: number): MuhtarUser {
  return {
    id: u.id, name: u.fullName ?? u.username, handle: `@${u.username}`,
    image: u.avatarUrl, neighborhood: u.neighborhood ?? '',
    expertise: u.expertise ?? [], reviewCount: u.totalReviews ?? 0,
    helpfulCount: u.helpfulVotes ?? 0, followers: u.followersCount ?? 0, rank,
  }
}

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return ''
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  if (mins < 1)  return 'şimdi'
  if (mins < 60) return `${mins}dk`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}s`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}g`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} ay`
  return `${Math.floor(months / 12)} yıl`
}

// ─── Google Yorum Kartı ────────────────────────────────────────────────────────

function ExternalReviewCard({ review }: { review: any }) {
  const [expanded, setExpanded] = useState(false)
  const content = review.content ?? ''
  const isLong  = content.length > 220
  const biz     = review.business ?? {}
  const colors  = ['#818CF8', '#34D399', '#FBBF24', '#F472B6', '#60A5FA']
  const color   = colors[(review.authorName?.charCodeAt(0) ?? 65) % colors.length]
  const initials = (review.authorName ?? 'G').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <article className="feed-card card-interactive rounded-2xl border border-white/[0.06] bg-surface-1 p-4 mb-3">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {review.authorPhoto ? (
          <img src={review.authorPhoto} alt={review.authorName ?? ''} className="w-11 h-11 rounded-full object-cover flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        ) : (
          <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-sm flex-shrink-0"
            style={{ background: color }}>
            {initials}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-white">{review.authorName ?? 'Google Kullanıcısı'}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/40 border border-white/[0.08]">
              🔍 Google
            </span>
            {review.authorLevel && (
              <span className="text-[10px] text-white/30 hidden sm:inline">{review.authorLevel}</span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <Link href={`/isletme/${biz.slug}`} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium truncate">
              {biz.name}
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {review.rating && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} style={{ fontSize: 12, color: i < Math.round(review.rating) ? '#FBBF24' : 'rgba(255,255,255,0.15)' }}>★</span>
              ))}
            </div>
          )}
          <span className="text-xs text-white/30">{formatRelativeTime(review.publishedAt ?? review.scrapedAt)}</span>
        </div>
      </div>

      {/* İçerik */}
      {content && (
        <div className="mb-3">
          <p className="text-sm text-white/80 leading-relaxed">
            {isLong && !expanded ? content.slice(0, 220) + '…' : content}
          </p>
          {isLong && (
            <button onClick={() => setExpanded(!expanded)} className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 transition-colors">
              {expanded ? 'Daha az göster' : 'Devamını oku'}
            </button>
          )}
        </div>
      )}

      {/* Sahip yanıtı */}
      {review.ownerReply && (
        <div className="mb-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <p className="text-[11px] font-bold text-white/40 mb-1">İşletme Yanıtı</p>
          <p className="text-xs text-white/55 leading-relaxed line-clamp-2">{review.ownerReply}</p>
        </div>
      )}

      {/* Aksiyon butonları */}
      <div className="flex items-center gap-1 pt-2 border-t border-white/[0.05]">
        <Link
          href={`/isletme/${biz.slug}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white/40 hover:bg-white/5 hover:text-white/70 transition-all"
        >
          <Star size={12} />
          <span>İşletmeye Git</span>
        </Link>

        {review.sourceUrl && (
          <a href={review.sourceUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-white/30 hover:bg-white/5 hover:text-white/50 transition-all">
            <ExternalLink size={12} />
          </a>
        )}

        <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-white/30 hover:bg-white/5 hover:text-white/50 transition-all">
          <Share2 size={12} />
        </button>
      </div>
    </article>
  )
}

// ─── Scroll reveal ─────────────────────────────────────────────────────────────

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('visible') },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

function RevealSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useScrollReveal()
  return (
    <div ref={ref} className="reveal" style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

// ─── Ana bileşen ───────────────────────────────────────────────────────────────

export default function HomePage() {
  const [activeTab, setActiveTab]     = useState(0)
  const [loading, setLoading]         = useState(true)
  const [mounted, setMounted]         = useState(false)
  const [externalReviews, setExternalReviews] = useState<any[]>([])
  const [businesses, setBusinesses]   = useState<Business[]>([])
  const [muhtarlar, setMuhtarlar]     = useState<MuhtarUser[]>([])
  const [page, setPage]               = useState(1)
  const [hasMore, setHasMore]         = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [totalCount, setTotalCount]   = useState(0)

  useEffect(() => {
    setMounted(true)
    fetchInitial()
  }, [])

  async function fetchInitial() {
    setLoading(true)
    try {
      const [feedRes, bizRes, muhtarRes] = await Promise.all([
        fetch(`${API}/reviews/feed?limit=15&page=1`),
        fetch(`${API}/businesses?limit=7&page=1&sort=rating`),
        fetch(`${API}/users/muhtarlar?limit=5`),
      ])

      if (feedRes.ok) {
        const d = await feedRes.json()
        setExternalReviews(d.externalReviews ?? [])
        setTotalCount(d.pagination?.total ?? 0)
        setHasMore((d.externalReviews ?? []).length === 15)
      }

      if (bizRes.ok) {
        const d = await bizRes.json()
        setBusinesses((d.data ?? []).map(mapBusiness))
      }

      if (muhtarRes.ok) {
        const d = await muhtarRes.json()
        setMuhtarlar((d.users ?? d.data ?? []).map(mapMuhtar))
      }
    } catch (err) {
      console.error('Feed yüklenemedi:', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadMore() {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const nextPage = page + 1
    try {
      const res = await fetch(`${API}/reviews/feed?limit=15&page=${nextPage}`)
      if (!res.ok) return
      const d = await res.json()
      const newItems = d.externalReviews ?? []
      setExternalReviews(prev => [...prev, ...newItems])
      setPage(nextPage)
      setHasMore(newItems.length === 15)
    } catch (err) {
      console.error('Daha fazla yüklenemedi:', err)
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <AppLayout>
      <div className="px-4 pt-4">
        {/* Location bar */}
        <div className={cn('flex items-center gap-2 mb-4 transition-all duration-500', mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2')}>
          <div className="flex items-center gap-1.5 text-sm text-white/60">
            <MapPin size={13} className="text-indigo-400" />
            <span className="font-medium">Türkiye</span>
          </div>
          <span className="text-white/20">·</span>
          <span className="text-xs text-white/40">
            {loading ? '…' : `${totalCount.toLocaleString('tr-TR')} yorum`}
          </span>
        </div>

        {/* Search */}
        <div className={cn('mb-5 transition-all duration-500 delay-75', mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3')}>
          <SearchBar />
        </div>

        {/* Tabs */}
        <div className={cn('flex gap-1 mb-5 bg-surface-2 p-1 rounded-xl border border-white/[0.06] transition-all duration-500 delay-100', mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3')}>
          {TABS.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)}
              className={cn('flex-1 text-xs font-semibold py-2 px-3 rounded-lg transition-all btn-press',
                i === activeTab ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-white/40 hover:text-white/70'
              )}>
              {tab === 'Muhtarlar' ? <Link href="/muhtarlar" className="block w-full">{tab}</Link> : tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="animate-fade-in">
            <div className="rounded-2xl border border-white/[0.06] bg-surface-1 p-4 mb-4 space-y-2">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03]">
                  <div className="skeleton-line w-9 h-9 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton-line h-3 w-24" />
                    <div className="skeleton-line h-2.5 w-16" />
                  </div>
                  <div className="skeleton-line h-4 w-12" />
                </div>
              ))}
            </div>
            <SkeletonBusinessCard />
            {[1,2,3].map(i => <SkeletonReviewCard key={i} />)}
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* Muhtar Leaderboard */}
            {muhtarlar.length > 0 && (
              <RevealSection>
                <MuhtarLeaderboard muhtarlar={muhtarlar} />
              </RevealSection>
            )}

            {/* Öne çıkan işletme */}
            {businesses.length > 0 && (
              <RevealSection delay={60}>
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={14} className="text-indigo-400 animate-float" />
                    <span className="text-sm font-bold text-white">Öne Çıkan</span>
                    <span className="text-xs text-white/40">En yüksek puanlı</span>
                  </div>
                  <BusinessCard business={businesses[0]} showSemanticMatch />
                </div>
              </RevealSection>
            )}

            {/* Feed ayırıcı */}
            <RevealSection delay={80}>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <div className="flex items-center gap-1.5 text-xs text-white/30">
                  <TrendingUp size={12} />
                  <span>Son Deneyimler</span>
                </div>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>
            </RevealSection>

            {/* Google Yorumları Feed */}
            {externalReviews.length > 0 ? (
              <div className="stagger-children">
                {externalReviews.map((review: any) => (
                  <ExternalReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-white/30 text-sm">
                <Star size={32} className="mx-auto mb-3 opacity-20" />
                <p>Henüz yorum yok.</p>
              </div>
            )}

            {/* Diğer işletmeler */}
            {businesses.length > 1 && (
              <RevealSection delay={0}>
                <div className="mt-6 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-bold text-white">Bölgedeki İşletmeler</span>
                  </div>
                  <div className="stagger-children">
                    {businesses.slice(1).map(b => (
                      <BusinessCard key={b.id} business={b} />
                    ))}
                  </div>
                </div>
              </RevealSection>
            )}

            {/* Daha fazla */}
            {hasMore && (
              <RevealSection>
                <button onClick={loadMore} disabled={loadingMore}
                  className="w-full py-3.5 rounded-2xl border border-white/[0.08] text-sm text-white/50 hover:bg-white/5 hover:text-white/70 transition-all font-medium mb-6 btn-press ripple disabled:opacity-40">
                  {loadingMore ? 'Yükleniyor…' : 'Daha Fazla Göster'}
                </button>
              </RevealSection>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
