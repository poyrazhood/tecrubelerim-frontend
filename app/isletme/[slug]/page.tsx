'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { TrustScoreRing } from '@/components/ui/TrustScoreRing'
import { MapPin, Phone, Globe, ChevronLeft, Star, ThumbsUp, Share2, Flag, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapTrustScore(raw: number) {
  const score = raw > 100
    ? Math.round((raw / 1000000) * 20)
    : raw > 5 ? raw : Math.round(raw * 20)
  const clamped = Math.max(0, Math.min(100, score))
  const grade = clamped >= 90 ? 'A' : clamped >= 75 ? 'B' : clamped >= 60 ? 'C' : clamped >= 40 ? 'D' : 'F'
  return {
    grade, score: clamped,
    breakdown: { reviewDepth: Math.round(clamped * 0.9), recencyTrend: Math.round(clamped * 1.05), verifiedRatio: Math.round(clamped * 0.95), engagement: Math.round(clamped * 0.85) },
    trend: 'stable' as const,
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
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}g`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} ay`
  return `${Math.floor(months / 12)} yıl`
}

function Avatar({ name, image, size = 40 }: { name: string; image?: string; size?: number }) {
  const colors = ['#818CF8', '#34D399', '#FBBF24', '#F472B6', '#60A5FA', '#A78BFA']
  const color = colors[(name?.charCodeAt(0) ?? 65) % colors.length]
  const initials = (name ?? 'A').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  if (image) return <img src={image} alt={name} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
  return (
    <div className="rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white"
      style={{ width: size, height: size, background: color, fontSize: size * 0.35 }}>
      {initials}
    </div>
  )
}

function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ fontSize: size, color: i < Math.round(rating) ? '#FBBF24' : 'rgba(255,255,255,0.15)' }}>★</span>
      ))}
    </div>
  )
}

// ─── Platform yorum kartı ──────────────────────────────────────────────────────

function PlatformReviewCard({ review }: { review: any }) {
  const [liked, setLiked] = useState(false)
  const user = review.user ?? {}
  const photos: any[] = review.photos ?? []
  const fraudScore = review.fraudDetectionMetadata?.fraud_score ?? 0
  if (fraudScore > 60) return null

  return (
    <article className="bg-surface-1 border border-white/[0.06] rounded-2xl p-4 mb-3">
      <div className="flex items-start gap-3 mb-3">
        <Avatar name={user.fullName ?? user.username ?? 'A'} image={user.avatarUrl} size={40} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-white">{user.fullName ?? user.username ?? 'Anonim'}</span>
            {user.trustLevel === 'MUHTAR' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">Muhtar</span>
            )}
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">Tecrübelerim</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <Stars rating={review.rating} />
            <span className="text-xs text-white/30">{formatRelativeTime(review.createdAt)}</span>
          </div>
        </div>
      </div>
      {review.title && <p className="text-sm font-semibold text-white mb-1">{review.title}</p>}
      <p className="text-sm text-white/75 leading-relaxed mb-3">{review.content}</p>
      {photos.length > 0 && (
        <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: `repeat(${Math.min(photos.length, 3)}, 1fr)` }}>
          {photos.map((p: any, i: number) => (
            <img key={i} src={p.url} alt="" className="rounded-xl object-cover w-full h-24" />
          ))}
        </div>
      )}
      <div className="flex items-center gap-1 pt-2 border-t border-white/[0.05]">
        <button onClick={() => setLiked(!liked)} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all', liked ? 'bg-indigo-500/15 text-indigo-400' : 'text-white/40 hover:bg-white/5 hover:text-white/70')}>
          <ThumbsUp size={13} />
          <span>{(review.helpfulCount ?? 0) + (liked ? 1 : 0)}</span>
        </button>
        <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-white/30 hover:text-white/50 transition-all">
          <Flag size={12} />
        </button>
      </div>
    </article>
  )
}

// ─── Google yorum kartı ────────────────────────────────────────────────────────

function ExternalReviewCard({ review }: { review: any }) {
  const [expanded, setExpanded] = useState(false)
  const content = review.content ?? ''
  const isLong = content.length > 200

  return (
    <article className="bg-surface-1 border border-white/[0.06] rounded-2xl p-4 mb-3">
      <div className="flex items-start gap-3 mb-3">
        <Avatar name={review.authorName ?? 'G'} image={review.authorPhoto} size={40} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-white">{review.authorName ?? 'Google Kullanıcısı'}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/40 border border-white/[0.08]">
              {review.source === 'GOOGLE' ? '🔍 Google' : review.source}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {review.rating && <Stars rating={review.rating} />}
            {review.authorLevel && <span className="text-[10px] text-white/30">{review.authorLevel}</span>}
            <span className="text-xs text-white/30">{formatRelativeTime(review.publishedAt ?? review.scrapedAt)}</span>
          </div>
        </div>
      </div>

      {content && (
        <>
          <p className="text-sm text-white/75 leading-relaxed">
            {isLong && !expanded ? content.slice(0, 200) + '…' : content}
          </p>
          {isLong && (
            <button onClick={() => setExpanded(!expanded)} className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 transition-colors">
              {expanded ? 'Daha az göster' : 'Devamını oku'}
            </button>
          )}
        </>
      )}

      {/* Sahip yanıtı */}
      {review.ownerReply && (
        <div className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <p className="text-[11px] font-bold text-white/50 mb-1">İşletme Sahibi Yanıtı</p>
          <p className="text-xs text-white/60 leading-relaxed">{review.ownerReply}</p>
        </div>
      )}

      {review.sourceUrl && (
        <div className="mt-2">
          <a href={review.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] text-white/30 hover:text-white/50 transition-colors">
            <ExternalLink size={10} />
            Kaynağı gör
          </a>
        </div>
      )}
    </article>
  )
}

// ─── Ana sayfa ────────────────────────────────────────────────────────────────

export default function BusinessPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const [business, setBusiness]     = useState<any>(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(false)
  const [activeTab, setActiveTab]   = useState<'yorumlar' | 'bilgiler'>('yorumlar')
  const [activePhoto, setActivePhoto] = useState(0)
  const [reviewFilter, setReviewFilter] = useState<'tumu' | 'platform' | 'google'>('tumu')

  useEffect(() => {
    if (!slug) return
    fetchBusiness()
  }, [slug])

  async function fetchBusiness() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/businesses/${slug}`)
      if (!res.ok) { setError(true); return }
      const data = await res.json()
      setBusiness(data.data ?? data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="px-4 pt-4 animate-pulse space-y-4">
          <div className="h-56 rounded-2xl bg-white/5" />
          <div className="h-6 w-48 rounded-lg bg-white/5" />
          <div className="h-4 w-32 rounded-lg bg-white/5" />
          {[1,2,3].map(i => <div key={i} className="h-32 rounded-2xl bg-white/5" />)}
        </div>
      </AppLayout>
    )
  }

  if (error || !business) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-24 text-white/40">
          <p className="text-lg font-semibold mb-2">İşletme bulunamadı</p>
          <p className="text-sm mb-6">Bu sayfa mevcut değil veya kaldırılmış olabilir.</p>
          <button onClick={() => router.back()} className="px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-400 text-sm">Geri Dön</button>
        </div>
      </AppLayout>
    )
  }

  const attrs = business.attributes ?? {}
  const photos: string[] = attrs.photos ?? []
  const coverPhoto: string = attrs.coverPhoto ?? photos[0] ?? `https://picsum.photos/seed/${slug}/800/400`
  const trustScore = mapTrustScore(business.averageRating ?? 0)

  // Tüm özellikler: attributes.about içindeki tüm değerleri düzleştir
  const features: string[] = Object.values(attrs.about ?? {}).flat() as string[]

  // Platform yorumları
  const platformReviews: any[] = business.reviews ?? []
  // Google yorumları
  const externalReviews: any[] = business.externalReviews ?? []

  // Filtreli yorum listesi
  const visibleReviews =
    reviewFilter === 'platform' ? platformReviews :
    reviewFilter === 'google'   ? externalReviews :
    [...platformReviews, ...externalReviews].sort((a, b) =>
      new Date(b.createdAt ?? b.publishedAt ?? 0).getTime() -
      new Date(a.createdAt ?? a.publishedAt ?? 0).getTime()
    )

  const totalReviewCount = platformReviews.length + externalReviews.length

  // Rating: google yorumlarından ortalama
  const avgRating = externalReviews.length > 0
    ? (externalReviews.reduce((s, r) => s + (r.rating ?? 0), 0) / externalReviews.length).toFixed(1)
    : business.averageRating > 0
      ? (business.averageRating > 5 ? (business.averageRating / 1000).toFixed(1) : business.averageRating.toFixed(1))
      : null

  return (
    <AppLayout>
      <div className="pb-8">
        {/* Hero fotoğraf */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={photos[activePhoto] ?? coverPhoto}
            alt={business.name}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${slug}/800/400` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <button onClick={() => router.back()} className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white border border-white/10">
            <ChevronLeft size={18} />
          </button>
          <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white border border-white/10">
            <Share2 size={15} />
          </button>

          {photos.length > 1 && (
            <div className="absolute bottom-4 right-4 flex gap-1">
              {photos.slice(0, 5).map((_: string, i: number) => (
                <button key={i} onClick={() => setActivePhoto(i)}
                  className={cn('w-1.5 h-1.5 rounded-full transition-all', i === activePhoto ? 'bg-white' : 'bg-white/30')} />
              ))}
            </div>
          )}

          <div className="absolute bottom-4 left-4">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/40 text-white border border-white/20 backdrop-blur-sm">
              {business.category?.name ?? ''}
            </span>
          </div>
        </div>

        {/* İçerik */}
        <div className="px-4 pt-4">
          {/* Başlık + TrustScore */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white leading-tight mb-1">{business.name}</h1>
              <div className="flex items-center gap-1.5 text-xs text-white/50">
                <MapPin size={11} />
                <span>{[business.district, business.city].filter(Boolean).join(', ')}</span>
              </div>
            </div>
            <TrustScoreRing score={trustScore} size="md" showBreakdown={false} />
          </div>

          {/* İstatistikler */}
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            {avgRating && (
              <div className="flex items-center gap-1.5">
                <Star size={13} className="text-amber-400 fill-amber-400" />
                <span className="text-sm font-bold text-white">{avgRating}</span>
                <span className="text-xs text-white/40">({totalReviewCount} yorum)</span>
              </div>
            )}
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full',
              business.isOpen !== false
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            )}>
              {business.isOpen !== false ? 'Açık' : 'Kapalı'}
            </span>
            {attrs.priceRange && <span className="text-xs text-white/40">{attrs.priceRange}</span>}
          </div>

          {/* Özellikler */}
          {features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {features.slice(0, 8).map((f: string, i: number) => (
                <span key={i} className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-white/[0.06] text-white/60 border border-white/[0.08]">
                  {f}
                </span>
              ))}
            </div>
          )}

          {/* İletişim */}
          <div className="flex flex-wrap gap-2 mb-5">
            {business.phoneNumber && (
              <a href={`tel:${business.phoneNumber}`} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 text-xs font-medium">
                <Phone size={12} />{business.phoneNumber}
              </a>
            )}
            {business.website && (
              <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.06] text-white/60 border border-white/[0.08] text-xs font-medium">
                <Globe size={12} />Website
              </a>
            )}
            {business.address && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.06] text-white/60 border border-white/[0.08] text-xs">
                <MapPin size={12} />
                <span className="truncate max-w-[200px]">{business.address}</span>
              </div>
            )}
          </div>

          {/* Yorum Yaz */}
          <Link
            href={`/yorum-yaz?businessId=${business.id}&businessName=${encodeURIComponent(business.name)}`}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 transition-colors text-white font-semibold text-sm mb-5"
          >
            <Star size={15} className="fill-white" />
            Yorum Yaz
          </Link>

          {/* Ana Tabs */}
          <div className="flex gap-1 bg-surface-2 p-1 rounded-xl border border-white/[0.06] mb-4">
            {(['yorumlar', 'bilgiler'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={cn('flex-1 text-xs font-semibold py-2 rounded-lg transition-all capitalize',
                  activeTab === tab ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-white/40 hover:text-white/70'
                )}>
                {tab === 'yorumlar' ? `Yorumlar (${totalReviewCount})` : 'Bilgiler'}
              </button>
            ))}
          </div>

          {activeTab === 'yorumlar' ? (
            <>
              {/* Review kaynak filtresi */}
              {externalReviews.length > 0 && (
                <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
                  {[
                    { key: 'tumu', label: `Tümü (${totalReviewCount})` },
                    { key: 'google', label: `🔍 Google (${externalReviews.length})` },
                    ...(platformReviews.length > 0 ? [{ key: 'platform', label: `Tecrübelerim (${platformReviews.length})` }] : []),
                  ].map(({ key, label }) => (
                    <button key={key} onClick={() => setReviewFilter(key as any)}
                      className={cn('flex-shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-all',
                        reviewFilter === key ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-white/[0.04] text-white/40 border border-white/[0.06] hover:text-white/70'
                      )}>
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {visibleReviews.length > 0 ? (
                <div>
                  {visibleReviews.map((r: any) =>
                    r.source ? (
                      <ExternalReviewCard key={r.id} review={r} />
                    ) : (
                      <PlatformReviewCard key={r.id} review={r} />
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-white/30 text-sm">
                  <Star size={32} className="mx-auto mb-3 opacity-20" />
                  <p>Henüz yorum yok.</p>
                  <p className="mt-1 text-xs">İlk yorumu sen yaz!</p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              {business.description && (
                <div className="bg-surface-1 border border-white/[0.06] rounded-2xl p-4">
                  <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Hakkında</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{business.description}</p>
                </div>
              )}
              {Object.keys(attrs.about ?? {}).map((key: string) => (
                <div key={key} className="bg-surface-1 border border-white/[0.06] rounded-2xl p-4">
                  <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">{key}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {((attrs.about as any)[key] as string[]).map((v: string, i: number) => (
                      <span key={i} className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.06] text-white/60 border border-white/[0.08]">{v}</span>
                    ))}
                  </div>
                </div>
              ))}
              <div className="bg-surface-1 border border-white/[0.06] rounded-2xl p-4 space-y-2.5">
                <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Konum & İletişim</h3>
                {business.address && (
                  <div className="flex items-start gap-2.5 text-sm text-white/70">
                    <MapPin size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" /><span>{business.address}</span>
                  </div>
                )}
                {business.phoneNumber && (
                  <div className="flex items-center gap-2.5 text-sm text-white/70">
                    <Phone size={14} className="text-indigo-400 flex-shrink-0" />
                    <a href={`tel:${business.phoneNumber}`} className="hover:text-white">{business.phoneNumber}</a>
                  </div>
                )}
                {business.website && (
                  <div className="flex items-center gap-2.5 text-sm text-white/70">
                    <Globe size={14} className="text-indigo-400 flex-shrink-0" />
                    <a href={business.website} target="_blank" rel="noopener noreferrer" className="hover:text-white truncate">{business.website}</a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fotoğraf galerisi */}
          {photos.length > 1 && (
            <div className="mt-5">
              <h3 className="text-sm font-bold text-white mb-3">Fotoğraflar ({photos.length})</h3>
              <div className="grid grid-cols-3 gap-2">
                {photos.slice(0, 9).map((photo: string, i: number) => (
                  <button key={i} onClick={() => setActivePhoto(i)} className="aspect-square overflow-hidden rounded-xl">
                    <img src={photo} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
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
