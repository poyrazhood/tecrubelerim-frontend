'use client'

import { useState, useEffect, useRef } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import Link from 'next/link'
import { Shield, Star, Clock, Zap, Eye, Award, ChevronRight, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react'

// ─── Animasyonlu Sayaç ────────────────────────────────────────────────────────
function CountUp({ target, duration = 1500, suffix = '' }: { target: number; duration?: number; suffix?: string }) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      const start = performance.now()
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        setValue(Math.round(eased * target))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{value.toLocaleString('tr-TR')}{suffix}</span>
}

// ─── Radar Önizleme (SVG) ─────────────────────────────────────────────────────
function RadarPreview({ scores, color }: { scores: number[]; color: string }) {
  const cx = 60, cy = 60, r = 48
  const n = scores.length
  const points = scores.map((s, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2
    const d = (s / 100) * r
    return [cx + d * Math.cos(angle), cy + d * Math.sin(angle)]
  })
  const polygon = points.map(p => p.join(',')).join(' ')
  const axes = Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]
  })

  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      {[0.25, 0.5, 0.75, 1].map(t => (
        <polygon key={t} points={axes.map(([x, y]) => `${cx + (x - cx) * t},${cy + (y - cy) * t}`).join(' ')}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      ))}
      {axes.map(([x, y], i) => (
        <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      ))}
      <polygon points={polygon} fill={color + '33'} stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

// ─── Not Rozeti ───────────────────────────────────────────────────────────────
function GradeBadge({ grade, score, size = 'md' }: { grade: string; score: number; size?: 'sm' | 'md' | 'lg' }) {
  const colors: Record<string, { ring: string; text: string; bg: string }> = {
    'A+': { ring: '#34d399', text: '#34d399', bg: 'rgba(52,211,153,0.1)' },
    'A':  { ring: '#6ee7b7', text: '#6ee7b7', bg: 'rgba(110,231,183,0.1)' },
    'B':  { ring: '#60a5fa', text: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
    'C':  { ring: '#fbbf24', text: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
    'D':  { ring: '#fb923c', text: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
    'F':  { ring: '#f87171', text: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  }
  const c = colors[grade] || colors['F']
  const dim = size === 'lg' ? 80 : size === 'md' ? 56 : 40
  const fontSize = size === 'lg' ? 28 : size === 'md' ? 20 : 14
  const scoreFontSize = size === 'lg' ? 11 : size === 'md' ? 9 : 7

  const circumference = 2 * Math.PI * (dim / 2 - 5)
  const dash = (score / 100) * circumference

  return (
    <div className="relative flex-shrink-0" style={{ width: dim, height: dim }}>
      <svg viewBox={`0 0 ${dim} ${dim}`} style={{ width: dim, height: dim, transform: 'rotate(-90deg)' }}>
        <circle cx={dim/2} cy={dim/2} r={dim/2-5} fill={c.bg} stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
        <circle cx={dim/2} cy={dim/2} r={dim/2-5} fill="none" stroke={c.ring} strokeWidth="2.5"
          strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span style={{ fontSize, fontWeight: 900, color: c.text, lineHeight: 1 }}>{grade}</span>
        <span style={{ fontSize: scoreFontSize, color: 'rgba(255,255,255,0.35)', lineHeight: 1, marginTop: 1 }}>{score}</span>
      </div>
    </div>
  )
}

const COMPONENTS = [
  {
    icon: Star,
    label: 'Review Kalitesi',
    weight: 60,
    color: '#6366f1',
    desc: 'Yorumların zamana göre ağırlıklandırılmış ortalaması. Eski yorumlar daha az, yeni yorumlar daha çok etkiler.',
    detail: 'Bayesian düzeltme + zaman ağırlıklı ortalama',
    tip: 'Daha fazla gerçek yorum toplayın, müşterilerinizi yorum yazmaya teşvik edin.',
  },
  {
    icon: Shield,
    label: 'Doğrulama',
    weight: 15,
    color: '#10b981',
    desc: 'Telefon, e-posta, adres doğrulama durumu ve işletmenin platform üzerinden sahiplenilmesi.',
    detail: 'Kimlik doğrulama + sahiplik talebi',
    tip: 'Telefon numaranızı ve e-postanızı doğrulayın, işletmenizi sahiplendirin.',
  },
  {
    icon: Eye,
    label: 'Etkileşim',
    weight: 10,
    color: '#f59e0b',
    desc: 'Yorumlara verilen yanıt oranı ve sayfa görüntülenme sayısının logaritmik ölçekteki değeri.',
    detail: 'Yanıt oranı + görüntülenme skoru',
    tip: 'Yorumlara yanıt verin — her yanıt etkileşim skorunuzu artırır.',
  },
  {
    icon: Clock,
    label: 'Platform Geçmişi',
    weight: 10,
    color: '#8b5cf6',
    desc: 'İşletmenin platforma eklenme tarihi. 2 yıl tam puana karşılık gelir.',
    detail: 'Platforma eklenme tarihi',
    tip: 'Bu skor zamanla otomatik artar — yapabileceğiniz bir şey yok.',
  },
  {
    icon: Zap,
    label: 'Derinlik Bonusu',
    weight: 5,
    color: '#ec4899',
    desc: 'Detaylı yorum içerikleri, fotoğraflar ve medya zenginliği için ek puan.',
    detail: 'Yorum uzunluğu + fotoğraf sayısı',
    tip: 'İşletme galerinize fotoğraf ekleyin, detaylı yorum almaya çalışın.',
  },
]

const GRADES = [
  { grade: 'A+', range: '90–100', label: 'Olağanüstü güvenilir', color: '#34d399', desc: 'Platformun en güvenilir işletmeleri' },
  { grade: 'A',  range: '80–89',  label: 'Çok güvenilir',        color: '#6ee7b7', desc: 'Güçlü ve tutarlı performans' },
  { grade: 'B',  range: '70–79',  label: 'Güvenilir',            color: '#60a5fa', desc: 'Ortalamanın üzerinde' },
  { grade: 'C',  range: '60–69',  label: 'Ortalama',             color: '#fbbf24', desc: 'Gelişim alanları mevcut' },
  { grade: 'D',  range: '50–59',  label: 'Geliştirilmeli',       color: '#fb923c', desc: 'Ciddi eksiklikler var' },
  { grade: 'F',  range: '0–49',   label: 'Düşük güven',          color: '#f87171', desc: 'Acil aksiyon gerekli' },
]

export default function GuvenSkoru() {
  const [activeComp, setActiveComp] = useState(0)
  const [exampleScore] = useState({ grade: 'B', score: 74 })

  return (
    <AppLayout>
      <div className="pb-24">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden">
          {/* Arka plan efektleri */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="absolute top-20 right-0 w-48 h-48 bg-emerald-500/8 rounded-full blur-2xl" />
          </div>

          <div className="relative px-5 pt-10 pb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Shield size={15} className="text-white" />
              </div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Tecrübelerim</span>
            </div>

            <h1 className="text-3xl font-black text-white leading-tight mb-3">
              Güven Skoru
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
                Nedir ve Nasıl Çalışır?
              </span>
            </h1>

            <p className="text-sm text-white/50 leading-relaxed mb-6">
              Tek bir yıldız ortalaması yeterli değil. Güven Skoru, bir işletmenin gerçek güvenilirliğini 
              5 farklı boyutta ölçerek A+–F arası harf notuna dönüştürür.
            </p>

            {/* İstatistikler */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 432360, label: 'İşletme', suffix: '' },
                { value: 5, label: 'Bileşen', suffix: '' },
                { value: 1, label: 'milyon+ yorum', suffix: '' },
              ].map((s, i) => (
                <div key={i} className="rounded-2xl bg-white/[0.04] border border-white/[0.07] p-3 text-center">
                  <div className="text-lg font-black text-white">
                    {i === 2 ? '1M+' : <CountUp target={s.value} />}
                  </div>
                  <div className="text-[10px] text-white/35 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Formül Görseli ───────────────────────────────────────────── */}
        <div className="px-5 mb-6">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/15 p-5">
            <div className="text-[10px] font-bold text-indigo-400/60 uppercase tracking-widest mb-3">Hesaplama Formülü</div>
            <div className="space-y-2">
              {COMPONENTS.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-24 text-[11px] text-white/50 font-medium shrink-0">{c.label}</div>
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${c.weight}%`, background: c.color }} />
                  </div>
                  <div className="text-xs font-black shrink-0" style={{ color: c.color }}>%{c.weight}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/[0.06] text-[11px] text-white/30 text-center">
              Fake Review Shield ceza katsayısı × normalize edilmiş skor = <span className="text-white/60 font-bold">Final Güven Skoru</span>
            </div>
          </div>
        </div>

        {/* ── 5 Bileşen ────────────────────────────────────────────────── */}
        <div className="px-5 mb-6">
          <h2 className="text-base font-black text-white mb-3">5 Bileşen</h2>

          {/* Tab seçici */}
          <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
            {COMPONENTS.map((c, i) => (
              <button key={i} onClick={() => setActiveComp(i)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0"
                style={{
                  background: activeComp === i ? c.color + '22' : 'rgba(255,255,255,0.04)',
                  color: activeComp === i ? c.color : 'rgba(255,255,255,0.35)',
                  border: `1px solid ${activeComp === i ? c.color + '44' : 'rgba(255,255,255,0.06)'}`,
                }}>
                <c.icon size={11} />
                {c.label}
              </button>
            ))}
          </div>

          {/* Aktif bileşen detayı */}
          {(() => {
            const c = COMPONENTS[activeComp]
            return (
              <div className="rounded-2xl border p-5 transition-all"
                style={{ background: c.color + '0d', borderColor: c.color + '30' }}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <c.icon size={16} style={{ color: c.color }} />
                      <span className="font-black text-white text-sm">{c.label}</span>
                    </div>
                    <div className="text-[10px] font-medium" style={{ color: c.color }}>{c.detail}</div>
                  </div>
                  <div className="text-2xl font-black shrink-0" style={{ color: c.color }}>%{c.weight}</div>
                </div>
                <p className="text-sm text-white/60 leading-relaxed mb-4">{c.desc}</p>
                <div className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <TrendingUp size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-white/50 leading-relaxed">
                    <span className="text-emerald-400 font-semibold">Nasıl yükseltirsiniz? </span>
                    {c.tip}
                  </p>
                </div>
              </div>
            )
          })()}
        </div>

        {/* ── Harf Notu Tablosu ─────────────────────────────────────────── */}
        <div className="px-5 mb-6">
          <h2 className="text-base font-black text-white mb-3">Harf Notu Sistemi</h2>
          <div className="space-y-2">
            {GRADES.map((g) => (
              <div key={g.grade} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <GradeBadge grade={g.grade} score={parseInt(g.range.split('–')[0])} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{g.label}</span>
                    <span className="text-[10px] text-white/30">{g.range}</span>
                  </div>
                  <div className="text-[11px] text-white/35 mt-0.5">{g.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Fake Review Shield ────────────────────────────────────────── */}
        <div className="px-5 mb-6">
          <div className="rounded-2xl bg-gradient-to-br from-red-950/30 to-orange-950/20 border border-red-500/15 p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={15} className="text-red-400" />
              <h2 className="text-base font-black text-white">Fake Review Shield</h2>
            </div>
            <p className="text-sm text-white/50 leading-relaxed mb-4">
              Sahte veya manipüle edilmiş yorumları tespit eden ön süzgeç. Şüpheli durumlarda 
              işletme kapatılmaz — sadece güven skoru düşürülür.
            </p>
            <div className="space-y-2">
              {[
                { label: '4.9+ puan, 5\'ten az yorum', penalty: '×0.60', color: '#f87171' },
                { label: 'Son 7 günde 20+ yorum artışı', penalty: '×0.70', color: '#fb923c' },
                { label: 'Tüm yorumlar aynı puan', penalty: '×0.75', color: '#fbbf24' },
                { label: '8+ yorum, hepsi 5 yıldız', penalty: '×0.80', color: '#fbbf24' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                  <span className="text-xs text-white/50">{item.label}</span>
                  <span className="text-xs font-black" style={{ color: item.color }}>Skor {item.penalty}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-white/25 mt-3 text-center">
              Birden fazla kriter eşleşirse en düşük katsayı uygulanır
            </p>
          </div>
        </div>

        {/* ── Güncellik Trendi ──────────────────────────────────────────── */}
        <div className="px-5 mb-6">
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-5">
            <h2 className="text-base font-black text-white mb-3">Güncellik Trendi</h2>
            <p className="text-sm text-white/50 leading-relaxed mb-4">
              Son 90 günün performansını önceki 90 günle karşılaştırır. Skora dahil edilmez 
              ama işletme kartında gösterilir.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: TrendingUp,   label: 'Yükseliyor',  desc: 'Son 3 ayda iyileşme', color: '#34d399' },
                { icon: Minus,        label: 'Stabil',       desc: 'Değişim yok',          color: '#94a3b8' },
                { icon: TrendingDown, label: 'Düşüyor',      desc: 'Son 3 ayda gerileme',  color: '#f87171' },
              ].map((t, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
                  <t.icon size={18} className="mx-auto mb-1.5" style={{ color: t.color }} />
                  <div className="text-xs font-bold" style={{ color: t.color }}>{t.label}</div>
                  <div className="text-[10px] text-white/30 mt-0.5">{t.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <div className="px-5">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-500/15 to-purple-500/10 border border-indigo-500/20 p-5 text-center">
            <div className="text-2xl mb-2">⭐</div>
            <h3 className="font-black text-white mb-1">İşletmenizin Skorunu Görün</h3>
            <p className="text-xs text-white/40 mb-4">Sahiplik talebi oluşturun, detaylı analizi inceleyin</p>
            <div className="flex gap-2">
              <Link href="/isletme-ekle" className="flex-1 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-xs font-bold text-white/70 text-center hover:bg-white/[0.09] transition-all">
                İşletme Ekle
              </Link>
              <Link href="/sahip-paneli" className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white text-center transition-all"
                style={{ background: 'var(--primary)' }}>
                Sahip Paneli →
              </Link>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
