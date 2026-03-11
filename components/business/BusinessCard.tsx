'use client'

import Link from 'next/link'
import { MapPin, Clock, Wifi, Zap, ChevronRight, Heart } from 'lucide-react'
import { TrustScoreRing } from '@/components/ui/TrustScoreRing'
import { TrustStack } from '@/components/ui/TrustStack'
import { cn, getTrustColor } from '@/lib/utils'
import type { Business } from '@/types'

interface BusinessCardProps {
  business: Business
  showSemanticMatch?: boolean
}

const FEATURE_ICONS: Record<string, { icon: typeof Wifi; label: string }> = {
  wifi: { icon: Wifi, label: 'WiFi' },
  priz: { icon: Zap, label: 'Priz' },
  sessiz: { icon: Clock, label: 'Sessiz' },
}

export function BusinessCard({ business, showSemanticMatch }: BusinessCardProps) {
  return (
    <Link href={`/isletme/${business.slug}`}>
      <article className="feed-card group relative rounded-2xl overflow-hidden border border-white/[0.06] bg-surface-1 mb-3 cursor-pointer">
        {/* Image */}
        <div className="relative h-44 overflow-hidden">
          <img
            src={business.image}
            alt={business.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-1 via-transparent to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className={cn(
              'text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm',
              'bg-black/40 text-white border border-white/20'
            )}>
              {business.category}
            </span>

            {business.hasGonulAlma && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-pink-500/30 text-pink-300 border border-pink-500/40 backdrop-blur-sm flex items-center gap-1">
                <Heart size={9} className="fill-pink-300" />
                Gönül Alma
              </span>
            )}
          </div>

          {/* Open/closed */}
          <div className="absolute top-3 right-3">
            <span className={cn(
              'text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm',
              business.isOpen
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                : 'bg-red-500/25 text-red-300 border border-red-500/40'
            )}>
              {business.isOpen ? 'Açık' : 'Kapalı'}
            </span>
          </div>

          {/* Semantic match */}
          {showSemanticMatch && business.semanticMatch && (
            <div className="absolute bottom-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 backdrop-blur-sm">
              %{business.semanticMatch} eşleşme
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base text-white leading-tight mb-1 truncate">
                {business.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-white/50">
                <MapPin size={11} />
                <span>{business.district}, {business.city}</span>
                <span className="text-white/20">·</span>
                <span>{business.priceRange}</span>
                <span className="text-white/20">·</span>
                <Clock size={11} />
                <span>{business.hours}</span>
              </div>
            </div>

            <TrustScoreRing score={business.trustScore} size="sm" showBreakdown={false} />
          </div>

          {/* Cultural tags */}
          {business.culturalTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {business.culturalTags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400/80 border border-amber-500/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Trust stack + review count */}
          <div className="flex items-center justify-between">
            <TrustStack stack={business.trustStack} compact />
            <div className="flex items-center gap-3 text-xs text-white/40">
              <span>{business.reviewCount.toLocaleString('tr-TR')} yorum</span>
              <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 transition-colors" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
