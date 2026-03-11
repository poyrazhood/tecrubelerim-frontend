'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { TrustScoreRing } from '@/components/ui/TrustScoreRing'
import {
  MapPin, Phone, Globe, ChevronLeft, Star, ThumbsUp, Share2,
  Flag, ExternalLink, Bookmark, BookmarkCheck, Navigation,
  Clock, ChevronRight, X, ZoomIn, Camera, Info,
  MessageSquare, CheckCircle, AlertCircle, ChevronDown, Building2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '')
const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

function normalizeRating(raw: number): number {
  if (!raw || raw <= 0) return 0
  if (raw <= 5) return raw
  if (raw <= 50) return raw / 10
  if (raw <= 500) return raw / 100
  if (raw <= 5000) return raw / 1000
  if (raw <= 50000) return raw / 10000
  return raw / 1000000
}
function mapTrustScore(raw: number) {
  const normalized = normalizeRating(raw)
  const score = Math.round(normalized * 20)
  const clamped = Math.max(0, Math.min(100, score))
  const grade = clamped >= 90 ? 'A' : clamped >= 75 ? 'B' : clamped >= 60 ? 'C' : clamped >= 40 ? 'D' : 'F'
  return { grade, score: clamped, breakdown: { reviewDepth: Math.round(clamped * 0.9), recencyTrend: Math.round(clamped * 1.05), verifiedRatio: Math.round(clamped * 0.95), engagement: Math.round(clamped * 0.85) }, trend: 'stable' as const }
}

function cleanFeature(f: string): string {
  // Bozuk unicode karakterleri temizle, sadece harf/rakam/bosluk/tire birak
  return f.replace(/[^\p{L}\p{N}\s\-\/&(),.]/gu, '').trim()
}

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'simdi'
  if (mins < 60) return `${mins}dk`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}s`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}g`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} ay`
  return `${Math.floor(months / 12)} yil`
}

function Avatar({ name, image, size = 40 }: { name: string; image?: string; size?: number }) {
  const colors = ['#818CF8', '#34D399', '#FBBF24', '#F472B6', '#60A5FA', '#A78BFA']
  const color = colors[(name?.charCodeAt(0) ?? 65) % colors.length]
  const initials = (name ?? 'A').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  if (image) return <img src={image} alt={name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
  return <div className="rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white" style={{ width: size, height: size, background: color, fontSize: size * 0.35 }}>{initials}</div>
}

function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} className={i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-white/15'} />
      ))}
    </div>
  )
}

function PhotoGallery({ photos, initialIndex, onClose }: { photos: string[]; initialIndex: number; onClose: () => void }) {
  const [current, setCurrent] = useState(initialIndex)
  const touchStartX = useRef(0)
  const prev = () => setCurrent(c => (c - 1 + photos.length) % photos.length)
  const next = () => setCurrent(c => (c + 1) % photos.length)
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
  }
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') next(); if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
        <span className="text-sm text-white/60 font-medium">{current + 1} / {photos.length}</span>
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center text-white/70 hover:text-white transition-colors"><X size={16} /></button>
      </div>
      <div className="flex-1 flex items-center justify-center relative px-12">
        <button onClick={prev} className="absolute left-2 w-10 h-10 rounded-full bg-white/[0.08] flex items-center justify-center text-white/70 hover:text-white hover:bg-white/[0.15] transition-all"><ChevronLeft size={20} /></button>
        <img src={photos[current]} alt="" className="max-h-full max-w-full object-contain rounded-xl" style={{ maxHeight: 'calc(100vh - 180px)' }} />
        <button onClick={next} className="absolute right-2 w-10 h-10 rounded-full bg-white/[0.08] flex items-center justify-center text-white/70 hover:text-white hover:bg-white/[0.15] transition-all"><ChevronRight size={20} /></button>
      </div>
      <div className="h-20 px-4 py-2 flex items-center gap-2 overflow-x-auto">
        {photos.map((photo, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={cn('flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all', i === current ? 'border-indigo-400 opacity-100' : 'border-transparent opacity-40 hover:opacity-70')}>
            <img src={photo} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}

function RatingDistribution({ reviews }: { reviews: any[] }) {
  if (reviews.length === 0) return null
  const counts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => Math.round(r.rating) === star).length,
    pct: Math.round((reviews.filter(r => Math.round(r.rating) === star).length / reviews.length) * 100)
  }))
  return (
    <div className="space-y-1.5">
      {counts.map(({ star, count, pct }) => (
        <div key={star} className="flex items-center gap-2">
          <span className="text-xs text-white/40 w-3">{star}</span>
          <Star size={10} className="text-amber-400 fill-amber-400 flex-shrink-0" />
          <div className="flex-1 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
            <div className="h-full rounded-full bg-amber-400/70 transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-white/30 w-5 text-right">{count}</span>
        </div>
      ))}
    </div>
  )
}

function PlatformReviewCard({ review }: { review: any }) {
  const [liked, setLiked] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const user = review.user ?? {}
  const photos: any[] = review.photos ?? []
  if ((review.fraudDetectionMetadata?.fraud_score ?? 0) > 60) return null
  const content = review.content ?? ''
  const isLong = content.length > 220
  return (
    <article className="bg-surface-1 border border-white/[0.06] rounded-2xl p-4 mb-3">
      <div className="flex items-start gap-3 mb-3">
        <Avatar name={user.fullName ?? user.username ?? 'A'} image={user.avatarUrl} size={38} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-white">{user.fullName ?? user.username ?? 'Anonim'}</span>
            {user.trustLevel === 'MUHTAR' && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">Muhtar</span>}
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">Tecrubelerim</span>
            {review.isVerified && <CheckCircle size={11} className="text-emerald-400" />}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <Stars rating={review.rating} size={11} />
            <span className="text-xs text-white/30">{formatRelativeTime(review.createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <Star size={11} className="text-amber-400 fill-amber-400" /><span className="text-xs font-bold text-amber-400">{review.rating}</span>
        </div>
      </div>
      {review.title && <p className="text-sm font-semibold text-white mb-1.5">{review.title}</p>}
      <p className="text-sm text-white/75 leading-relaxed">{isLong && !expanded ? content.slice(0, 220) + '...' : content}</p>
      {isLong && <button onClick={() => setExpanded(!expanded)} className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 transition-colors">{expanded ? 'Daha az' : 'Devamini oku'}</button>}
      {photos.length > 0 && (
        <div className="grid gap-1.5 mt-3" style={{ gridTemplateColumns: `repeat(${Math.min(photos.length, 3)}, 1fr)` }}>
          {photos.map((p: any, i: number) => <img key={i} src={p.url} alt="" className="rounded-xl object-cover w-full h-20" />)}
        </div>
      )}
      <div className="flex items-center gap-1 pt-3 mt-1 border-t border-white/[0.05]">
        <button onClick={() => setLiked(!liked)} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all', liked ? 'bg-indigo-500/15 text-indigo-400' : 'text-white/40 hover:bg-white/5 hover:text-white/70')}>
          <ThumbsUp size={12} /><span>Faydali ({(review.helpfulCount ?? 0) + (liked ? 1 : 0)})</span>
        </button>
        <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-white/25 hover:text-white/50 hover:bg-white/[0.04] transition-all"><Flag size={11} />Sikayet</button>
      </div>
    </article>
  )
}

function ExternalReviewCard({ review }: { review: any }) {
  const [expanded, setExpanded] = useState(false)
  const content = review.content ?? ''
  const isLong = content.length > 220
  return (
    <article className="bg-surface-1 border border-white/[0.06] rounded-2xl p-4 mb-3">
      <div className="flex items-start gap-3 mb-3">
        <Avatar name={review.authorName ?? 'G'} image={review.authorPhoto} size={38} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-white">{review.authorName ?? 'Google Kullanicisi'}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/40 border border-white/[0.08]">Google</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {review.rating && <Stars rating={review.rating} size={11} />}
            {review.authorLevel && <span className="text-[10px] text-white/30">{review.authorLevel}</span>}
            <span className="text-xs text-white/30">{formatRelativeTime(review.publishedAt ?? review.scrapedAt)}</span>
          </div>
        </div>
        {review.rating && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Star size={11} className="text-amber-400 fill-amber-400" /><span className="text-xs font-bold text-amber-400">{review.rating}</span>
          </div>
        )}
      </div>
      {content && (
        <>
          <p className="text-sm text-white/75 leading-relaxed">{isLong && !expanded ? content.slice(0, 220) + '...' : content}</p>
          {isLong && <button onClick={() => setExpanded(!expanded)} className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 transition-colors">{expanded ? 'Daha az' : 'Devamini oku'}</button>}
        </>
      )}
      {review.ownerReply && (
        <div className="mt-3 p-3 rounded-xl bg-white/[0.03] border-l-2 border-indigo-500/40">
          <p className="text-[11px] font-bold text-indigo-400/70 mb-1">Isletme Sahibi Yaniti</p>
          <p className="text-xs text-white/55 leading-relaxed">{review.ownerReply}</p>
        </div>
      )}
      {review.sourceUrl && (
        <div className="mt-2 pt-2 border-t border-white/[0.04]">
          <a href={review.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] text-white/25 hover:text-white/50 transition-colors w-fit"><ExternalLink size={10} />Kaynagi gor</a>
        </div>
      )}
    </article>
  )
}

function ShareSheet({ name, onClose }: { name: string; onClose: () => void }) {
  const url = typeof window !== 'undefined' ? window.location.href : ''
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }) }
  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="w-full bg-surface-2 border-t border-white/[0.08] rounded-t-3xl p-5 pb-8" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-5" />
        <h3 className="text-base font-bold text-white mb-4">{name}</h3>
        <div className="flex gap-4 mb-5">
          {[
            { label: 'WhatsApp', color: '#25D366', icon: 'ğŸ’¬', href: `https://wa.me/?text=${encodeURIComponent(name + ' ' + url)}` },
            { label: 'Twitter', color: '#1DA1F2', icon: 'ğŸ¦', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(name)}&url=${encodeURIComponent(url)}` },
          ].map(({ label, color, icon, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: color + '20', border: `1px solid ${color}40` }}>{icon}</div>
              <span className="text-xs text-white/50">{label}</span>
            </a>
          ))}
          <button onClick={copy} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-indigo-500/20 border border-indigo-500/40">{copied ? 'âœ“' : 'ğŸ“‹'}</div>
            <span className="text-xs text-white/50">{copied ? 'Kopyalandi!' : 'Kopyala'}</span>
          </button>
        </div>
        <button onClick={onClose} className="w-full py-3 rounded-2xl bg-white/[0.05] text-white/50 text-sm font-medium">Kapat</button>
      </div>
    </div>
  )
}

export default function BusinessPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const [business, setBusiness] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeTab, setActiveTab] = useState<'yorumlar' | 'bilgiler' | 'fotograflar'>('yorumlar')
  const [activePhoto, setActivePhoto] = useState(0)
  const [reviewFilter, setReviewFilter] = useState<'tumu' | 'platform' | 'google'>('tumu')
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [shareOpen, setShareOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [headerScrolled, setHeaderScrolled] = useState(false)
  const [showAllFeatures, setShowAllFeatures] = useState(false)

  useEffect(() => { if (slug) fetchBusiness() }, [slug])

  useEffect(() => {
    const handler = () => setHeaderScrolled(window.scrollY > 200)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  async function fetchBusiness() {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/businesses/${slug}`)
      if (!res.ok) { setError(true); return }
      const data = await res.json()
      setBusiness(data.data ?? data)
    } catch { setError(true) }
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    const token = getToken()
    if (!token) { router.push('/giris'); return }
    setSaveLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/businesses/${business.id}/save`, {
        method: saved ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setSaved(!saved)
    } catch {}
    finally { setSaveLoading(false) }
  }

  const openGallery = (index: number) => { setGalleryIndex(index); setGalleryOpen(true) }

  if (loading) return (
    <AppLayout>
      <div className="animate-pulse">
        <div className="h-60 bg-white/5" />
        <div className="px-4 pt-4 space-y-3">
          <div className="h-7 w-48 rounded-xl bg-white/5" />
          <div className="h-4 w-32 rounded-lg bg-white/5" />
          <div className="flex gap-2 mt-4">{[1,2,3].map(i => <div key={i} className="h-10 flex-1 rounded-xl bg-white/5" />)}</div>
          {[1,2,3].map(i => <div key={i} className="h-32 rounded-2xl bg-white/5" />)}
        </div>
      </div>
    </AppLayout>
  )

  if (error || !business) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center py-24 text-white/40 px-4 text-center">
        <AlertCircle size={40} className="mb-4 opacity-50" />
        <p className="text-lg font-semibold mb-2 text-white/60">Isletme bulunamadi</p>
        <p className="text-sm mb-6">Bu sayfa mevcut degil veya kaldirilmis olabilir.</p>
        <button onClick={() => router.back()} className="px-5 py-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 text-sm font-medium">Geri Don</button>
      </div>
    </AppLayout>
  )

  const attrs = business.attributes ?? {}
  const photos: string[] = attrs.photos ?? []
  const coverPhoto: string = attrs.coverPhoto ?? photos[0] ?? `https://picsum.photos/seed/${slug}/800/400`
  const trustScore = mapTrustScore(business.averageRating ?? 0)
  const features: string[] = (Object.values(attrs.about ?? {}).flat() as string[]).map(cleanFeature).filter(Boolean)
  const platformReviews: any[] = business.reviews ?? []
  const externalReviews: any[] = business.externalReviews ?? []
  const visibleReviews = reviewFilter === 'platform' ? platformReviews : reviewFilter === 'google' ? externalReviews : [...platformReviews, ...externalReviews].sort((a, b) => new Date(b.createdAt ?? b.publishedAt ?? 0).getTime() - new Date(a.createdAt ?? a.publishedAt ?? 0).getTime())
  const totalReviewCount = platformReviews.length + externalReviews.length
  const avgRating = externalReviews.length > 0
    ? (externalReviews.reduce((s: number, r: any) => s + (r.rating ?? 0), 0) / externalReviews.length).toFixed(1)
    : business.averageRating > 0 ? normalizeRating(business.averageRating).toFixed(1) : null
  const allPhotos = photos.length > 0 ? photos : [coverPhoto]
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.name + ' ' + (business.address ?? ''))}`

  return (
    <AppLayout>
      {galleryOpen && <PhotoGallery photos={allPhotos} initialIndex={galleryIndex} onClose={() => setGalleryOpen(false)} />}
      {shareOpen && <ShareSheet name={business.name} onClose={() => setShareOpen(false)} />}

      <div className={cn('fixed top-0 left-0 right-0 z-40 transition-all duration-300 max-w-lg mx-auto', headerScrolled ? 'bg-surface/95 backdrop-blur-xl border-b border-white/[0.06] shadow-lg' : 'bg-transparent')}>
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className={cn('w-9 h-9 rounded-full flex items-center justify-center transition-all', headerScrolled ? 'bg-white/[0.06] text-white' : 'bg-black/40 backdrop-blur-sm text-white border border-white/10')}>
            <ChevronLeft size={18} />
          </button>
          {headerScrolled && (
            <div className="flex-1 px-3">
              <p className="text-sm font-bold text-white truncate">{business.name}</p>
              {avgRating && <div className="flex items-center gap-1"><Star size={10} className="text-amber-400 fill-amber-400" /><span className="text-xs text-white/50">{avgRating}</span></div>}
            </div>
          )}
          <div className="flex items-center gap-2">
            <button onClick={handleSave} disabled={saveLoading} className={cn('w-9 h-9 rounded-full flex items-center justify-center transition-all', headerScrolled ? 'bg-white/[0.06]' : 'bg-black/40 backdrop-blur-sm border border-white/10', saved ? 'text-indigo-400' : 'text-white/70 hover:text-white')}>
              {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
            </button>
            <button onClick={() => setShareOpen(true)} className={cn('w-9 h-9 rounded-full flex items-center justify-center transition-all text-white/70 hover:text-white', headerScrolled ? 'bg-white/[0.06]' : 'bg-black/40 backdrop-blur-sm border border-white/10')}>
              <Share2 size={15} />
            </button>
          </div>
        </div>
      </div>

      <div className="pb-8">
        <div className="relative h-60 overflow-hidden">
          <img src={allPhotos[activePhoto]} alt={business.name} className="w-full h-full object-cover transition-opacity duration-300" onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${slug}/800/400` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          {allPhotos.length > 1 && (
            <>
              <button onClick={() => openGallery(activePhoto)} className="absolute bottom-4 right-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/50 backdrop-blur-sm text-white/80 text-xs font-medium border border-white/10">
                <Camera size={12} />{allPhotos.length} fotograf
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                {allPhotos.slice(0, 7).map((_: string, i: number) => (
                  <button key={i} onClick={() => setActivePhoto(i)} className={cn('rounded-full transition-all', i === activePhoto ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40')} />
                ))}
              </div>
            </>
          )}
          <div className="absolute bottom-4 left-4">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/50 text-white border border-white/15 backdrop-blur-sm">{business.category?.name ?? ''}</span>
          </div>
        </div>

        <div className="px-4 pt-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl font-bold text-white leading-tight">{business.name}</h1>
                {business.badges?.map((badge: any) => {
                  const BADGE_META: Record<string, { label: string; color: string; icon: string }> = {
                    VERIFIED:              { label: 'Dogrulanmis',      color: 'emerald', icon: '✓' },
                    NEIGHBORHOOD_FAVORITE: { label: 'Mahalle Favorisi', color: 'amber',   icon: '⭐' },
                    FEATURED:              { label: 'One Cikan',        color: 'indigo',  icon: '🔥' },
                    PREMIUM:               { label: 'Premium',          color: 'purple',  icon: '💎' },
                    TOP_RATED:             { label: 'En Yuksek Puanli', color: 'yellow',  icon: '🏅' },
                    HIGHLY_REVIEWED:       { label: 'Cok Yorumlanan',   color: 'blue',    icon: '💬' },
                    NEW_BUSINESS:          { label: 'Yeni Isletme',     color: 'cyan',    icon: '🆕' },
                    TRUSTED:               { label: 'Guvenilir',        color: 'teal',    icon: '🤝' },
                  }
                  const meta = BADGE_META[badge.type]
                  if (!meta) return null
                  return (
                    <div key={badge.type} className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-${meta.color}-500/15 border border-${meta.color}-500/25`}>
                      <span className="text-[10px]">{meta.icon}</span>
                      <span className={`text-[10px] text-${meta.color}-400 font-semibold`}>{meta.label}</span>
                    </div>
                  )
                })}
                {business.isVerified && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25">
                    <CheckCircle size={11} className="text-emerald-400" /><span className="text-[10px] text-emerald-400 font-semibold">Dogrulandi</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/50"><MapPin size={11} className="text-indigo-400" /><span>{[business.district, business.city].filter(Boolean).join(', ')}</span></div>
            </div>
            <TrustScoreRing score={trustScore} size="md" showBreakdown={false} />
          </div>

          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {avgRating && (
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5">
                <Star size={13} className="text-amber-400 fill-amber-400" /><span className="text-sm font-bold text-white">{avgRating}</span><span className="text-xs text-white/40">({totalReviewCount})</span>
              </div>
            )}
            <span className={cn('flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-xl border', business.isOpen !== false ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' : 'bg-red-500/15 text-red-300 border-red-500/25')}>
              <div className={cn('w-1.5 h-1.5 rounded-full', business.isOpen !== false ? 'bg-emerald-400' : 'bg-red-400')} />
              {business.isOpen !== false ? 'Acik' : 'Kapali'}
            </span>
            {attrs.priceRange && <span className="text-xs text-white/50 bg-white/[0.05] border border-white/[0.08] px-2.5 py-1.5 rounded-xl">{attrs.priceRange}</span>}
          </div>

          {features.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1.5">
                {(showAllFeatures ? features : features.slice(0, 6)).map((f: string, i: number) => (
                  <span key={i} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/[0.06] text-white/55 border border-white/[0.08]">{f}</span>
                ))}
              </div>
              {features.length > 6 && (
                <button onClick={() => setShowAllFeatures(!showAllFeatures)} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-2 transition-colors">
                  <ChevronDown size={13} className={cn('transition-transform', showAllFeatures && 'rotate-180')} />
                  {showAllFeatures ? 'Daha az' : `+${features.length - 6} daha`}
                </button>
              )}
            </div>
          )}
          {business.claimStatus !== 'CLAIMED' && (
            <a href="/sahip-paneli" className="flex items-center gap-2 w-full mb-4 px-4 py-3 rounded-2xl border border-dashed border-indigo-500/30 bg-indigo-500/[0.05] hover:bg-indigo-500/[0.10] hover:border-indigo-500/50 transition-all group">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <Building2 size={15} className="text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-indigo-400">Bu işletmenin sahibi misiniz?</div>
                <div className="text-[10px] text-white/30 mt-0.5">Sahiplik talep edin, bilgilerinizi güncelleyin</div>
              </div>
              <ChevronRight size={14} className="text-indigo-400/50 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
            </a>
          )}

          <div className="grid grid-cols-4 gap-2 mb-5">
            <Link href={`/yorum-yaz?businessId=${business.id}&businessName=${encodeURIComponent(business.name)}`}
              className="col-span-2 flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 transition-colors text-white font-bold text-sm">
              <Star size={14} className="fill-white" />Yorum Yaz
            </Link>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:bg-white/[0.09] transition-colors">
              <Navigation size={15} /><span className="text-[10px] font-medium">Yol Tarifi</span>
            </a>
            <button onClick={handleSave} disabled={saveLoading}
              className={cn('flex flex-col items-center justify-center gap-1 py-2.5 rounded-2xl border transition-all', saved ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400' : 'bg-white/[0.05] border-white/[0.08] text-white/60 hover:bg-white/[0.09]')}>
              {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
              <span className="text-[10px] font-medium">{saved ? 'Kaydedildi' : 'Kaydet'}</span>
            </button>
          </div>

          {(business.phoneNumber || business.website) && (
            <div className="flex gap-2 mb-5">
              {business.phoneNumber && (
                <a href={`tel:${business.phoneNumber}`} className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium hover:bg-emerald-500/15 transition-colors">
                  <Phone size={13} />{business.phoneNumber}
                </a>
              )}
              {business.website && (
                <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.05] text-white/60 border border-white/[0.08] text-xs font-medium hover:bg-white/[0.09] transition-colors">
                  <Globe size={13} />Website
                </a>
              )}
            </div>
          )}

          <div className="flex gap-1 bg-surface-2 p-1 rounded-xl border border-white/[0.06] mb-5">
            {([
              { key: 'yorumlar', label: `Yorumlar (${totalReviewCount})` },
              { key: 'bilgiler', label: 'Bilgiler' },
              ...(allPhotos.length > 1 ? [{ key: 'fotograflar', label: `Foto (${allPhotos.length})` }] : []),
            ] as const).map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key as any)}
                className={cn('flex-1 text-xs font-semibold py-2 rounded-lg transition-all', activeTab === key ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-white/40 hover:text-white/70')}>
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'yorumlar' && (
            <>
              {totalReviewCount > 0 && avgRating && (
                <div className="bg-surface-1 border border-white/[0.06] rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-4xl font-black text-white">{avgRating}</div>
                      <Stars rating={parseFloat(avgRating)} size={12} />
                      <div className="text-xs text-white/30 mt-1">{totalReviewCount} yorum</div>
                    </div>
                    <div className="flex-1"><RatingDistribution reviews={[...platformReviews, ...externalReviews]} /></div>
                  </div>
                </div>
              )}
              {externalReviews.length > 0 && platformReviews.length > 0 && (
                <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
                  {[
                    { key: 'tumu', label: `Tumu (${totalReviewCount})` },
                    { key: 'google', label: `Google (${externalReviews.length})` },
                    { key: 'platform', label: `Tecrubelerim (${platformReviews.length})` },
                  ].map(({ key, label }) => (
                    <button key={key} onClick={() => setReviewFilter(key as any)}
                      className={cn('flex-shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-all', reviewFilter === key ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-white/[0.04] text-white/40 border border-white/[0.06] hover:text-white/70')}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
              {visibleReviews.length > 0
                ? visibleReviews.map((r: any) => r.source ? <ExternalReviewCard key={r.id} review={r} /> : <PlatformReviewCard key={r.id} review={r} />)
                : <div className="text-center py-12 text-white/30"><MessageSquare size={32} className="mx-auto mb-3 opacity-20" /><p className="text-sm">Henuz yorum yok.</p><p className="mt-1 text-xs">Ilk yorumu sen yaz!</p></div>
              }
            </>
          )}

          {activeTab === 'bilgiler' && (
            <div className="space-y-3">
              <div className="bg-surface-1 border border-white/[0.06] rounded-2xl overflow-hidden">
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 hover:bg-white/[0.03] transition-colors group">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center flex-shrink-0"><MapPin size={15} className="text-indigo-400" /></div>
                    <div>
                      <p className="text-xs text-white/40 font-medium mb-0.5">Adres</p>
                      <p className="text-sm text-white">{business.address}</p>
                      {business.district && <p className="text-xs text-white/40 mt-0.5">{business.district}, {business.city}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"><Navigation size={12} />Yol</div>
                </a>
                {business.phoneNumber && (
                  <a href={`tel:${business.phoneNumber}`} className="flex items-center gap-3 px-4 py-3 border-t border-white/[0.05] hover:bg-white/[0.03] transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0"><Phone size={15} className="text-emerald-400" /></div>
                    <div><p className="text-xs text-white/40 font-medium mb-0.5">Telefon</p><p className="text-sm text-emerald-400">{business.phoneNumber}</p></div>
                  </a>
                )}
                {business.website && (
                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 border-t border-white/[0.05] hover:bg-white/[0.03] transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0"><Globe size={15} className="text-blue-400" /></div>
                    <div className="flex-1 min-w-0"><p className="text-xs text-white/40 font-medium mb-0.5">Website</p><p className="text-sm text-blue-400 truncate">{business.website.replace(/^https?:\/\//, '')}</p></div>
                    <ExternalLink size={12} className="text-white/20 flex-shrink-0" />
                  </a>
                )}
              </div>
              {business.description && (
                <div className="bg-surface-1 border border-white/[0.06] rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center"><Info size={13} className="text-purple-400" /></div>
                    <h3 className="text-sm font-bold text-white">Hakkinda</h3>
                  </div>
                  <p className="text-sm text-white/65 leading-relaxed">{business.description}</p>
                </div>
              )}
              {Object.keys(attrs.about ?? {}).map((key: string) => (
                <div key={key} className="bg-surface-1 border border-white/[0.06] rounded-2xl p-4">
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">{key}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {((attrs.about as any)[key] as string[]).map(cleanFeature).filter(Boolean).map((v: string, i: number) => (
                      <span key={i} className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.06] text-white/60 border border-white/[0.08]">{v}</span>
                    ))}
                  </div>
                </div>
              ))}
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 text-sm font-semibold hover:bg-indigo-500/20 transition-colors">
                <Navigation size={15} />Google Maps'te Ac
              </a>
            </div>
          )}

          {activeTab === 'fotograflar' && allPhotos.length > 0 && (
            <div>
              <button onClick={() => openGallery(0)} className="w-full mb-2 rounded-2xl overflow-hidden relative group">
                <img src={allPhotos[0]} alt="" className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ZoomIn size={28} className="text-white" />
                </div>
              </button>
              <div className="grid grid-cols-3 gap-2">
                {allPhotos.slice(1, 10).map((photo: string, i: number) => (
                  <button key={i} onClick={() => openGallery(i + 1)} className="aspect-square overflow-hidden rounded-xl relative group">
                    <img src={photo} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn size={16} className="text-white" />
                    </div>
                    {i === 7 && allPhotos.length > 9 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">+{allPhotos.length - 9}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
