'use client'

import React, { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import {
  ChevronLeft, MapPin, Award, Star, TrendingUp,
  MessageSquare, Users, Shield, Heart, BadgeCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_REVIEWS, MOCK_MUHTARLAR } from '@/lib/mock-data'
import { ReviewCard } from '@/components/feed/ReviewCard'
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Extended mock users from mock-data muhtarlar + extras
const ALL_USERS = [
  {
    id: 'u1',
    name: 'Ayşe Yılmaz',
    handle: 'ayseyilmaz',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    bio: 'Kadıköy Moda muhtarı ☕️ Kahve tutkunu · Fotoğraf sever',
    neighborhood: 'Moda',
    city: 'Kadıköy, İstanbul',
    joinDate: 'Mart 2023',
    isMuhtar: true,
    expertise: ['Kafe', 'Restoran', 'Kültür'],
    stats: { reviews: 156, helpful: 2341, followers: 892, following: 234, trustContribution: 94 },
    badges: [
      { id: 'muhtar', label: 'Mahalle Muhtarı', icon: '🏆', color: 'amber' },
      { id: 'verified', label: 'Doğrulanmış Üye', icon: '✓', color: 'emerald' },
      { id: 'top-reviewer', label: 'Top Yorumcu', icon: '⭐', color: 'indigo' },
    ],
    rank: 2,
  },
  {
    id: 'u2',
    name: 'Can Yıldız',
    handle: 'canyildiz',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    bio: 'Bostancı muhtarı 🔧 Oto servis uzmanı · 20 yıllık sürücü',
    neighborhood: 'Bostancı',
    city: 'Kadıköy, İstanbul',
    joinDate: 'Ocak 2023',
    isMuhtar: true,
    expertise: ['Oto Servis', 'Lastik', 'Yedek Parça'],
    stats: { reviews: 89, helpful: 1567, followers: 445, following: 123, trustContribution: 96 },
    badges: [
      { id: 'muhtar', label: 'Mahalle Muhtarı', icon: '🏆', color: 'amber' },
      { id: 'expert', label: 'Oto Uzmanı', icon: '🔧', color: 'blue' },
      { id: 'verified', label: 'Doğrulanmış Üye', icon: '✓', color: 'emerald' },
    ],
    rank: 1,
  },
  {
    id: 'u3',
    name: 'Fatma Öğretmen',
    handle: 'fatmaogretmen',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
    bio: 'Kadıköy muhtarı 📚 Eğitim uzmanı · Matematik & fen bilimleri',
    neighborhood: 'Kadıköy',
    city: 'Kadıköy, İstanbul',
    joinDate: 'Haziran 2023',
    isMuhtar: true,
    expertise: ['Eğitim', 'Kurs', 'Özel Ders'],
    stats: { reviews: 134, helpful: 1234, followers: 678, following: 189, trustContribution: 91 },
    badges: [
      { id: 'muhtar', label: 'Mahalle Muhtarı', icon: '🏆', color: 'amber' },
      { id: 'education', label: 'Eğitim Uzmanı', icon: '📚', color: 'purple' },
    ],
    rank: 3,
  },
  {
    id: 'u4',
    name: 'Mehmet Kaya',
    handle: 'mehmetkaya42',
    neighborhood: 'Üsküdar',
    city: 'İstanbul',
    joinDate: 'Şubat 2024',
    isMuhtar: false,
    expertise: ['Restoran', 'Fast Food'],
    stats: { reviews: 23, helpful: 89, followers: 45, following: 78, trustContribution: 65 },
    badges: [
      { id: 'verified', label: 'Doğrulanmış Üye', icon: '✓', color: 'emerald' },
    ],
    rank: null,
    bio: 'Yemek tutkunu 🍕',
  },
  {
    id: 'u5',
    name: 'Zeynep Demir',
    handle: 'zeynepdemir',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    neighborhood: 'Beşiktaş',
    city: 'İstanbul',
    joinDate: 'Eylül 2023',
    isMuhtar: false,
    expertise: ['Kafe', 'Kitabevi'],
    stats: { reviews: 67, helpful: 312, followers: 156, following: 234, trustContribution: 78 },
    badges: [
      { id: 'verified', label: 'Doğrulanmış Üye', icon: '✓', color: 'emerald' },
    ],
    rank: null,
    bio: 'Kafe gezer ☕ Kitap okur 📖',
  },
]

const BADGE_COLORS: Record<string, string> = {
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  indigo: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  pink: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
}

function StatBox({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex-1 flex flex-col items-center py-3">
      <span className="font-black text-lg text-white">
        {typeof value === 'number' ? value.toLocaleString('tr-TR') : value}
      </span>
      <span className="text-[10px] text-white/40 mt-0.5 font-medium">{label}</span>
    </div>
  )
}

export default function UserProfilePage() {
  const params = useParams()
  const handle = params.handle as string
  const [tab, setTab] = useState(0)
  const [following, setFollowing] = useState(false)

  const user = ALL_USERS.find(u => u.handle === handle)

  if (!user) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-4xl">🔍</div>
          <p className="text-white/50 text-sm">Kullanıcı bulunamadı</p>
          <Link href="/" className="text-indigo-400 text-sm font-medium">Ana sayfaya dön</Link>
        </div>
      </AppLayout>
    )
  }

  const userReviews = MOCK_REVIEWS.filter(r => r.userName === user.name)
  const TABS = ['Yorumlar', 'İstatistikler']

  return (
    <AppLayout hideBottomNav>
      <div>
        {/* Back header */}
        <div className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-white/[0.06] px-4 py-3 flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-all text-white/70">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <div className="font-bold text-sm text-white">{user.name}</div>
            <div className="text-xs text-white/40">@{user.handle}</div>
          </div>
        </div>

        {/* Cover + Avatar */}
        <div className="relative h-28 bg-gradient-to-br from-indigo-900/50 via-purple-900/30 to-surface-1">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #6366f1 0%, transparent 60%)' }}
          />
        </div>

        <div className="px-4 pb-4">
          {/* Avatar row */}
          <div className="flex items-end justify-between -mt-10 mb-3">
            <div className="relative">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-surface"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-black text-white border-4 border-surface">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              {user.isMuhtar && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-sm border-2 border-surface">
                  🏆
                </div>
              )}
            </div>

            <button
              onClick={() => setFollowing(!following)}
              className={cn(
                'px-5 py-2 rounded-xl text-sm font-bold transition-all',
                following
                  ? 'bg-white/10 text-white/60 border border-white/20'
                  : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
              )}
            >
              {following ? 'Takip Ediliyor' : 'Takip Et'}
            </button>
          </div>

          {/* Name + bio */}
          <div className="mb-3">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="font-black text-lg text-white">{user.name}</h1>
              {user.isMuhtar && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  {user.neighborhood} Muhtarı
                </span>
              )}
            </div>
            <div className="text-sm text-white/40 mb-2">@{user.handle}</div>
            {user.bio && <p className="text-sm text-white/70 leading-relaxed">{user.bio}</p>}
          </div>

          {/* Location + join */}
          <div className="flex items-center gap-3 mb-3 text-xs text-white/40">
            <span className="flex items-center gap-1">
              <MapPin size={11} className="text-indigo-400" />
              {user.city}
            </span>
            <span className="flex items-center gap-1">
              <Star size={11} className="text-amber-400" />
              {user.joinDate}'den beri üye
            </span>
          </div>

          {/* Badges */}
          {user.badges && user.badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {user.badges.map(badge => (
                <span
                  key={badge.id}
                  className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1',
                    BADGE_COLORS[badge.color] || BADGE_COLORS.indigo
                  )}
                >
                  <span>{badge.icon}</span>
                  {badge.label}
                </span>
              ))}
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center divide-x divide-white/[0.06] rounded-2xl border border-white/[0.06] bg-surface-2 mb-5 overflow-hidden">
            <StatBox label="Yorum" value={user.stats.reviews} />
            <StatBox label="Faydalı" value={user.stats.helpful} />
            <StatBox label="Takipçi" value={user.stats.followers} />
            <StatBox label="Takip" value={user.stats.following} />
          </div>

          {/* Expertise */}
          <div className="mb-5">
            <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Uzmanlık Alanları</div>
            <div className="flex flex-wrap gap-1.5">
              {user.expertise.map(e => (
                <span key={e} className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                  {e}
                </span>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-surface-2 p-1 rounded-xl border border-white/[0.06]">
            {TABS.map((t, i) => (
              <button
                key={t}
                onClick={() => setTab(i)}
                className={cn(
                  'flex-1 text-xs font-semibold py-2 px-3 rounded-lg transition-all',
                  tab === i
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-white/40 hover:text-white/70'
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === 0 && (
            <div>
              {userReviews.length > 0 ? (
                userReviews.map(r => <ReviewCard key={r.id} review={r} />)
              ) : (
                <div className="text-center py-12 text-white/30 text-sm">
                  <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
                  Henüz yorum yok
                </div>
              )}
            </div>
          )}

          {tab === 1 && (
            <div className="space-y-3">
              {/* Trust contribution */}
              <div className="rounded-2xl border border-white/[0.06] bg-surface-2 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={14} className="text-emerald-400" />
                  <span className="text-sm font-bold text-white">TrustScore Katkısı</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                      <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"/>
                      <circle
                        cx="32" cy="32" r="26" fill="none"
                        stroke="#10b981" strokeWidth="6"
                        strokeDasharray={`${(user.stats.trustContribution / 100) * 163} 163`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-black text-emerald-400">{user.stats.trustContribution}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white mb-1">
                      {user.stats.trustContribution >= 90 ? 'Çok Yüksek Güvenilirlik' :
                       user.stats.trustContribution >= 80 ? 'Yüksek Güvenilirlik' : 'Orta Güvenilirlik'}
                    </div>
                    <div className="text-xs text-white/40">
                      Yorumların topluluk güvenilirliğine katkısı
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity */}
              <div className="rounded-2xl border border-white/[0.06] bg-surface-2 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={14} className="text-indigo-400" />
                  <span className="text-sm font-bold text-white">Aktivite</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: 'Toplam Yorum', value: user.stats.reviews, icon: '📝' },
                    { label: 'Faydalı Bulunan', value: user.stats.helpful, icon: '👍' },
                    { label: 'Toplam Takipçi', value: user.stats.followers, icon: '👥' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span className="text-white/50 flex items-center gap-2">
                        <span>{item.icon}</span> {item.label}
                      </span>
                      <span className="font-bold text-white">{item.value.toLocaleString('tr-TR')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
