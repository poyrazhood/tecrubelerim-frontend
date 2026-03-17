'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft, MapPin, Phone, Globe, Clock, Share2,
  Bookmark, Star, Sparkles, Brain, Wrench, MessageSquare,
  TrendingUp, ShieldCheck, Heart, ChevronRight, Send, Smile, Frown, Briefcase
} from 'lucide-react'
import { TrustScoreRing } from '@/components/ui/TrustScoreRing'
import { TrustStack } from '@/components/ui/TrustStack'
import { ReviewCard } from '@/components/feed/ReviewCard'
import { cn, getTrustColor } from '@/lib/utils'
import type { Business, Review } from '@/types'

interface BusinessProfileClientProps {
  business: Business
  reviews: Review[]
}

const RESPONSE_TEMPLATES = [
  {
    id: 't1', tone: 'professional', Icon: Briefcase, label: 'Profesyonel',
    preview: 'DeÄŸerli mÃ¼ÅŸterimiz, geri bildiriminiz iÃ§in teÅŸekkÃ¼r ederiz...',
    full: 'DeÄŸerli mÃ¼ÅŸterimiz, geri bildiriminiz iÃ§in teÅŸekkÃ¼r ederiz. YaÅŸadÄ±ÄŸÄ±nÄ±z deneyimi ciddiyetle deÄŸerlendiriyoruz. Kalite standartlarÄ±mÄ±zÄ± korumak adÄ±na gerekli Ã¶nlemleri alacaÄŸÄ±mÄ±zÄ± bildirmek isteriz.',
  },
  {
    id: 't2', tone: 'friendly', Icon: Smile, label: 'Samimi',
    preview: 'Merhaba! Ã–ncelikle bizi tercih ettiÄŸiniz iÃ§in teÅŸekkÃ¼rler...',
    full: 'Merhaba! Ã–ncelikle bizi tercih ettiÄŸiniz iÃ§in teÅŸekkÃ¼rler ğŸ™ Yorumunuzu okuduk ve Ã§ok deÄŸerli bulduk. Bir dahaki ziyaretinizde sizi aÄŸÄ±rlamaktan mutluluk duyacaÄŸÄ±z!',
  },
  {
    id: 't3', tone: 'apologetic', Icon: Frown, label: 'Ã–zÃ¼r Dileyen',
    preview: 'Ã–ncelikle yaÅŸadÄ±ÄŸÄ±nÄ±z olumsuz deneyim iÃ§in Ã¶zÃ¼r dileriz...',
    full: 'Ã–ncelikle yaÅŸadÄ±ÄŸÄ±nÄ±z olumsuz deneyim iÃ§in iÃ§ten Ã¶zÃ¼r dileriz. Bu asla kabul edilemez ve standartlarÄ±mÄ±zÄ±n altÄ±nda bir durum. HatamÄ±zÄ± telafi etmek iÃ§in sizi Ã¶zel olarak arayacaÄŸÄ±z.',
  },
]

function AISummaryCard({ business }: { business: Business }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-surface-2 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Brain size={15} className="text-indigo-400" />
        <span className="text-sm font-bold text-white">AI Ã–zeti</span>
        <span className="text-[10px] text-white/30 ml-1">Perplexity-style</span>
      </div>

      <p className="text-xs text-white/50 mb-3">
        {business.reviewCount} yorumun analizine gÃ¶re:
      </p>

      <ul className="space-y-2.5 mb-4">
        {[
          { label: 'Atmosfer', value: (business.aiSummary ?? { atmosphere: "", price: "", bestTime: "", highlights: [] }).atmosphere },
          { label: 'Fiyat', value: (business.aiSummary ?? { atmosphere: "", price: "", bestTime: "", highlights: [] }).price },
          { label: 'En Ä°yi Zaman', value: (business.aiSummary ?? { atmosphere: "", price: "", bestTime: "", highlights: [] }).bestTime },
        ].map((item) => (
          <li key={item.label} className="flex gap-2 text-sm">
            <span className="text-indigo-400 font-semibold flex-shrink-0">{item.label}:</span>
            <span className="text-white/70 leading-relaxed">{item.value}</span>
          </li>
        ))}
      </ul>

      <div className="border-t border-white/[0.06] pt-3">
        <div className="text-xs font-semibold text-white/40 mb-2">Ã–ne Ã‡Ä±kanlar</div>
        <div className="flex flex-wrap gap-1.5">
          {(business.aiSummary?.highlights ?? []).map((h) => (
            <span key={h} className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              âœ¦ {h}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
        <button className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1 transition-colors">
          <TrendingUp size={12} /> FaydalÄ± (89)
        </button>
        <button className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1 transition-colors">
          Yeniden Ã–zetle â†º
        </button>
      </div>
    </div>
  )
}

function AIResponsePanel() {
  const [selected, setSelected] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-surface-2 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <MessageSquare size={15} className="text-purple-400" />
          <span className="text-sm font-bold text-white">AI YanÄ±t AsistanÄ±</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">Ollama</span>
        </div>
        <ChevronRight size={14} className={cn('text-white/30 transition-transform', open && 'rotate-90')} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2 border-t border-white/[0.06] pt-4">
          {RESPONSE_TEMPLATES.map((t) => (
            <div key={t.id}>
              <button
                onClick={() => setSelected(selected === t.id ? null : t.id)}
                className={cn(
                  'w-full text-left p-3 rounded-xl border transition-all',
                  selected === t.id
                    ? 'bg-purple-500/15 border-purple-500/40'
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <t.Icon size={13} className={selected === t.id ? 'text-purple-400' : 'text-white/40'} />
                  <span className="text-xs font-semibold text-white">{t.label}</span>
                </div>
                <p className="text-xs text-white/40">{t.preview}</p>
              </button>

              {selected === t.id && (
                <div className="mt-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-sm text-white/80 leading-relaxed mb-3">{t.full}</p>
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-500/20 text-purple-300 text-sm font-semibold border border-purple-500/30 hover:bg-purple-500/30 transition-all">
                    <Send size={13} />
                    Bu YanÄ±tÄ± Kullan
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SectorMetrics({ business }: { business: Business }) {
  const metricsByCategory: Record<string, { label: string; value: number; color: string }[]> = {
    'Kafe': [
      { label: 'Atmosfer', value: 92, color: '#818CF8' },
      { label: 'Lezzet', value: 88, color: '#34D399' },
      { label: 'Servis', value: 90, color: '#FBBF24' },
      { label: 'Fiyat/Perf.', value: 85, color: '#F472B6' },
    ],
    'Oto Servis': [
      { label: 'Fiyat ÅeffaflÄ±ÄŸÄ±', value: 95, color: '#818CF8' },
      { label: 'TeÅŸhis DoÄŸruluÄŸu', value: 94, color: '#34D399' },
      { label: 'ParÃ§a OrijinalliÄŸi', value: 98, color: '#FBBF24' },
      { label: 'Garanti DesteÄŸi', value: 92, color: '#F472B6' },
    ],
    'EÄŸitim': [
      { label: 'Ã–ÄŸretmen Ä°lgisi', value: 94, color: '#818CF8' },
      { label: 'Veli Ä°letiÅŸimi', value: 89, color: '#34D399' },
      { label: 'Ä°lerleme Takibi', value: 87, color: '#FBBF24' },
      { label: 'Fiyat/Perf.', value: 82, color: '#F472B6' },
    ],
  }

  const metrics = metricsByCategory[typeof business.category === "string" ? business.category : (business.category as any)?.name ?? ""]
  if (!metrics) return null

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-surface-2 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Wrench size={15} className="text-amber-400" />
        <span className="text-sm font-bold text-white">SektÃ¶rel DeÄŸerlendirme</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <div className="text-xl font-black mb-0.5" style={{ color: m.color }}>
              %{m.value}
            </div>
            <div className="text-[11px] text-white/40">{m.label}</div>
            <div className="mt-2 h-1 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${m.value}%`, background: m.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function BusinessProfileClient({ business, reviews }: BusinessProfileClientProps) {
  const [activeTab, setActiveTab] = useState<'ozet' | 'yorumlar' | 'fotograflar'>('ozet')
  const [saved, setSaved] = useState(false)

  const trustScoreObj = typeof business.trustScore === "number" ? { grade: "C", score: business.trustScore, breakdown: { reviewDepth: 60, recencyTrend: 60, verifiedRatio: 60, engagement: 60 }, trend: "stable" as const } : business.trustScore
  const color = getTrustColor(trustScoreObj?.grade ?? "C")

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-64">
        <img
          src={business.image}
          alt={business.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-surface" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
          <Link href="/" className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20 text-white hover:bg-black/60 transition-all">
            <ChevronLeft size={18} />
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSaved(!saved)}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20 text-white hover:bg-black/60 transition-all"
            >
              <Bookmark size={15} className={saved ? 'fill-white' : ''} />
            </button>
            <button className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20 text-white hover:bg-black/60 transition-all">
              <Share2 size={15} />
            </button>
          </div>
        </div>

        {/* Category + open badge */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 text-white">
            {typeof business.category === "string" ? business.category : (business.category as any)?.name ?? ""}
          </span>
          <span className={cn(
            'text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm',
            business.isOpen
              ? 'bg-emerald-500/30 border border-emerald-500/50 text-emerald-300'
              : 'bg-red-500/30 border border-red-500/50 text-red-300'
          )}>
            {business.isOpen ? 'â— AÃ§Ä±k' : 'â— KapalÄ±'} Â· {business.hours}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-2">
        {/* Header info */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-white leading-tight mb-1">
              {business.name}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <MapPin size={11} />
              <span>{business.district}, {business.city}</span>
              <span className="text-white/20">Â·</span>
              <span>{business.priceRange}</span>
            </div>
          </div>
          <TrustScoreRing score={trustScoreObj as any} size="lg" />
        </div>

        {/* Trust stack */}
        <div className="mb-3">
          <TrustStack stack={business.trustStack} />
        </div>

        {/* GÃ¶nÃ¼l Alma */}
        {business.hasGonulAlma && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-pink-500/10 border border-pink-500/20">
            <Heart size={13} className="text-pink-400 fill-pink-400" />
            <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">GÃ¶nÃ¼l Alma Rozeti</span>
            <span className="text-xs text-white/40 ml-1">MÃ¼ÅŸteri memnuniyetine Ã¶zel Ã§aba gÃ¶sterdi</span>
          </div>
        )}

        {/* Cultural tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {business.culturalTags.map((tag) => (
            <span key={tag} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400/80 border border-amber-500/20">
              {tag}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Yorum', value: business.reviewCount.toLocaleString('tr-TR') },
            { label: 'TrustScore', value: business.trustScore.score, color },
            { label: 'EÅŸleÅŸme', value: business.semanticMatch ? `%${business.semanticMatch}` : 'â€”' },
          ].map((stat) => (
            <div key={stat.label} className="p-3 rounded-xl bg-surface-2 border border-white/[0.06] text-center">
              <div className="text-lg font-black text-white" style={stat.color ? { color: stat.color } : {}}>
                {stat.value}
              </div>
              <div className="text-[10px] text-white/40 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface-2 p-1 rounded-xl border border-white/[0.06] mb-4">
          {[
            { key: 'ozet', label: 'AI Ã–zet' },
            { key: 'yorumlar', label: `Yorumlar (${reviews.length})` },
            { key: 'fotograflar', label: 'FotoÄŸraflar' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={cn(
                'flex-1 text-xs font-semibold py-2 px-2 rounded-lg transition-all',
                activeTab === tab.key
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-white/40 hover:text-white/70'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'ozet' && (
          <div className="space-y-3 pb-24">
            <AISummaryCard business={business} />
            <SectorMetrics business={business} />

            {/* Contact */}
            <div className="rounded-2xl border border-white/[0.07] bg-surface-2 p-4">
              <h3 className="text-sm font-bold text-white mb-3">Ä°letiÅŸim & Konum</h3>
              <div className="space-y-3">
                {[
                  { Icon: MapPin, text: business.address },
                  { Icon: Phone, text: business.phone },
                  ...(business.website ? [{ Icon: Globe, text: business.website }] : []),
                  { Icon: Clock, text: business.hours },
                ].map(({ Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-white/60">
                    <Icon size={14} className="text-white/30 flex-shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <AIResponsePanel />
          </div>
        )}

        {activeTab === 'yorumlar' && (
          <div className="pb-24">
            {reviews.length === 0 ? (
              <div className="text-center py-12 text-white/30">
                <Star size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">HenÃ¼z yorum yok</p>
              </div>
            ) : (
              reviews.map((r) => <ReviewCard key={r.id} review={r} />)
            )}
          </div>
        )}

        {activeTab === 'fotograflar' && (
          <div className="pb-24">
            <div className="grid grid-cols-2 gap-2">
              {[business.image, ...reviews.flatMap((r) => r.photos)].map((photo, i) => (
                <img
                  key={i}
                  src={photo}
                  alt=""
                  className="w-full aspect-square object-cover rounded-xl"
                />
              ))}
            </div>
            {reviews.flatMap((r) => r.photos).length === 0 && (
              <div className="col-span-2 text-center py-12 text-white/30 text-sm">
                KullanÄ±cÄ± fotoÄŸrafÄ± henÃ¼z yok
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] p-4 bg-surface/90 backdrop-blur-xl border-t border-white/[0.06]">
        <div className="flex gap-2">
          <Link
            href={`tel:${business.phone}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white text-sm font-semibold hover:bg-white/10 transition-all"
          >
            <Phone size={15} />
            Ara
          </Link>
          <Link
            href="/yorum-yaz"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/25"
          >
            <Star size={15} />
            Yorum Yaz
          </Link>
        </div>
      </div>
    </div>
  )
}
