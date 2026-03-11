'use client'

import { useEffect, useRef, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { SearchBar } from '@/components/search/SearchBar'
import { ReviewCard } from '@/components/feed/ReviewCard'
import { BusinessCard } from '@/components/business/BusinessCard'
import { MuhtarLeaderboard } from '@/components/feed/MuhtarLeaderboard'
import { SkeletonReviewCard, SkeletonBusinessCard } from '@/components/ui/SkeletonCard'
import { MOCK_REVIEWS, MOCK_BUSINESSES, MOCK_MUHTARLAR } from '@/lib/mock-data'
import { MapPin, Sparkles, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const TABS = ['Tümü', 'Yakınımda', 'Muhtarlar', 'Trend']

// Scroll reveal hook
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

export default function HomePage() {
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Simulate loading
    const t = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(t)
  }, [])

  return (
    <AppLayout>
      <div className="px-4 pt-4">
        {/* Location bar — fade-down */}
        <div className={cn('flex items-center gap-2 mb-4 transition-all duration-500', mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2')}>
          <div className="flex items-center gap-1.5 text-sm text-white/60">
            <MapPin size={13} className="text-indigo-400" />
            <span className="font-medium">Kadıköy, İstanbul</span>
          </div>
          <span className="text-white/20">·</span>
          <span className="text-xs text-white/40">Son 24s'de 47 yeni deneyim</span>
        </div>

        {/* Search — fade-up delay */}
        <div className={cn('mb-5 transition-all duration-500 delay-75', mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3')}>
          <SearchBar />
        </div>

        {/* Tabs — fade-up */}
        <div className={cn('flex gap-1 mb-5 bg-surface-2 p-1 rounded-xl border border-white/[0.06] transition-all duration-500 delay-100', mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3')}>
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
          /* ── Skeleton state ── */
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
          /* ── Loaded content ── */
          <div className="animate-fade-in">
            {/* Muhtar Leaderboard */}
            <RevealSection>
              <MuhtarLeaderboard muhtarlar={MOCK_MUHTARLAR} />
            </RevealSection>

            {/* AI Önerisi */}
            <RevealSection delay={60}>
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-indigo-400 animate-float" />
                  <span className="text-sm font-bold text-white">AI Önerisi</span>
                  <span className="text-xs text-white/40">Kriterlerinize göre seçildi</span>
                </div>
                <BusinessCard business={MOCK_BUSINESSES[0]} showSemanticMatch />
              </div>
            </RevealSection>

            {/* Feed separator */}
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

            {/* Reviews Feed — staggered */}
            <div className="stagger-children">
              {MOCK_REVIEWS.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {/* More businesses */}
            <RevealSection delay={0}>
              <div className="mt-6 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-bold text-white">Bölgedeki İşletmeler</span>
                </div>
                <div className="stagger-children">
                  {MOCK_BUSINESSES.slice(1).map((b) => (
                    <BusinessCard key={b.id} business={b} />
                  ))}
                </div>
              </div>
            </RevealSection>

            {/* Load more */}
            <RevealSection>
              <button className="w-full py-3.5 rounded-2xl border border-white/[0.08] text-sm text-white/50 hover:bg-white/5 hover:text-white/70 transition-all font-medium mb-6 btn-press ripple">
                Daha Fazla Göster
              </button>
            </RevealSection>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
