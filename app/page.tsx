'use client'

import { useEffect, useRef, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { SearchBar } from '@/components/search/SearchBar'
import { ReviewCard } from '@/components/feed/ReviewCard'
import { BusinessCard } from '@/components/business/BusinessCard'
import { MuhtarLeaderboard } from '@/components/feed/MuhtarLeaderboard'
import { SkeletonReviewCard, SkeletonBusinessCard } from '@/components/ui/SkeletonCard'
import { MapPin, Sparkles, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { Review, Business, MuhtarUser, TrustScore, TrustStack } from '@/types'

const TABS = ['Tümü', 'Yakınımda', 'Muhtarlar', 'Trend']

// ─── Mapper'lar ────────────────────────────────────────────────────────────────

function mapTrustScore(raw: number): TrustScore {
  const score = raw > 100 ? Math.round((raw / 1000000) * 20) : raw > 5 ? raw : Math.round(raw * 20)
  const clamped = Math.max(0, Math.min(100, score))
  const grade = clamped >= 90 ? 'A' : clamped >= 75 ? 'B' : clamped >= 60 ? 'C' : clamped >= 40 ? 'D' : 'F'
  return {
    grade, score: clamped,
    breakdown: {
      reviewDepth:   Math.round(clamped * 0.9),
      recencyTrend:  Math.round(clamped * 1.05),
      verifiedRatio: Math.round(clamped * 0.95),
      engagement:    Math.round(clamped * 0.85),
    },
    trend: 'stable',
  }
}

function mapTrustStack(b: any): TrustStack {
  return {
    sms:         b.isVerified ?? false,
    transaction: (b.totalReviews ?? b.reviewCount ?? 0) > 20,
    photo:       !!(b.attributes?.photos?.length || b.attributes?.coverPhoto),
  }
}

function mapBusiness(b: any): Business {
  const coverImage =
    b.attributes?.coverPhoto ??
    b.attributes?.photos?.[0] ??
    b.coverImage ??
    `https://picsum.photos/seed/${b.slug ?? b.id}/800/400`

  return {
    id:           b.id,
    slug:         b.slug,
    name:         b.name,
    category:     b.category?.name ?? b.categorySlug ?? 'Genel',
    city:         b.city ?? 'Türkiye',
    district:     b.district ?? '',
    address:      b.address ?? '',
    phone:        b.phone ?? '',
    website:      b.website,
    trustScore:   mapTrustScore(b.averageRating ?? b.trustScore ?? 50),
    trustStack:   mapTrustStack(b),
    hasGonulAlma: b.hasGonulAlma ?? false,
    priceRange:   b.attributes?.priceRange ?? b.priceRange ?? '₺₺',
    features:     Object.values(b.attributes?.about ?? {}).flat().slice(0, 4) as string[],
    hours:        b.workingHours ?? '09:00–22:00',
    isOpen:       b.isOpen ?? true,
    image:        coverImage,
    reviewCount:  b.totalReviews ?? b.reviewCount ?? 0,
    semanticMatch: b.semanticMatch,
    culturalTags:  b.tags ?? (b.attributes?.about?.['Özellikler'] ?? []).slice(0, 3),
    badges:        b.badges ?? [],
    aiSummary:    b.aiSummary ?? { atmosphere: '', price: '', bestTime: '', highlights: [] },
  }
}

function mapReview(r: any): Review {
  const user = r.user ?? {}
  const isMuhtar = user.trustLevel === 'MUHTAR'
  const fraudMeta = r.fraudDetectionMetadata ?? {}
  const fraudScore = fraudMeta.fraud_score ?? 0

  return {
    id:           r.id,
    businessId:   r.businessId,
    businessName: r.business?.name ?? '',
    businessSlug: r.business?.slug ?? r.businessId,
    userName:     user.fullName ?? user.username ?? 'Anonim',
    userHandle:   `@${user.username ?? 'kullanici'}`,
    userImage:    user.avatarUrl ?? undefined,
    userIsMuhtar: isMuhtar,
    userMuhtarNeighborhood: isMuhtar ? (user.neighborhood ?? '') : undefined,
    userIsExpert:  !!user.badgeLevel && user.badgeLevel !== 'BEGINNER',
    userExpertise: user.badgeLevel ?? undefined,
    content:      r.content,
    rating:       r.rating,
    photos:       (r.photos ?? []).map((p: any) => p.url),
    helpfulCount: r.helpfulCount ?? 0,
    thankCount:   r.thankCount ?? 0,
    createdAt:    formatRelativeTime(r.createdAt),
    shieldStatus: fraudScore > 60 ? 'danger' : fraudScore > 30 ? 'warning' : 'safe',
    shieldReason: fraudScore > 30 ? (fraudMeta.risk_factors ?? []).join(', ') || undefined : undefined,
    sentiment: {
      type:  r.sentiment ?? 'positive',
      score: r.sentimentScore ?? 1,
      irony: r.hasIrony ?? false,
    },
    ironyExplanation: r.ironyExplanation ?? undefined,
    aiHighlights:     r.aiHighlights ?? [],
  }
}

function mapMuhtar(u: any, rank: number): MuhtarUser {
  return {
    id:           u.id,
    name:         u.fullName ?? u.username,
    handle:       `@${u.username}`,
    image:        u.avatarUrl,
    neighborhood: u.neighborhood ?? '',
    expertise:    u.expertise ?? [],
    reviewCount:  u.totalReviews ?? 0,
    helpfulCount: u.helpfulVotes ?? 0,
    followers:    u.followersCount ?? 0,
    rank,
  }
}

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'şimdi'
  if (mins < 60) return `${mins}dk`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}s`
  return `${Math.floor(hrs / 24)}g`
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
  const [reviews, setReviews]         = useState<Review[]>([])
  const [businesses, setBusinesses]   = useState<Business[]>([])
  const [muhtarlar, setMuhtarlar]     = useState<MuhtarUser[]>([])
  const [page, setPage]               = useState(1)
  const [hasMore, setHasMore]         = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

  useEffect(() => {
    setMounted(true)
    fetchInitial()
  }, [])

  async function fetchInitial() {
    setLoading(true)
    try {
      const [revRes, bizRes, muhtarRes] = await Promise.all([
        fetch(`${API}/reviews?limit=10&page=1`),
        fetch(`${API}/businesses?limit=7&page=1`),
        fetch(`${API}/users/muhtarlar?limit=5`),
      ])

      if (revRes.ok) {
        const d = await revRes.json()
        const list = d.reviews ?? d.data ?? []
        setReviews(list.map(mapReview))
        setHasMore(list.length === 10)
      }

      if (bizRes.ok) {
        const d = await bizRes.json()
        const list = d.data ?? d.businesses ?? []
        setBusinesses(list.map(mapBusiness))
      }

      if (muhtarRes.ok) {
        const d = await muhtarRes.json()
        const list = d.users ?? d.data ?? []
        setMuhtarlar(list.map(mapMuhtar))
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
      const res = await fetch(`${API}/reviews?limit=10&page=${nextPage}`)
      if (!res.ok) return
      const d = await res.json()
      const list = d.reviews ?? d.data ?? []
      setReviews(prev => [...prev, ...list.map(mapReview)])
      setPage(nextPage)
      setHasMore(list.length === 10)
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
        <div className={cn(
          'flex items-center gap-2 mb-4 transition-all duration-500',
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        )}>
          <div className="flex items-center gap-1.5 text-sm text-white/60">
            <MapPin size={13} className="text-indigo-400" />
            <span className="font-medium">Türkiye</span>
          </div>
          <span className="text-white/20">·</span>
          <span className="text-xs text-white/40">
            {loading ? '…' : `${reviews.length} deneyim yüklendi`}
          </span>
        </div>

        {/* Search */}
        <div className={cn(
          'mb-5 transition-all duration-500 delay-75',
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        )}>
          <SearchBar />
        </div>

        {/* Tabs */}
        <div className={cn(
          'flex gap-1 mb-5 bg-surface-2 p-1 rounded-xl border border-white/[0.06] transition-all duration-500 delay-100',
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        )}>
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={cn(
                'flex-1 text-xs font-semibold py-2 px-3 rounded-lg transition-all btn-press',
                i === activeTab
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-white/40 hover:text-white/70'
              )}
            >
              {tab === 'Muhtarlar' ? (
                <Link href="/muhtarlar" className="block w-full">{tab}</Link>
              ) : tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="animate-fade-in">
            <div className="rounded-2xl border border-white/[0.06] bg-surface-1 p-4 mb-4 space-y-2">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03]">
                  <div className="skeleton-line w-8 h-8 rounded-full" />
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
            {muhtarlar.length > 0 && (
              <RevealSection>
                <MuhtarLeaderboard muhtarlar={muhtarlar} />
              </RevealSection>
            )}

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

            {reviews.length > 0 ? (
              <div className="stagger-children">
                {reviews.map(review => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-white/30 text-sm">
                Henüz yorum yok. İlk yorumu sen yaz!
              </div>
            )}

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

            {hasMore && (
              <RevealSection>
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="w-full py-3.5 rounded-2xl border border-white/[0.08] text-sm text-white/50 hover:bg-white/5 hover:text-white/70 transition-all font-medium mb-6 btn-press ripple disabled:opacity-40"
                >
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
