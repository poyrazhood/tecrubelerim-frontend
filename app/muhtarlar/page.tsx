'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { Award, MapPin, MessageSquare, Users, TrendingUp, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_MUHTARLAR } from '@/lib/mock-data'
import Link from 'next/link'

const RANK_STYLES: Record<number, { gradient: string; medal: string; label: string }> = {
  1: { gradient: 'from-amber-400/20 to-yellow-600/10 border-amber-500/30', medal: '🥇', label: 'Altın Muhtar' },
  2: { gradient: 'from-slate-300/15 to-slate-400/10 border-slate-400/30', medal: '🥈', label: 'Gümüş Muhtar' },
  3: { gradient: 'from-amber-700/15 to-amber-800/10 border-amber-700/30', medal: '🥉', label: 'Bronz Muhtar' },
}

// Extended muhtarlar list
const ALL_MUHTARLAR = [
  ...MOCK_MUHTARLAR,
  {
    id: 'u4',
    name: 'Kemal Arslan',
    handle: '@kemalarslan',
    neighborhood: 'Üsküdar',
    expertise: ['Restoran', 'Balık', 'Deniz Ürünleri'],
    reviewCount: 78,
    helpfulCount: 934,
    followers: 312,
    rank: 4,
  },
  {
    id: 'u5',
    name: 'Selin Çelik',
    handle: '@selincelik',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
    neighborhood: 'Beşiktaş',
    expertise: ['Kafe', 'Kitabevi', 'Müzik'],
    reviewCount: 112,
    helpfulCount: 867,
    followers: 289,
    rank: 5,
  },
  {
    id: 'u6',
    name: 'Tarık Yıldırım',
    handle: '@tarikyildirim',
    neighborhood: 'Şişli',
    expertise: ['Elektronik', 'Teknoloji', 'Tamir'],
    reviewCount: 56,
    helpfulCount: 723,
    followers: 198,
    rank: 6,
  },
]

export default function MuhtarlarPage() {
  return (
    <AppLayout>
      <div className="px-4 pt-4 pb-6">
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <Award size={18} className="text-amber-400" />
            <h1 className="font-black text-xl text-white">Mahalle Muhtarları</h1>
          </div>
          <p className="text-sm text-white/40 leading-relaxed">
            En güvenilir ve faydalı yorumcular. Muhtarlar, yorumlarıyla mahallerinin sesini taşıyor.
          </p>
        </div>

        {/* Top 3 podium */}
        <div className="mb-6">
          <div className="text-xs font-bold text-white/30 uppercase tracking-wider mb-3">Bu Ayın Zirvesi</div>
          <div className="grid grid-cols-3 gap-2">
            {ALL_MUHTARLAR.slice(0, 3).map((muhtar) => {
              const style = RANK_STYLES[muhtar.rank as 1|2|3]
              const handle = muhtar.handle?.replace('@', '') || muhtar.id
              return (
                <Link href={`/kullanici/${handle}`} key={muhtar.id}>
                  <div className={cn(
                    'rounded-2xl border p-3 bg-gradient-to-b text-center cursor-pointer hover:scale-[1.02] transition-transform',
                    style.gradient
                  )}>
                    <div className="text-2xl mb-1">{style.medal}</div>
                    {muhtar.image ? (
                      <img
                        src={muhtar.image}
                        alt={muhtar.name}
                        className="w-12 h-12 rounded-full object-cover mx-auto mb-2 border-2 border-amber-500/30"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-500/30 flex items-center justify-center text-sm font-black text-indigo-300 mx-auto mb-2 border-2 border-white/10">
                        {muhtar.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="font-bold text-xs text-white leading-tight mb-0.5 truncate">{muhtar.name}</div>
                    <div className="text-[10px] text-white/40 mb-2 truncate">{muhtar.neighborhood}</div>
                    <div className="text-xs font-black text-emerald-400">
                      {muhtar.helpfulCount.toLocaleString('tr-TR')}
                    </div>
                    <div className="text-[9px] text-white/30">faydalı oy</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Full list */}
        <div>
          <div className="text-xs font-bold text-white/30 uppercase tracking-wider mb-3">Tüm Muhtarlar</div>
          <div className="space-y-2">
            {ALL_MUHTARLAR.map((muhtar) => {
              const handle = muhtar.handle?.replace('@', '') || muhtar.id
              return (
                <Link href={`/kullanici/${handle}`} key={muhtar.id}>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-1 border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all cursor-pointer group">
                    {/* Rank number */}
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0',
                      muhtar.rank <= 3
                        ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black'
                        : 'bg-white/10 text-white/50'
                    )}>
                      {muhtar.rank}
                    </div>

                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {muhtar.image ? (
                        <img
                          src={muhtar.image}
                          alt={muhtar.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-amber-500/20"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-300 border-2 border-amber-500/20">
                          {muhtar.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-white truncate">{muhtar.name}</div>
                      <div className="flex items-center gap-1.5 text-xs text-white/40 mt-0.5">
                        <MapPin size={10} />
                        <span>{muhtar.neighborhood}</span>
                        <span className="text-white/20">·</span>
                        <span className="truncate">{muhtar.expertise[0]}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
                      <div className="font-bold text-sm text-emerald-400">
                        {muhtar.helpfulCount.toLocaleString('tr-TR')}
                      </div>
                      <div className="text-[10px] text-white/30 flex items-center gap-1">
                        <MessageSquare size={9} />
                        {muhtar.reviewCount} yorum
                      </div>
                    </div>

                    <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Info card */}
        <div className="mt-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🏆</div>
            <div>
              <div className="font-bold text-sm text-white mb-1">Muhtar Nasıl Olunur?</div>
              <p className="text-xs text-white/50 leading-relaxed">
                En az 50 doğrulanmış yorum yap, topluluğun faydalı bulduğu 500+ oy topla ve mahallenin güvenilir sesi ol. Her ay sıralama güncellenir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
