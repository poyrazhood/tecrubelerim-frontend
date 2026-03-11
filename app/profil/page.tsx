'use client'

import React, { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import {
  Settings, Star, TrendingUp, Camera, Edit3, ChevronRight,
  Shield, Bookmark, MessageSquare, Bell, LogOut, Check,
  MapPin, Award, Heart, User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_REVIEWS, MOCK_BUSINESSES } from '@/lib/mock-data'
import { ReviewCard } from '@/components/feed/ReviewCard'
import { BusinessCard } from '@/components/business/BusinessCard'
import Link from 'next/link'

const USER = {
  name: 'Ayşe Yılmaz',
  handle: '@ayseyilmaz',
  image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
  bio: 'Kadıköy Moda muhtarı ☕️ Kahve tutkunu · Fotoğraf sever',
  neighborhood: 'Moda',
  city: 'Kadıköy, İstanbul',
  joinDate: 'Mart 2023',
  isMuhtar: true,
  expertise: ['Kafe', 'Restoran', 'Kültür'],
  stats: {
    reviews: 156,
    helpful: 2341,
    followers: 892,
    following: 234,
    trustContribution: 94,
  },
  badges: [
    { id: 'muhtar', label: 'Mahalle Muhtarı', icon: '🏆', color: 'amber' },
    { id: 'verified', label: 'Doğrulanmış Üye', icon: '✓', color: 'emerald' },
    { id: 'top-reviewer', label: 'Top Yorumcu', icon: '⭐', color: 'indigo' },
    { id: 'gonul-alma', label: 'Gönül Alan', icon: '💝', color: 'pink' },
  ],
}

const TABS = ['Yorumlar', 'Kaydedilenler', 'İstatistikler', 'Ayarlar']

function StatCard({ label, value, sub, color = 'white' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="flex-1 p-3 rounded-2xl bg-surface-2 border border-white/[0.06] text-center">
      <div className={cn('text-xl font-black', color === 'emerald' ? 'text-emerald-400' : color === 'indigo' ? 'text-indigo-400' : 'text-white')}>
        {typeof value === 'number' ? value.toLocaleString('tr-TR') : value}
      </div>
      <div className="text-[10px] text-white/40 mt-0.5 font-medium">{label}</div>
      {sub && <div className="text-[9px] text-white/25 mt-0.5">{sub}</div>}
    </div>
  )
}

function ActivityBar({ label, value, max = 100, color }: { label: string; value: number; max?: number; color: string }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-white/60">{label}</span>
        <span className="font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${(value / max) * 100}%`, background: color }}
        />
      </div>
    </div>
  )
}

function SettingsItem({ label, sub, icon: Icon, danger = false, href }: {
  label: string; sub?: string; icon: React.ElementType; danger?: boolean; href?: string
}) {
  const content = (
    <div className={cn(
      'flex items-center gap-3 p-4 rounded-xl border transition-all',
      danger
        ? 'bg-red-500/[0.05] border-red-500/10 hover:bg-red-500/10'
        : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]'
    )}>
      <div className={cn(
        'w-9 h-9 rounded-xl flex items-center justify-center',
        danger ? 'bg-red-500/15 text-red-400' : 'bg-white/[0.06] text-white/50'
      )}>
        <Icon size={15} />
      </div>
      <div className="flex-1">
        <div className={cn('text-sm font-medium', danger ? 'text-red-400' : 'text-white')}>{label}</div>
        {sub && <div className="text-xs text-white/35 mt-0.5">{sub}</div>}
      </div>
      <ChevronRight size={14} className="text-white/20" />
    </div>
  )
  return href ? <Link href={href}>{content}</Link> : <button className="w-full text-left">{content}</button>
}

export default function ProfilPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [editMode, setEditMode] = useState(false)
  const [bio, setBio] = useState(USER.bio)

  const userReviews = MOCK_REVIEWS.filter((r) => r.userHandle === USER.handle)
  const savedBusinesses = MOCK_BUSINESSES.slice(0, 2)

  return (
    <AppLayout>
      <div className="pb-4">
        {/* Cover + Avatar */}
        <div className="relative">
          {/* Cover gradient */}
          <div className="h-32 bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-surface-1 relative overflow-hidden">
            <div className="absolute inset-0 opacity-30"
              style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(99,102,241,0.4) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(168,85,247,0.3) 0%, transparent 50%)' }}
            />
          </div>

          {/* Settings button */}
          <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors">
            <Settings size={15} />
          </button>

          {/* Avatar */}
          <div className="absolute -bottom-12 left-4">
            <div className="relative">
              <img
                src={USER.image}
                alt={USER.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-surface shadow-2xl"
              />
              {USER.isMuhtar && (
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-sm font-black text-black border-2 border-surface">
                  M
                </div>
              )}
              <button className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center border-2 border-surface hover:bg-indigo-600 transition-colors">
                <Camera size={12} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Profile info */}
        <div className="pt-16 px-4 pb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-xl font-black text-white">{USER.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-white/40">{USER.handle}</span>
                {USER.isMuhtar && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    {USER.neighborhood} Muhtarı
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.09] text-xs font-medium text-white/60 hover:bg-white/[0.1] transition-all"
            >
              <Edit3 size={12} />
              Düzenle
            </button>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-white/40 mb-3">
            <MapPin size={11} className="text-indigo-400" />
            <span>{USER.city}</span>
            <span className="text-white/20">·</span>
            <span>Üye: {USER.joinDate}</span>
          </div>

          {/* Bio */}
          {editMode ? (
            <div className="mb-3">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full bg-surface-2 border border-indigo-500/40 rounded-xl p-3 text-sm text-white outline-none resize-none"
              />
              <button
                onClick={() => setEditMode(false)}
                className="mt-2 px-4 py-1.5 rounded-lg bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 transition-colors"
              >
                Kaydet
              </button>
            </div>
          ) : (
            <p className="text-sm text-white/60 leading-relaxed mb-3">{bio}</p>
          )}

          {/* Expertise tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {USER.expertise.map((e) => (
              <span key={e} className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300/80 border border-indigo-500/20">
                {e}
              </span>
            ))}
          </div>

          {/* Badges */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 -mx-1 px-1">
            {USER.badges.map((badge) => {
              const colorMap: Record<string, string> = {
                amber: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
                emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
                indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
                pink: 'bg-pink-500/10 text-pink-400 border-pink-500/25',
              }
              return (
                <div key={badge.id} className={cn('flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold', colorMap[badge.color])}>
                  <span>{badge.icon}</span>
                  <span>{badge.label}</span>
                </div>
              )
            })}
          </div>

          {/* Stats */}
          <div className="flex gap-2 mb-5">
            <StatCard label="Yorum" value={USER.stats.reviews} color="indigo" />
            <StatCard label="Faydalı" value={USER.stats.helpful} color="emerald" />
            <StatCard label="Takipçi" value={USER.stats.followers} />
            <StatCard label="Takip" value={USER.stats.following} />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-surface-2 p-1 rounded-xl border border-white/[0.06] mb-4">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={cn(
                  'flex-1 text-xs font-semibold py-2 rounded-lg transition-all',
                  activeTab === i
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-white/40 hover:text-white/70'
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 0 && (
            <div>
              {userReviews.length > 0 ? (
                userReviews.map((r) => <ReviewCard key={r.id} review={r} />)
              ) : (
                <div className="text-center py-12">
                  <MessageSquare size={32} className="mx-auto mb-3 text-white/20" />
                  <div className="text-white/40 text-sm mb-1">Henüz yorum yok</div>
                  <Link href="/yorum-yaz" className="text-indigo-400 text-sm font-medium hover:text-indigo-300">
                    İlk yorumunu yaz →
                  </Link>
                </div>
              )}

              {/* Show demo reviews */}
              {MOCK_REVIEWS.slice(0, 2).map((r) => (
                <ReviewCard key={r.id + '-demo'} review={r} />
              ))}
            </div>
          )}

          {activeTab === 1 && (
            <div>
              {savedBusinesses.map((b) => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </div>
          )}

          {activeTab === 2 && (
            <div className="space-y-4">
              {/* Trust contribution */}
              <div className="rounded-2xl border border-white/[0.07] bg-surface-2 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={15} className="text-emerald-400" />
                  <span className="text-sm font-bold text-white">TrustScore Katkısı</span>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-emerald-400"
                    style={{ background: `conic-gradient(#22C55E ${USER.stats.trustContribution * 3.6}deg, #1F1F24 ${USER.stats.trustContribution * 3.6}deg)` }}>
                    <div className="w-14 h-14 rounded-full bg-surface-2 flex items-center justify-center">
                      <span className="text-lg font-black text-emerald-400">{USER.stats.trustContribution}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white mb-1">Güvenilirlik Skoru</div>
                    <div className="text-xs text-white/40 leading-relaxed">
                      Yorumlarınız platform güvenilirliğine %{USER.stats.trustContribution} oranında katkı sağlıyor
                    </div>
                  </div>
                </div>

                <ActivityBar label="Yorum Derinliği" value={89} color="#818CF8" />
                <ActivityBar label="Fotoğraf Eklenme Oranı" value={72} color="#34D399" />
                <ActivityBar label="Faydalı Bulunma Oranı" value={94} color="#FBBF24" />
                <ActivityBar label="Yanıt Hızı" value={81} color="#F472B6" />
              </div>

              {/* Monthly activity */}
              <div className="rounded-2xl border border-white/[0.07] bg-surface-2 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={15} className="text-indigo-400" />
                  <span className="text-sm font-bold text-white">Aylık Aktivite</span>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 28 }).map((_, i) => {
                    const intensity = Math.random()
                    return (
                      <div
                        key={i}
                        className="aspect-square rounded"
                        style={{
                          background: intensity > 0.7 ? 'rgba(99,102,241,0.8)' :
                            intensity > 0.4 ? 'rgba(99,102,241,0.4)' :
                              intensity > 0.2 ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)'
                        }}
                      />
                    )
                  })}
                </div>
                <div className="flex items-center justify-end gap-2 mt-2">
                  <span className="text-[10px] text-white/30">Az</span>
                  {['rgba(99,102,241,0.2)', 'rgba(99,102,241,0.4)', 'rgba(99,102,241,0.8)'].map((c) => (
                    <div key={c} className="w-3 h-3 rounded-sm" style={{ background: c }} />
                  ))}
                  <span className="text-[10px] text-white/30">Çok</span>
                </div>
              </div>

              {/* Leaderboard rank */}
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-xl font-black text-black">
                    2
                  </div>
                  <div>
                    <div className="text-sm font-bold text-amber-400">Mahalle Sıralaması</div>
                    <div className="text-xs text-white/50 mt-0.5">Kadıköy'de 2. en aktif muhtar</div>
                  </div>
                  <Award size={20} className="ml-auto text-amber-400/60" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 3 && (
            <div className="space-y-2">
              <SettingsItem icon={User} label="Hesap Bilgileri" sub="Ad, telefon, şifre" href="/profil/hesap" />
              <SettingsItem icon={Bell} label="Bildirimler" sub="Push, SMS, e-posta bildirimleri" href="/profil/bildirimler" />
              <SettingsItem icon={Shield} label="Gizlilik" sub="Profil görünürlüğü, veri" href="/profil/gizlilik" />
              <SettingsItem icon={Bookmark} label="Kaydedilen Yerler" sub={`${savedBusinesses.length} yer kaydedildi`} href="/profil/kaydedilenler" />
              <SettingsItem icon={Award} label="Muhtar Başvurusu" sub="Mahallenizin güvenilir yorumcusu olun" />

              <div className="pt-2">
                <SettingsItem icon={LogOut} label="Çıkış Yap" danger href="/giris" />
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
