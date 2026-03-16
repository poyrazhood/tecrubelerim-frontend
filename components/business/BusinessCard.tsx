'use client'
import Link from 'next/link'
import { MapPin, Star, MessageSquare, BadgeCheck, Zap } from 'lucide-react'
import { cn, getTrustColor } from '@/lib/utils'
import type { Business, TrustScore } from '@/types'
import { TrustScoreRing } from '@/components/ui/TrustScoreRing'

interface BusinessCardProps {
  business: Business
  showSemanticMatch?: boolean
}


function mapTrustScore(b: Business): TrustScore {
  if (b.trustScore && typeof b.trustScore === 'object') return b.trustScore as TrustScore
  const raw = b.averageRating ?? b.rating ?? 50
  const score = raw > 5 ? Math.min(100, Math.round(raw)) : Math.round(raw * 20)
  const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F'
  return { grade, score, breakdown: { reviewDepth: Math.round(score*0.9), recencyTrend: Math.round(score*1.05), verifiedRatio: Math.round(score*0.95), engagement: Math.round(score*0.85) }, trend: 'stable' }
}

export function BusinessCard({ business }: BusinessCardProps) {
  const rating = business.averageRating ?? business.rating ?? 0
  const reviewCount = business.totalReviews ?? business.reviewCount ?? 0

  // API'den gelen photos dizisini veya eski image alanını destekle
  const imageUrl = business.photos?.[0]?.url ?? business.image ?? null

  return (
    <Link href={`/isletme/${business.slug}`}>
      <article className={cn("group flex gap-3 p-3 rounded-2xl border mb-4 bg-white dark:bg-surface-1 hover:bg-indigo-500/[0.03] transition-all duration-200")} style={{ borderColor: getTrustColor(mapTrustScore(business).grade) + '40' }}>

        {/* Sol: Küçük resim */}
        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white/[0.04]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={business.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-2xl opacity-15">🏢</span>
            </div>
          )}
          {/* Açık/Kapalı badge */}
          {business.isOpen !== undefined && (
            <span className={cn(
              'absolute bottom-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full',
              business.isOpen ? 'bg-emerald-500 text-white' : 'bg-red-500/80 text-white'
            )}>
              {business.isOpen ? 'Açık' : 'Kapalı'}
            </span>
          )}
        </div>

        {/* Sağ: Bilgiler */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {/* İsim + doğrulama */}
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white truncate">{business.name}</h3>
                {business.isVerified && <BadgeCheck size={13} className="text-indigo-400 flex-shrink-0" />}
                {(business.subscriptionPlan === 'PREMIUM' || business.subscriptionPlan === 'ENTERPRISE') && (
                  <Zap size={11} className="text-amber-400 flex-shrink-0" />
                )}
              </div>

              {/* Konum */}
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={10} className="text-white/30 flex-shrink-0" />
                <span className="text-[11px] text-white/40 truncate">
                  {[business.district, business.city].filter(Boolean).join(', ')}
                </span>
              </div>

              {/* Kategori */}
              <span className="text-[10px] text-white/30 mt-0.5 block truncate">
                {typeof business.category === 'string'
                  ? business.category
                  : (business.category as any)?.name ?? 'Genel'}
              </span>
            </div>

            {/* TrustScore Ring */}
            <div className="flex-shrink-0 flex flex-col items-end gap-1">
              <TrustScoreRing score={mapTrustScore(business)} size="sm" showBreakdown={true} />
              <span className="text-[10px] text-white/30">{reviewCount} yorum</span>
            </div>
          </div>

          {/* Alt: Özellikler */}
          {business.attributes && business.attributes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {business.attributes.slice(0, 3).map((attr: string, i: number) => (
                <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.05] text-white/40 border border-white/[0.06]">
                  {attr}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
