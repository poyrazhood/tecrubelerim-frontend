'use client'

import { getTrustColor, getTrustBg } from '@/lib/utils'
import type { TrustScore } from '@/types'
import { useState } from 'react'

interface TrustScoreRingProps {
  score: TrustScore
  size?: 'sm' | 'md' | 'lg'
  showBreakdown?: boolean
}

const SIZES = {
  sm: { outer: 52, inner: 38, font: 16, label: 11 },
  md: { outer: 72, inner: 54, font: 22, label: 12 },
  lg: { outer: 100, inner: 76, font: 30, label: 13 },
}

export function TrustScoreRing({ score, size = 'md', showBreakdown = true }: TrustScoreRingProps) {
  const [open, setOpen] = useState(false)
  const color = getTrustColor(score.grade)
  const bg = getTrustBg(score.grade)
  const s = SIZES[size]
  const pct = (score.score / 100) * 360

  const breakdownItems = [
    { label: 'Yorum Derinliği', value: score.breakdown.reviewDepth, color: '#818CF8' },
    { label: 'Güncellik Trendi', value: score.breakdown.recencyTrend, color: '#38BDF8' },
    { label: 'Doğrulanmış Oran', value: score.breakdown.verifiedRatio, color: '#34D399' },
    { label: 'Etkileşim', value: score.breakdown.engagement, color: '#FBBF24' },
  ]

  return (
    <div className="relative inline-flex flex-col items-center gap-1">
      <button
        onClick={() => showBreakdown && setOpen(!open)}
        className="relative flex items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95"
        style={{
          width: s.outer,
          height: s.outer,
          background: `conic-gradient(${color} ${pct}deg, #26262C ${pct}deg)`,
          cursor: showBreakdown ? 'pointer' : 'default',
        }}
      >
        <div
          className="flex flex-col items-center justify-center rounded-full"
          style={{ width: s.inner, height: s.inner, background: '#111114' }}
        >
          <span style={{ fontSize: s.font, fontWeight: 800, color, lineHeight: 1 }}>
            {score.grade}
          </span>
        </div>

        {score.trend === 'up' && (
          <span className="absolute -top-1 -right-1 text-[10px] bg-emerald-500/20 text-emerald-400 rounded-full px-1 font-bold border border-emerald-500/30">
            ↑
          </span>
        )}
      </button>

      <span style={{ fontSize: s.label, fontWeight: 700, color }}>{score.score}</span>

      {/* Breakdown popup */}
      {open && showBreakdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 z-50 w-64 rounded-2xl border border-white/10 p-4 shadow-2xl"
            style={{ background: '#18181C' }}>
            <div className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3">
              TrustScore Kırılımı
            </div>
            {breakdownItems.map((item) => (
              <div key={item.label} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/60">{item.label}</span>
                  <span style={{ color: item.color }} className="font-bold">%{item.value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${item.value}%`, background: item.color }}
                  />
                </div>
              </div>
            ))}
            <div className="mt-3 pt-3 border-t border-white/5 text-[10px] text-white/30 text-center">
              Son güncelleme: 2 saat önce
            </div>
          </div>
        </>
      )}
    </div>
  )
}
