import { AppLayout } from '@/components/layout/AppLayout'
import { SearchBar } from '@/components/search/SearchBar'
import { ReviewCard } from '@/components/feed/ReviewCard'
import { BusinessCard } from '@/components/business/BusinessCard'
import { MuhtarLeaderboard } from '@/components/feed/MuhtarLeaderboard'
import { MOCK_REVIEWS, MOCK_BUSINESSES, MOCK_MUHTARLAR } from '@/lib/mock-data'
import { MapPin, Sparkles, TrendingUp } from 'lucide-react'

export default function HomePage() {
  return (
    <AppLayout>
      <div className="px-4 pt-4">
        {/* Location bar */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 text-sm text-white/60">
            <MapPin size={13} className="text-indigo-400" />
            <span className="font-medium">Kadıköy, İstanbul</span>
          </div>
          <span className="text-white/20">·</span>
          <span className="text-xs text-white/40">Son 24s'de 47 yeni deneyim</span>
        </div>

        {/* Search */}
        <div className="mb-5">
          <SearchBar />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-surface-2 p-1 rounded-xl border border-white/[0.06]">
          {['Tümü', 'Yakınımda', 'Muhtarlar', 'Trend'].map((tab, i) => (
            <button
              key={tab}
              className={`flex-1 text-xs font-semibold py-2 px-3 rounded-lg transition-all ${
                i === 0
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Muhtar Leaderboard */}
        <MuhtarLeaderboard muhtarlar={MOCK_MUHTARLAR} />

        {/* Öne Çıkan İşletme */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-sm font-bold text-white">AI Önerisi</span>
            <span className="text-xs text-white/40">Kriterlerinize göre seçildi</span>
          </div>
          <BusinessCard business={MOCK_BUSINESSES[0]} showSemanticMatch />
        </div>

        {/* Feed separator */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <TrendingUp size={12} />
            <span>Son Deneyimler</span>
          </div>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        {/* Reviews Feed */}
        <div>
          {MOCK_REVIEWS.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {/* More businesses */}
        <div className="mt-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-bold text-white">Bölgedeki İşletmeler</span>
          </div>
          {MOCK_BUSINESSES.slice(1).map((b) => (
            <BusinessCard key={b.id} business={b} />
          ))}
        </div>

        {/* Load more */}
        <button className="w-full py-3.5 rounded-2xl border border-white/[0.08] text-sm text-white/50 hover:bg-white/5 hover:text-white/70 transition-all font-medium mb-6">
          Daha Fazla Göster
        </button>
      </div>
    </AppLayout>
  )
}
