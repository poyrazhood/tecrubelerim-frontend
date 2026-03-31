'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { SearchBar } from '@/components/search/SearchBar'
import { BusinessCard } from '@/components/business/BusinessCard'
import { MuhtarLeaderboard } from '@/components/feed/MuhtarLeaderboard'
import { SkeletonReviewCard } from '@/components/ui/SkeletonCard'
import { MapPin, Sparkles, TrendingUp, Star, ThumbsUp, Share2, Brain, Shield, ChevronRight, Loader2, BadgeCheck, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { Business, MuhtarUser, TrustScore, TrustStack } from '@/types'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// ─── Statik öne çıkan işletmeler ─────────────────────────────────────────────
const STATIC_BUSINESSES: Business[] = [
  {
    id: 's1',
    slug: 'kahve-dunyasi-moda',
    name: 'Kahve Dünyası Moda',
    category: 'Kafe',
    city: 'İstanbul',
    district: 'Kadıköy',
    address: 'Moda Cad. No:123',
    phone: '',
    trustScore: { grade: 'A', score: 94, breakdown: { reviewDepth: 92, recencyTrend: 88, verifiedRatio: 96, engagement: 90 }, trend: 'stable' },
    trustStack: { sms: true, transaction: true, photo: true },
    hasGonulAlma: true,
    priceRange: '₺₺',
    features: [],
    hours: '08:00-23:00',
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=280&fit=crop',
    reviewCount: 1247,
    culturalTags: ['Sakin Ortam', 'WiFi Var'],
    badges: ['verified'],
    aiSummary: { atmosphere: '', price: '', bestTime: '', highlights: [] },
  },
  {
    id: 's2',
    slug: 'bostanci-oto-servis-ahmet',
    name: 'Usta Ahmet Oto Servis',
    category: 'Oto Servis',
    city: 'İstanbul',
    district: 'Bostancı',
    address: 'İstasyon Cad. No:45',
    phone: '',
    trustScore: { grade: 'A', score: 96, breakdown: { reviewDepth: 94, recencyTrend: 92, verifiedRatio: 98, engagement: 88 }, trend: 'stable' },
    trustStack: { sms: true, transaction: true, photo: true },
    hasGonulAlma: true,
    priceRange: '₺₺₺',
    features: [],
    hours: '08:00-19:00',
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=280&fit=crop',
    reviewCount: 312,
    culturalTags: ['Şeffaf Fiyat', 'Güvenilir'],
    badges: ['verified'],
    aiSummary: { atmosphere: '', price: '', bestTime: '', highlights: [] },
  },
  {
    id: 's3',
    slug: 'kadikoy-matematik-kursu',
    name: 'Kadıköy Matematik Kursu',
    category: 'Eğitim',
    city: 'İstanbul',
    district: 'Kadıköy',
    address: 'Söğütlüçeşme Cad. No:12',
    phone: '',
    trustScore: { grade: 'B', score: 87, breakdown: { reviewDepth: 85, recencyTrend: 82, verifiedRatio: 90, engagement: 88 }, trend: 'up' },
    trustStack: { sms: true, transaction: true, photo: false },
    hasGonulAlma: false,
    priceRange: '₺₺₺',
    features: [],
    hours: '09:00-21:00',
    isOpen: true,
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=280&fit=crop',
    reviewCount: 156,
    culturalTags: ['Öğretmen İlgisi', 'Disiplinli'],
    badges: ['verified'],
    aiSummary: { atmosphere: '', price: '', bestTime: '', highlights: [] },
  },
]

// ─── Statik muhtarlar ─────────────────────────────────────────────────────────
const STATIC_MUHTARLAR: MuhtarUser[] = [
  { id: 'm1', name: 'Can Yıldız', handle: '@canyildiz', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop', neighborhood: 'Bostancı', expertise: ['Oto Servis'], reviewCount: 89, helpfulCount: 1567, followers: 445, rank: 1 },
  { id: 'm2', name: 'Ayşe Yılmaz', handle: '@ayseyilmaz', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop', neighborhood: 'Moda', expertise: ['Kafe', 'Restoran'], reviewCount: 156, helpfulCount: 2341, followers: 892, rank: 2 },
  { id: 'm3', name: 'Fatma Hanım', handle: '@fatmaogretmen', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop', neighborhood: 'Kadıköy', expertise: ['Eğitim'], reviewCount: 134, helpfulCount: 1234, followers: 678, rank: 3 },
]

// ─── Mapper'lar ───────────────────────────────────────────────────────────────
function mapTrustScore(raw: number): TrustScore {
  const score = raw > 100 ? Math.round((raw / 1000000) * 20) : raw > 5 ? raw : Math.round(raw * 20)
  const clamped = Math.max(0, Math.min(100, score))
  const grade = clamped >= 90 ? 'A' : clamped >= 75 ? 'B' : clamped >= 60 ? 'C' : clamped >= 40 ? 'D' : 'F'
  return { grade, score: clamped, breakdown: { reviewDepth: Math.round(clamped * 0.9), recencyTrend: Math.round(clamped * 1.05), verifiedRatio: Math.round(clamped * 0.95), engagement: Math.round(clamped * 0.85) }, trend: 'stable' }
}

function mapTrustStack(b: any): TrustStack {
  return { sms: b.isVerified ?? false, transaction: (b.totalReviews ?? 0) > 20, photo: !!(b.attributes?.photos?.length || b.attributes?.coverPhoto) }
}

function mapBusiness(b: any): Business {
  const coverImage = b.photos?.[0]?.url ?? b.attributes?.coverPhoto ?? `https://picsum.photos/seed/${b.slug}/800/400`
  return {
    id: b.id, slug: b.slug, name: b.name,
    category: b.category?.name ?? 'Genel',
    city: b.city ?? 'Türkiye', district: b.district ?? '',
    address: b.address ?? '', phone: b.phone ?? '', website: b.website,
    trustScore: mapTrustScore(b.averageRating ?? 50),
    trustStack: mapTrustStack(b),
    hasGonulAlma: b.hasGonulAlma ?? false,
    priceRange: b.attributes?.priceRange ?? '₺₺',
    features: Object.values(b.attributes?.about ?? {}).flat() as string[],
    hours: b.workingHours ?? '09:00-22:00', isOpen: b.isOpen ?? true,
    image: coverImage, reviewCount: b.totalReviews ?? 0,
    culturalTags: (b.attributes?.about?.['Özellikler'] ?? []).slice(0, 3).map((t: string) => t.replace(/^[\uE000-\uF8FF]/u, '').trim()),
    badges: b.badges ?? [],
    aiSummary: { atmosphere: '', price: '', bestTime: '', highlights: [] },
  }
}

function mapMuhtar(u: any, rank: number): MuhtarUser {
  return { id: u.id, name: u.fullName ?? u.username, handle: `@${u.username}`, image: u.avatarUrl, neighborhood: u.neighborhood ?? '', expertise: u.expertise ?? [], reviewCount: u.totalReviews ?? 0, helpfulCount: u.helpfulVotes ?? 0, followers: u.followersCount ?? 0, rank }
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

// ─── ReviewCard ───────────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: any }) {
  const [helpful, setHelpful] = useState(false)
  const stars = review.rating ?? review.overallRating ?? 0
  return (
    <div className="p-4 rounded-2xl border bg-[var(--bg-1)] border-[var(--border)] mb-3">
      <div className="flex items-start gap-3 mb-3">
        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden', 'bg-indigo-500/20 text-indigo-400')}>
          {review.user?.avatarUrl
            ? <img src={review.user.avatarUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            : (review.user?.username?.[0] ?? review.authorName?.[0] ?? '?').toUpperCase()
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-[var(--fg)] truncate">
              @{review.user?.username ?? review.authorName ?? 'anonim'}
            </span>
            <span className="text-xs text-[var(--fg-faint)] flex-shrink-0">
              {formatRelativeTime(review.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={11} className={i <= stars ? 'text-amber-400 fill-amber-400' : 'text-[var(--fg-faint)]'} />
            ))}
            {review.source === 'google' && (
              <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Google</span>
            )}
          </div>
        </div>
      </div>
      <p className="text-sm text-[var(--fg-muted)] leading-relaxed line-clamp-3 mb-3">
        {review.content ?? review.text ?? ''}
      </p>
      {(review.business?.name || review.businessName) && (
        <Link href={`/isletme/${review.business?.slug ?? review.businessSlug ?? '#'}`}
          className="flex items-center gap-1 text-xs text-indigo-400 font-medium mb-3">
          <MapPin size={10} />
          {review.business?.name ?? review.businessName}
        </Link>
      )}
      <div className="flex items-center gap-4 pt-2 border-t border-[var(--border)]">
        <button onClick={() => setHelpful(!helpful)}
          className={cn('flex items-center gap-1.5 text-xs transition-colors', helpful ? 'text-indigo-400' : 'text-[var(--fg-faint)] hover:text-[var(--fg-muted)]')}>
          <ThumbsUp size={13} />
          <span>{(review.helpfulCount ?? 0) + (helpful ? 1 : 0)} Faydalı</span>
        </button>
        <button className="flex items-center gap-1.5 text-xs text-[var(--fg-faint)] hover:text-[var(--fg-muted)] transition-colors">
          <Share2 size={13} />
          <span>Paylaş</span>
        </button>
      </div>
    </div>
  )
}

// ─── Ana bileşen ──────────────────────────────────────────────────────────────
export default function HomePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [locationName] = useState('Türkiye')

  // İşletmeler — hemen statik göster, sonra API'den güncelle
  const [businesses, setBusinesses] = useState<Business[]>(STATIC_BUSINESSES)
  const [muhtarlar, setMuhtarlar] = useState<MuhtarUser[]>(STATIC_MUHTARLAR)

  // Yorumlar — lazy load
  const [externalReviews, setExternalReviews] = useState<any[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsLoaded, setReviewsLoaded] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  useEffect(() => {
    setMounted(true)
    // Arka planda işletmeleri ve muhtarları güncelle
    fetchBusinesses()
    fetchMuhtarlar()
  }, [])

  async function fetchBusinesses() {
    let featuredSlugs: string[] = []
    try { featuredSlugs = JSON.parse(localStorage.getItem('featured_businesses') || '[]') } catch {}

    try {
      // Featured slug'ları ayrı ayrı fetch et
      if (featuredSlugs.length > 0) {
        const featuredResults = await Promise.all(
          featuredSlugs.map(slug =>
            fetch(`${API}/businesses/${slug}`)
              .then(r => r.ok ? r.json() : null)
              .catch(() => null)
          )
        )
        const featuredMapped = featuredResults
          .filter(Boolean)
          .map((d: any) => mapBusiness(d.data ?? d.business ?? d))
        if (featuredMapped.length > 0) {
          setBusinesses(featuredMapped)
          return
        }
      }
      // Featured yok veya bulunamadı — normal listing
      const res = await fetch(`${API}/businesses?limit=7&page=1&sort=rating`)
      if (res.ok) {
        const d = await res.json()
        const mapped = (d.data ?? []).map(mapBusiness)
        if (mapped.length > 0) setBusinesses(mapped)
      }
    } catch {}
  }

  async function fetchMuhtarlar() {
    try {
      const res = await fetch(`${API}/users/muhtarlar?limit=5`)
      if (res.ok) {
        const d = await res.json()
        const mapped = (d.users ?? d.data ?? []).map(mapMuhtar)
        if (mapped.length > 0) setMuhtarlar(mapped)
      }
    } catch {}
  }

  async function loadReviews(p: number) {
    if (loadingRef.current) return
    loadingRef.current = true
    p === 1 ? setReviewsLoading(true) : setLoadingMore(true)
    try {
      const res = await fetch(`${API}/reviews/feed?limit=15&page=${p}`)
      if (res.ok) {
        const d = await res.json()
        const items = d.externalReviews ?? d.reviews ?? d.data ?? []
        setExternalReviews(prev => p === 1 ? items : [...prev, ...items])
        setTotalCount(d.pagination?.total ?? d.total ?? 0)
        setHasMore(items.length === 15)
        setPage(p + 1)
        setReviewsLoaded(true)
      } else {
        const res2 = await fetch(`${API}/reviews?limit=15&page=${p}&sort=createdAt`)
        if (res2.ok) {
          const d = await res2.json()
          const items = d.reviews ?? d.data ?? []
          setExternalReviews(prev => p === 1 ? items : [...prev, ...items])
          setTotalCount(d.pagination?.total ?? d.total ?? 0)
          setHasMore(items.length === 15)
          setPage(p + 1)
          setReviewsLoaded(true)
        }
      }
    } catch {}
    finally {
      loadingRef.current = false
      setReviewsLoading(false)
      setLoadingMore(false)
    }
  }

  // Sentinel observer — scroll ile yükle
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (!reviewsLoaded) {
            loadReviews(1)
          } else if (hasMore && !loadingMore) {
            loadReviews(page)
          }
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reviewsLoaded, hasMore, loadingMore, page])

  const TABS = ['Tümü', '✨ Senin İçin', 'Muhtarlar', 'Kategoriler']

  return (
    <AppLayout>
      <div className="space-y-0">

        {/* ── Başlık + Konum ──────────────────────────────────────────── */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-1.5 text-xs text-[var(--fg-faint)] mb-3">
            <MapPin size={12} />
            <span>{locationName}</span>
            {totalCount > 0 && (
              <>
                <span className="mx-1">·</span>
                <span>{totalCount.toLocaleString('tr-TR')} yorum</span>
              </>
            )}
          </div>
          <div className="relative mb-3">
            <SearchBar />
          </div>
        </div>

        {/* ── Sekmeler ────────────────────────────────────────────────── */}
        <div className="px-4 mb-4">
          <div className="flex gap-1 p-1 rounded-xl bg-[var(--bg-2)] border border-[var(--border)]">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={cn(
                  'flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  activeTab === i
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ── Öne Çıkan İşletmeler ────────────────────────────────────── */}
        {activeTab === 0 && (
          <div className="px-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles size={15} className="text-amber-400" />
                <span className="text-[15px] font-bold text-[var(--fg)]">Premium İşletmeler</span>
              </div>
              <Link href="/kesfet" className="text-xs text-indigo-400 hover:underline flex items-center gap-0.5">
                Tümü <ChevronRight size={12} />
              </Link>
            </div>
            <div className="space-y-2">
              {businesses.slice(0, 5).map(biz => (
                <BusinessCard key={biz.id} business={biz} />
              ))}
            </div>
          </div>
        )}

        {/* ── Senin İçin sekmesi ──────────────────────────────────────── */}
        {activeTab === 1 && (
          <div className="px-4 mb-4">
            {!user ? (
              <div className="text-center py-12">
                <Brain size={32} className="text-[var(--fg-faint)] mx-auto mb-3" />
                <p className="text-sm text-[var(--fg-muted)] mb-4">Kişisel öneriler için giriş yapın</p>
                <Link href="/giris" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold">
                  Giriş Yap
                </Link>
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-[var(--fg-muted)]">
                <Sparkles size={24} className="mx-auto mb-2 text-indigo-400" />
                Kişisel öneriler hazırlanıyor...
              </div>
            )}
          </div>
        )}

        {/* ── Muhtarlar sekmesi ───────────────────────────────────────── */}
        {activeTab === 2 && (
          <div className="px-4 mb-4">
            <MuhtarLeaderboard muhtarlar={muhtarlar} />
          </div>
        )}

        {/* ── Kategoriler sekmesi ─────────────────────────────────────── */}
        {activeTab === 3 && (
          <div className="px-4 mb-4 grid grid-cols-2 gap-2">
            {[
              { slug: 'restoran', label: 'Restoran', icon: '🍽️', count: '48K+' },
              { slug: 'kafe', label: 'Kafe', icon: '☕', count: '21K+' },
              { slug: 'oto-servis', label: 'Oto Servis', icon: '🔧', count: '12K+' },
              { slug: 'egitim', label: 'Eğitim', icon: '📚', count: '9K+' },
              { slug: 'saglik', label: 'Sağlık', icon: '🏥', count: '15K+' },
              { slug: 'hukuk', label: 'Hukuk', icon: '⚖️', count: '4K+' },
              { slug: 'guzellik', label: 'Güzellik', icon: '💅', count: '18K+' },
              { slug: 'alisveris', label: 'Alışveriş', icon: '🛍️', count: '31K+' },
            ].map(cat => (
              <Link key={cat.slug} href={`/kategori/${cat.slug}`}>
                <div className="flex items-center gap-3 p-3 rounded-2xl border bg-[var(--bg-1)] border-[var(--border)] hover:border-indigo-500/30 transition-all">
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-[var(--fg)]">{cat.label}</div>
                    <div className="text-xs text-[var(--fg-faint)]">{cat.count} işletme</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── Son Yorumlar (lazy) ─────────────────────────────────────── */}
        {activeTab === 0 && (
          <div className="px-4 mb-4">
            <div className="flex items-center gap-1.5 mb-3">
              <TrendingUp size={15} className="text-indigo-400" />
              <span className="text-[15px] font-bold text-[var(--fg)]">Son Deneyimler</span>
            </div>

            {reviewsLoading && (
              <div className="space-y-3">
                {[1,2,3].map(i => <SkeletonReviewCard key={i} />)}
              </div>
            )}

            {externalReviews.map((review, i) => (
              <ReviewCard key={review.id ?? i} review={review} />
            ))}

            {loadingMore && (
              <div className="flex justify-center py-4">
                <Loader2 size={20} className="animate-spin text-[var(--fg-faint)]" />
              </div>
            )}

            {!hasMore && externalReviews.length > 0 && (
              <div className="text-center text-xs text-[var(--fg-faint)] py-4">
                Tüm yorumlar gösterildi
              </div>
            )}
          </div>
        )}

        {/* Sentinel */}
        <div ref={sentinelRef} className="h-4" />

        {/* Mobil footer linkler */}
        {!hasMore && externalReviews.length > 0 && (
          <div className="px-4 py-6 text-center border-t border-white/[0.06] mt-2">
            <p className="text-[11px] text-white/30 leading-relaxed">
              <a href="/sozlesme/privacy_policy" className="hover:text-white/60 transition-colors">Gizlilik</a>
              {` � `}
              <a href="/sozlesme/terms_of_service" className="hover:text-white/60 transition-colors">Kullanim Kosullari</a>
              {` � `}
              <a href="/sozlesme/help" className="hover:text-white/60 transition-colors">Yardim</a>
              {` � `}
              <a href="/iletisim" className="hover:text-white/60 transition-colors">Iletisim</a>
            </p>
            <p className="text-[11px] text-white/15 mt-1">� 2026 Tecrubelerim</p>
          </div>
        )}


      </div>
    </AppLayout>
  )
}


