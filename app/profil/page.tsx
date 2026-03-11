'use client'

import React, { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import {
  Settings, TrendingUp, Camera, Edit3, ChevronRight,
  Shield, Bookmark, MessageSquare, Bell, LogOut,
  MapPin, Award, User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_REVIEWS, MOCK_BUSINESSES } from '@/lib/mock-data'
import { ReviewCard } from '@/components/feed/ReviewCard'
import { BusinessCard } from '@/components/business/BusinessCard'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'

const TABS = ['Yorumlar', 'Kaydedilenler', 'İstatistikler', 'Ayarlar']

// ─── Alt Bileşenler ───────────────────────────────────────────────────────────

function StatCard({ label, value, color = 'white' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex-1 p-3 rounded-2xl bg-surface-2 border border-white/[0.06] text-center">
      <div className={cn(
        'text-xl font-black',
        color === 'emerald' ? 'text-emerald-400' :
        color === 'indigo'  ? 'text-indigo-400'  : 'text-white'
      )}>
        {typeof value === 'number' ? value.toLocaleString('tr-TR') : value}
      </div>
      <div className="text-[10px] text-white/40 mt-0.5 font-medium">{label}</div>
    </div>
  )
}

function ActivityBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-white/60">{label}</span>
        <span className="font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  )
}

function SettingsItem({ label, sub, icon: Icon, danger = false, href, onClick }: {
  label: string; sub?: string; icon: React.ElementType
  danger?: boolean; href?: string; onClick?: () => void
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
  if (href) return <Link href={href}>{content}</Link>
  return <button className="w-full text-left" onClick={onClick}>{content}</button>
}

// ─── Yükleniyor Skeleton ──────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="animate-pulse pb-4">
      <div className="h-32 bg-surface-2" />
      <div className="pt-16 px-4 space-y-3">
        <div className="h-6 w-40 bg-white/[0.06] rounded-lg" />
        <div className="h-4 w-28 bg-white/[0.04] rounded-lg" />
        <div className="h-4 w-64 bg-white/[0.04] rounded-lg" />
        <div className="flex gap-2 mt-4">
          {[1,2,3,4].map(i => <div key={i} className="flex-1 h-16 bg-white/[0.04] rounded-2xl" />)}
        </div>
      </div>
    </div>
  )
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────

export default function ProfilPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(0)
  const [editMode, setEditMode] = useState(false)
  const [bio, setBio] = useState('')

  const savedBusinesses = MOCK_BUSINESSES.slice(0, 2)

  // Oturum açılmamışsa giriş sayfasına yönlendir
  if (!loading && !user) {
    router.push('/giris')
    return null
  }

  if (loading || !user) return (
    <AppLayout>
      <ProfileSkeleton />
    </AppLayout>
  )

  const handleLogout = () => {
    logout()
    router.push('/giris')
  }

  // Kullanıcı baş harfleri (avatar yoksa)
  const initials = (user.fullName || user.username)
    .split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  // Badge seviyesine göre renk
  const badgeColor = {
    NONE:     null,
    BRONZE:   { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/25', label: 'Bronz' },
    SILVER:   { bg: 'bg-slate-400/10',  text: 'text-slate-300',  border: 'border-slate-400/25',  label: 'Gümüş' },
    GOLD:     { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/25',  label: 'Altın' },
    PLATINUM: { bg: 'bg-cyan-400/10',   text: 'text-cyan-300',   border: 'border-cyan-400/25',   label: 'Platin' },
  }[user.badgeLevel] || null

  const trustLevelLabel = {
    NEWCOMER:      { label: 'Yeni Üye',       color: 'text-white/50' },
    DEVELOPING:    { label: 'Gelişiyor',       color: 'text-blue-400' },
    TRUSTED:       { label: 'Güvenilir',       color: 'text-emerald-400' },
    HIGHLY_TRUSTED:{ label: 'Çok Güvenilir',  color: 'text-indigo-400' },
    VERIFIED:      { label: 'Doğrulanmış',     color: 'text-purple-400' },
  }[user.trustLevel] || { label: user.trustLevel, color: 'text-white/50' }

  const joinDate = new Date(user.createdAt).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })

  return (
    <AppLayout>
      <div className="pb-4">
        {/* Cover + Avatar */}
        <div className="relative">
          <div className="h-32 bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-surface-1 relative overflow-hidden">
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(99,102,241,0.4) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(168,85,247,0.3) 0%, transparent 50%)'
            }} />
          </div>

          <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors">
            <Settings size={15} />
          </button>

          {/* Avatar */}
          <div className="absolute -bottom-12 left-4">
            <div className="relative">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName || user.username}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-surface shadow-2xl"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 border-4 border-surface shadow-2xl flex items-center justify-center text-2xl font-black text-white">
                  {initials}
                </div>
              )}
              {badgeColor && (
                <div className={cn('absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 border-surface', badgeColor.bg, badgeColor.text)}>
                  {badgeColor.label[0]}
                </div>
              )}
              <button className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center border-2 border-surface hover:bg-indigo-600 transition-colors">
                <Camera size={12} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Profil Bilgileri */}
        <div className="pt-16 px-4 pb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-xl font-black text-white">{user.fullName || user.username}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-white/40">@{user.username}</span>
                {badgeColor && (
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', badgeColor.bg, badgeColor.text, badgeColor.border)}>
                    {badgeColor.label} Rozet
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

          {/* Konum & Üyelik */}
          <div className="flex items-center gap-1.5 text-xs text-white/40 mb-3">
            <MapPin size={11} className="text-indigo-400" />
            <span className={trustLevelLabel.color + ' font-semibold'}>{trustLevelLabel.label}</span>
            <span className="text-white/20">·</span>
            <span>Üye: {joinDate}</span>
          </div>

          {/* Bio / Düzenleme */}
          {editMode ? (
            <div className="mb-3">
              <textarea
                value={bio || ''}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                placeholder="Kendinizi tanıtın..."
                className="w-full bg-surface-2 border border-indigo-500/40 rounded-xl p-3 text-sm text-white outline-none resize-none placeholder-white/20"
              />
              <button
                onClick={() => setEditMode(false)}
                className="mt-2 px-4 py-1.5 rounded-lg bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 transition-colors"
              >
                Kaydet
              </button>
            </div>
          ) : (
            <p className="text-sm text-white/50 leading-relaxed mb-3 italic">
              {bio || 'Henüz bir biyografi eklenmedi.'}
            </p>
          )}

          {/* TrustScore Badge */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/25 text-xs font-semibold">
              <Shield size={11} />
              TrustScore: {user.trustScore}
            </div>
            {user.emailVerified && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-indigo-500/10 text-indigo-400 border-indigo-500/25 text-xs font-semibold">
                ✓ Doğrulanmış Üye
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-2 mb-5">
            <StatCard label="Yorum"    value={user.totalReviews}   color="indigo" />
            <StatCard label="Faydalı"  value={user.helpfulVotes}   color="emerald" />
            <StatCard label="Takipçi"  value={user.followersCount} />
            <StatCard label="Takip"    value={user.followingCount} />
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

          {/* ─── Tab: Yorumlar ────────────────────────────────────────────── */}
          {activeTab === 0 && (
            <div>
              {user.totalReviews === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare size={32} className="mx-auto mb-3 text-white/20" />
                  <div className="text-white/40 text-sm mb-1">Henüz yorum yok</div>
                  <Link href="/yorum-yaz" className="text-indigo-400 text-sm font-medium hover:text-indigo-300">
                    İlk yorumunu yaz →
                  </Link>
                </div>
              ) : (
                MOCK_REVIEWS.slice(0, 3).map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))
              )}
            </div>
          )}

          {/* ─── Tab: Kaydedilenler ───────────────────────────────────────── */}
          {activeTab === 1 && (
            <div>
              {savedBusinesses.length === 0 ? (
                <div className="text-center py-12">
                  <Bookmark size={32} className="mx-auto mb-3 text-white/20" />
                  <div className="text-white/40 text-sm">Henüz kaydedilen yer yok</div>
                </div>
              ) : (
                savedBusinesses.map((b) => <BusinessCard key={b.id} business={b} />)
              )}
            </div>
          )}

          {/* ─── Tab: İstatistikler ───────────────────────────────────────── */}
          {activeTab === 2 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/[0.07] bg-surface-2 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={15} className="text-emerald-400" />
                  <span className="text-sm font-bold text-white">TrustScore Detayı</span>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: `conic-gradient(#22C55E ${Math.min(user.trustScore / 5, 100) * 3.6}deg, #1F1F24 ${Math.min(user.trustScore / 5, 100) * 3.6}deg)` }}>
                    <div className="w-14 h-14 rounded-full bg-surface-2 flex items-center justify-center">
                      <span className="text-lg font-black text-emerald-400">{user.trustScore}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white mb-1">{trustLevelLabel.label}</div>
                    <div className="text-xs text-white/40 leading-relaxed">
                      Seviye: {user.trustLevel}
                    </div>
                  </div>
                </div>
                <ActivityBar label="Yorum Sayısı" value={Math.min(user.totalReviews, 100)} color="#818CF8" />
                <ActivityBar label="Faydalı Oy Oranı" value={
                  user.totalReviews > 0 ? Math.round((user.helpfulVotes / user.totalReviews) * 100) : 0
                } color="#34D399" />
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-surface-2 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={15} className="text-indigo-400" />
                  <span className="text-sm font-bold text-white">Aktivite</span>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 28 }).map((_, i) => {
                    const intensity = Math.random()
                    return (
                      <div key={i} className="aspect-square rounded" style={{
                        background: intensity > 0.7 ? 'rgba(99,102,241,0.8)' :
                                    intensity > 0.4 ? 'rgba(99,102,241,0.4)' :
                                    intensity > 0.2 ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)'
                      }} />
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ─── Tab: Ayarlar ─────────────────────────────────────────────── */}
          {activeTab === 3 && (
            <div className="space-y-2">
              <SettingsItem icon={User}     label="Hesap Bilgileri"  sub={user.email}                       href="/profil/hesap" />
              <SettingsItem icon={Bell}     label="Bildirimler"      sub="Push, e-posta bildirimleri"        href="/profil/bildirimler" />
              <SettingsItem icon={Shield}   label="Gizlilik"         sub="Profil görünürlüğü, veri"          href="/profil/gizlilik" />
              <SettingsItem icon={Bookmark} label="Kaydedilen Yerler" sub="Kaydettiğiniz işletmeler"         href="/profil/kaydedilenler" />
              <SettingsItem icon={Award}    label="Muhtar Başvurusu" sub="Mahallenizin güvenilir yorumcusu olun" />
              <div className="pt-2">
                <SettingsItem icon={LogOut} label="Çıkış Yap" danger onClick={handleLogout} />
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
