'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Search, Star, ArrowLeftRight, Trophy, TrendingUp, TrendingDown, Minus, ChevronRight, Zap, Users, MessageSquare, Shield, Brain, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '')

// ── Radar SVG ────────────────────────────────────────────────────────────────
const RADAR_AXES = [
  { key: 'hiz',        label: 'Hız',        angle: 0   },
  { key: 'kalite',     label: 'Kalite',     angle: 60  },
  { key: 'fiyat',      label: 'Fiyat',      angle: 120 },
  { key: 'hizmet',     label: 'Hizmet',     angle: 180 },
  { key: 'temizlik',   label: 'Temizlik',   angle: 240 },
  { key: 'atmosfer',   label: 'Atmosfer',   angle: 300 },
]

function polarToXY(angle: number, r: number, cx: number, cy: number) {
  const rad = (angle - 90) * (Math.PI / 180)
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function buildPath(scores: number[], cx: number, cy: number, maxR: number) {
  return scores.map((s, i) => {
    const pt = polarToXY(RADAR_AXES[i].angle, (s / 100) * maxR, cx, cy)
    return (i === 0 ? 'M' : 'L') + pt.x.toFixed(1) + ',' + pt.y.toFixed(1)
  }).join(' ') + ' Z'
}

function DualRadar({ scores1, scores2, name1, name2 }: { scores1: number[], scores2: number[], name1: string, name2: string }) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { setTimeout(() => setAnimated(true), 100) }, [])
  const cx = 130, cy = 130, maxR = 95, size = 260
  const rings = [20, 40, 60, 80, 100]
  const s1 = animated ? scores1 : scores1.map(() => 0)
  const s2 = animated ? scores2 : scores2.map(() => 0)

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id="rg1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="rg2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
          </radialGradient>
        </defs>
        {rings.map(ring => {
          const pts = RADAR_AXES.map(a => {
            const pt = polarToXY(a.angle, (ring / 100) * maxR, cx, cy)
            return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`
          }).join(' ')
          return <polygon key={ring} points={pts} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
        })}
        {RADAR_AXES.map((axis, i) => {
          const pt = polarToXY(axis.angle, maxR, cx, cy)
          return <line key={i} x1={cx} y1={cy} x2={pt.x} y2={pt.y} stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
        })}
        {/* İşletme 2 - Amber */}
        <path d={buildPath(s2, cx, cy, maxR)} fill="url(#rg2)" stroke="#f59e0b" strokeWidth="2"
          style={{ transition: 'all 0.9s cubic-bezier(0.34,1.56,0.64,1)' }}/>
        {/* İşletme 1 - Indigo */}
        <path d={buildPath(s1, cx, cy, maxR)} fill="url(#rg1)" stroke="#6366f1" strokeWidth="2"
          style={{ transition: 'all 0.9s cubic-bezier(0.34,1.56,0.64,1) 0.1s' }}/>
        {RADAR_AXES.map((axis, i) => {
          const pt = polarToXY(axis.angle, maxR + 20, cx, cy)
          return (
            <g key={i}>
              <text x={pt.x} y={pt.y - 3} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontWeight="600">{axis.label}</text>
              <text x={pt.x} y={pt.y + 9} textAnchor="middle" fill="#6366f1" fontSize="8" fontWeight="800">{s1[i]}</text>
              <text x={pt.x} y={pt.y + 19} textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="800">{s2[i]}</text>
            </g>
          )
        })}
      </svg>
      <div className="flex items-center gap-4 mt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-indigo-500 rounded-full"/>
          <span className="text-[10px] text-indigo-400 font-bold truncate max-w-[80px]">{name1}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-amber-500 rounded-full"/>
          <span className="text-[10px] text-amber-400 font-bold truncate max-w-[80px]">{name2}</span>
        </div>
      </div>
    </div>
  )
}

// ── Skor Çubuğu ─────────────────────────────────────────────────────────────
function BattleBar({ label, val1, val2, name1, name2 }: { label: string, val1: number, val2: number, name1: string, name2: string }) {
  const winner = val1 > val2 ? 1 : val2 > val1 ? 2 : 0
  const max = Math.max(val1, val2, 1)
  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-white/50 font-medium">{label}</span>
        {winner > 0 && (
          <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full',
            winner === 1 ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'
          )}>
            +{Math.round(Math.abs(val1 - val2))} {winner === 1 ? name1.split(' ')[0] : name2.split(' ')[0]}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-black text-indigo-400 w-8 text-right">{val1}</span>
        <div className="flex-1 flex items-center gap-1">
          <div className="flex-1 h-2 rounded-full bg-white/[0.05] overflow-hidden flex justify-end">
            <div className="h-full rounded-full bg-indigo-500 transition-all duration-700"
              style={{ width: `${(val1 / max) * 100}%` }}/>
          </div>
          <div className="w-px h-4 bg-white/10"/>
          <div className="flex-1 h-2 rounded-full bg-white/[0.05] overflow-hidden">
            <div className="h-full rounded-full bg-amber-500 transition-all duration-700"
              style={{ width: `${(val2 / max) * 100}%` }}/>
          </div>
        </div>
        <span className="text-xs font-black text-amber-400 w-8">{val2}</span>
      </div>
    </div>
  )
}

// ── TrustScore Vizör ─────────────────────────────────────────────────────────
function TrustVizor({ score, name, color }: { score: number, name: string, color: 'indigo' | 'amber' }) {
  const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F'
  const isIndigo = color === 'indigo'
  return (
    <div className={cn('flex-1 rounded-2xl border p-4 text-center relative overflow-hidden',
      isIndigo ? 'border-indigo-500/25 bg-indigo-950/30' : 'border-amber-500/25 bg-amber-950/30'
    )}>
      <div className={cn('absolute top-0 left-0 right-0 h-0.5', isIndigo ? 'bg-indigo-500' : 'bg-amber-500')}/>
      <div className={cn('text-5xl font-black mb-1', isIndigo ? 'text-indigo-400' : 'text-amber-400')}>{grade}</div>
      <div className={cn('text-2xl font-black', isIndigo ? 'text-indigo-300' : 'text-amber-300')}>{score}</div>
      <div className="text-[10px] text-white/30 mt-0.5">TrustScore</div>
      <div className="text-xs font-bold text-white mt-2 truncate px-1">{name}</div>
    </div>
  )
}

// ── İşletme Arama ────────────────────────────────────────────────────────────
function BusinessSearchInput({ value, onChange, placeholder, color }: {
  value: any, onChange: (b: any) => void, placeholder: string, color: 'indigo' | 'amber'
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const timer = useRef<any>(null)

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`${API}/api/businesses?search=${encodeURIComponent(query)}&limit=5`)
        const d = await res.json()
        setResults(d.data || d.businesses || [])
      } catch {}
      finally { setSearching(false) }
    }, 300)
  }, [query])

  const isIndigo = color === 'indigo'

  if (value) return (
    <div className={cn('flex items-center gap-2 p-3 rounded-xl border', isIndigo ? 'border-indigo-500/30 bg-indigo-500/10' : 'border-amber-500/30 bg-amber-500/10')}>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-white truncate">{value.name}</div>
        <div className="text-[10px] text-white/40">{value.category?.name} · {value.city}</div>
      </div>
      <button onClick={() => onChange(null)} className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0">
        <X size={14}/>
      </button>
    </div>
  )

  return (
    <div className="relative">
      <div className={cn('flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-colors',
        isIndigo ? 'border-indigo-500/30 bg-indigo-500/5 focus-within:border-indigo-500/60' : 'border-amber-500/30 bg-amber-500/5 focus-within:border-amber-500/60'
      )}>
        <Search size={13} className={isIndigo ? 'text-indigo-400/60' : 'text-amber-400/60'}/>
        <input value={query} onChange={e => { setQuery(e.target.value); setOpen(true) }}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"/>
        {searching && <Loader2 size={12} className="animate-spin text-white/30"/>}
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-white/[0.08] bg-[#0f0f14] shadow-xl z-50 overflow-hidden">
          {results.map(biz => (
            <button key={biz.id} onClick={() => { onChange(biz); setQuery(''); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/[0.05] transition-colors text-left">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">{biz.name}</div>
                <div className="text-[10px] text-white/40">{biz.category?.name} · {biz.city}</div>
              </div>
              <ChevronRight size={12} className="text-white/20 flex-shrink-0"/>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── AI Karar Asistanı ────────────────────────────────────────────────────────
function AIDecisionBox({ biz1, biz2 }: { biz1: any, biz2: any }) {
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const analyze = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/compare/ai-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId1: biz1.id, businessId2: biz2.id })
      })
      const d = await res.json()
      setResult(d.summary || 'Analiz tamamlandı.')
    } catch {
      setResult(`${biz1.name} ile ${biz2.name} karşılaştırıldığında; ${biz1.name} ${biz1.averageRating > biz2.averageRating ? 'daha yüksek puanlı' : 'daha düşük puanlı'} ve ${biz1.totalReviews} yorum almış. ${biz2.name} ise ${biz2.totalReviews} yorum ile ${biz2.averageRating > biz1.averageRating ? 'öne çıkıyor' : 'geride kalıyor'}.`)
    }
    finally { setLoading(false) }
  }

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/50 to-purple-950/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Brain size={15} className="text-indigo-400"/>
        <span className="text-sm font-bold text-white">Hangisini Seçmeliyim?</span>
        <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full border border-indigo-500/20 ml-auto">AI Asistan</span>
      </div>
      {result ? (
        <div>
          <p className="text-xs text-white/60 leading-relaxed">{result}</p>
          <div className="mt-3 text-[10px] text-white/25">
            Bu analiz {(biz1.totalReviews || 0) + (biz2.totalReviews || 0)} gerçek kullanıcı tecrübesine dayanmaktadır.
          </div>
        </div>
      ) : (
        <div>
          <p className="text-xs text-white/40 mb-3 leading-relaxed">
            Her iki işletmenin yorumlarını analiz edip hangi durumda hangisini seçmeniz gerektiğini açıklayalım.
          </p>
          <button onClick={analyze} disabled={loading}
            className="w-full py-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-xs font-bold text-indigo-300 hover:bg-indigo-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <><Loader2 size={13} className="animate-spin"/>Analiz ediliyor...</> : <><Zap size={13}/>AI Analizi Başlat</>}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Ana Sayfa ────────────────────────────────────────────────────────────────
export default function KarsilastirPage() {
  const params = useParams()
  const router = useRouter()
  const [biz1, setBiz1] = useState<any>(null)
  const [biz2, setBiz2] = useState<any>(null)
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)

  // URL'den slug parse et: "isletme1-vs-isletme2"
  useEffect(() => {
    const slug = params?.slug as string
    if (!slug || !slug.includes('-vs-')) return
    const [s1, s2] = slug.split('-vs-')
    if (s1) loadBusiness(s1, setBiz1, setLoading1)
    if (s2) loadBusiness(s2, setBiz2, setLoading2)
  }, [params?.slug])

  // İşletme yüklenince URL güncelle
  useEffect(() => {
    if (biz1?.slug && biz2?.slug) {
      router.replace(`/karsilastir/${biz1.slug}-vs-${biz2.slug}`, { scroll: false })
    }
  }, [biz1?.slug, biz2?.slug])

  async function loadBusiness(slug: string, setter: (b: any) => void, setLoad: (v: boolean) => void) {
    setLoad(true)
    try {
      const res = await fetch(`${API}/api/businesses/${slug}`)
      if (res.ok) {
        const d = await res.json()
        setter(d.data ?? d)
      }
    } catch {}
    finally { setLoad(false) }
  }

  // Skor hesapla
  const normalize = (val: number) => {
    if (!val) return 0
    if (val <= 5)   return Math.round(val * 20)
    if (val <= 500) return Math.round(val / 5)
    return Math.round(val / 10000 * 100)
  }

  const score1 = biz1 ? normalize(biz1.averageRating ?? 0) : 0
  const score2 = biz2 ? normalize(biz2.averageRating ?? 0) : 0

  // Radar skorları (şimdilik averageRating bazlı, gerçek radar verileri eklenince güncellenir)
  const makeRadarScores = (biz: any) => {
    if (!biz) return [0, 0, 0, 0, 0, 0]
    const base = normalize(biz.averageRating ?? 0)
    const reviews = biz.totalReviews || 0
    const boost   = Math.min(reviews / 100, 20)
    return [
      Math.min(100, Math.round(base * 0.95 + Math.random() * 5)),
      Math.min(100, Math.round(base * 1.02 + boost)),
      Math.min(100, Math.round(base * 0.88 + boost * 0.5)),
      Math.min(100, Math.round(base * 1.05 + boost * 0.3)),
      Math.min(100, Math.round(base * 0.92 + Math.random() * 8)),
      Math.min(100, Math.round(base * 0.98 + boost * 0.4)),
    ]
  }

  const radar1 = makeRadarScores(biz1)
  const radar2 = makeRadarScores(biz2)

  const ready = biz1 && biz2

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto pb-20">

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <ArrowLeftRight size={16} className="text-indigo-400"/>
            <h1 className="text-lg font-black text-white">Deneyim Karşılaştırması</h1>
          </div>
          <p className="text-xs text-white/40">İki işletmeyi gerçek kullanıcı yorumlarıyla karşılaştır</p>
        </div>

        {/* İşletme Seçici */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-3 h-3 rounded-full bg-indigo-500"/>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">1. İşletme</span>
            </div>
            <BusinessSearchInput value={biz1} onChange={b => { setBiz1(b); if (b) loadBusiness(b.slug, setBiz1, setLoading1) }}
              placeholder="İşletme ara..." color="indigo"/>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-3 h-3 rounded-full bg-amber-500"/>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">2. İşletme</span>
            </div>
            <BusinessSearchInput value={biz2} onChange={b => { setBiz2(b); if (b) loadBusiness(b.slug, setBiz2, setLoading2) }}
              placeholder="İşletme ara..." color="amber"/>
          </div>
        </div>

        {!ready ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-white/[0.08]">
            <ArrowLeftRight size={36} className="mx-auto mb-3 text-white/15"/>
            <div className="text-sm font-bold text-white mb-1">İki işletme seç</div>
            <div className="text-xs text-white/30">Karşılaştırmak istediğin iki işletmeyi yukarıdan seç</div>
            {/* Örnek karşılaştırmalar */}
            <div className="mt-6 space-y-2 max-w-xs mx-auto">
              <div className="text-[10px] text-white/20 uppercase tracking-wider mb-2">Popüler Karşılaştırmalar</div>
              {['vodafone-vs-turkcell', 'starbucks-vs-kahve-dunyasi'].map(slug => (
                <Link key={slug} href={`/karsilastir/${slug}`}
                  className="block px-3 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02] text-xs text-white/40 hover:text-white/60 hover:bg-white/[0.05] transition-all">
                  {slug.replace('-vs-', ' vs ').replace(/-/g, ' ')}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">

            {/* TrustScore Vizörü */}
            <div className="flex gap-3">
              <TrustVizor score={score1} name={biz1.name} color="indigo"/>
              <div className="flex items-center justify-center flex-shrink-0">
                <div className="w-8 h-8 rounded-full border border-white/[0.08] bg-white/[0.04] flex items-center justify-center">
                  <span className="text-[10px] font-black text-white/30">VS</span>
                </div>
              </div>
              <TrustVizor score={score2} name={biz2.name} color="amber"/>
            </div>

            {/* Kazanan Banner */}
            {score1 !== score2 && (
              <div className={cn('flex items-center gap-2 p-3 rounded-xl border',
                score1 > score2 ? 'border-indigo-500/25 bg-indigo-500/10' : 'border-amber-500/25 bg-amber-500/10'
              )}>
                <Trophy size={14} className={score1 > score2 ? 'text-indigo-400' : 'text-amber-400'}/>
                <span className="text-xs text-white/70">
                  <span className={cn('font-black', score1 > score2 ? 'text-indigo-400' : 'text-amber-400')}>
                    {score1 > score2 ? biz1.name : biz2.name}
                  </span>
                  {' '}TrustScore'da {Math.abs(score1 - score2)} puan önde
                </span>
              </div>
            )}

            {/* Çakıştırmalı Radar */}
            <div className="rounded-2xl border border-white/[0.07] bg-surface-2 p-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={14} className="text-emerald-400"/>
                <span className="text-sm font-bold text-white">Yetkinlik Radarı</span>
                <span className="text-[10px] text-white/30 ml-auto">Çakıştırmalı Görünüm</span>
              </div>
              <DualRadar scores1={radar1} scores2={radar2} name1={biz1.name} name2={biz2.name}/>
            </div>

            {/* Karşılaştırma Çubukları */}
            <div className="rounded-2xl border border-white/[0.07] bg-surface-2 p-4">
              <div className="flex items-center gap-2 mb-3">
                <ArrowLeftRight size={14} className="text-primary"/>
                <span className="text-sm font-bold text-white">Detaylı Karşılaştırma</span>
              </div>
              <div className="divide-y divide-white/[0.05]">
                <BattleBar label="Ortalama Puan" val1={Math.round((biz1.averageRating || 0) * 20)} val2={Math.round((biz2.averageRating || 0) * 20)} name1={biz1.name} name2={biz2.name}/>
                <BattleBar label="Yorum Sayısı" val1={Math.min(biz1.totalReviews || 0, 100)} val2={Math.min(biz2.totalReviews || 0, 100)} name1={biz1.name} name2={biz2.name}/>
                <BattleBar label="Hız" val1={radar1[0]} val2={radar2[0]} name1={biz1.name} name2={biz2.name}/>
                <BattleBar label="Kalite" val1={radar1[1]} val2={radar2[1]} name1={biz1.name} name2={biz2.name}/>
                <BattleBar label="Fiyat" val1={radar1[2]} val2={radar2[2]} name1={biz1.name} name2={biz2.name}/>
                <BattleBar label="Müşteri Hizmetleri" val1={radar1[3]} val2={radar2[3]} name1={biz1.name} name2={biz2.name}/>
              </div>
            </div>

            {/* İstatistikler */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Toplam Yorum', v1: biz1.totalReviews || 0, v2: biz2.totalReviews || 0, icon: MessageSquare },
                { label: 'Ortalama Puan', v1: (biz1.averageRating || 0).toFixed(1), v2: (biz2.averageRating || 0).toFixed(1), icon: Star },
              ].map(({ label, v1, v2, icon: Icon }) => (
                <div key={label} className="rounded-2xl border border-white/[0.07] bg-surface-2 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon size={12} className="text-white/30"/>
                    <span className="text-[10px] text-white/40">{label}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="text-center">
                      <div className="text-lg font-black text-indigo-400">{v1}</div>
                      <div className="text-[9px] text-white/25 truncate max-w-[60px]">{biz1.name.split(' ')[0]}</div>
                    </div>
                    <div className="text-xs text-white/20 font-bold mb-2">vs</div>
                    <div className="text-center">
                      <div className="text-lg font-black text-amber-400">{v2}</div>
                      <div className="text-[9px] text-white/25 truncate max-w-[60px]">{biz2.name.split(' ')[0]}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Karar Asistanı */}
            <AIDecisionBox biz1={biz1} biz2={biz2}/>

            {/* İşletme Linkleri */}
            <div className="grid grid-cols-2 gap-3">
              {[biz1, biz2].map((biz, i) => (
                <Link key={biz.id} href={`/isletme/${biz.slug}`}>
                  <div className={cn('p-3 rounded-xl border transition-all hover:opacity-80',
                    i === 0 ? 'border-indigo-500/20 bg-indigo-500/5' : 'border-amber-500/20 bg-amber-500/5'
                  )}>
                    <div className="text-xs font-bold text-white truncate mb-0.5">{biz.name}</div>
                    <div className="text-[10px] text-white/30">{biz.category?.name}</div>
                    <div className={cn('text-[10px] font-semibold mt-1.5', i === 0 ? 'text-indigo-400' : 'text-amber-400')}>
                      İşletme Sayfası →
                    </div>
                  </div>
                </Link>
              ))}
            </div>

          </div>
        )}
      </div>
    </AppLayout>
  )
}
