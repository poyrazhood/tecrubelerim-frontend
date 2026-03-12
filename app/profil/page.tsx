'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import {
  Settings, TrendingUp, Camera, Edit3, ChevronRight,
  Shield, Bookmark, MessageSquare, Bell, LogOut,
  MapPin, Award, User, Loader2, Trash2, Star, Pencil, Check, X, Building2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReviewCard } from '@/components/feed/ReviewCard'
import { BusinessCard } from '@/components/business/BusinessCard'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '')
const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

const TABS = ['Yorumlar', 'Kaydedilenler', 'İstatistikler', 'Ayarlar']

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
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(value, 100)}%`, background: color }} />
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

export default function ProfilPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState(0)
  const [editMode, setEditMode] = useState(false)
  const [bio, setBio] = useState('')
  const [bioSaving, setBioSaving] = useState(false)
  const [bioError, setBioError] = useState('')

  const [myReviews, setMyReviews] = useState<any[]>([])
  const [editingReview, setEditingReview] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [editRating, setEditRating] = useState(5)
  const [editSaving, setEditSaving] = useState(false)
  const [deletingReview, setDeletingReview] = useState<string | null>(null)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewsLoaded, setReviewsLoaded] = useState(false)

  const [savedBusinesses, setSavedBusinesses] = useState<any[]>([])
  const [savedLoading, setSavedLoading] = useState(false)
  const [savedLoaded, setSavedLoaded] = useState(false)

  useEffect(() => {
    if (user) setBio((user as any).bio || '')
  }, [user])

  const loadMyReviews = useCallback(async () => {
    if (reviewsLoaded) return
    setReviewsLoading(true)
    try {
      const token = getToken()
      const res = await fetch(`${API_BASE}/api/reviews/my-reviews?page=1&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setMyReviews(data.data || [])
      }
    } catch {}
    finally {
      setReviewsLoading(false)
      setReviewsLoaded(true)
    }
  }, [reviewsLoaded])

  const loadSavedBusinesses = useCallback(async () => {
    if (savedLoaded) return
    setSavedLoading(true)
    try {
      const token = getToken()
      const res = await fetch(`${API_BASE}/api/users/me/saved?page=1&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setSavedBusinesses(data.data || [])
      }
    } catch {}
    finally {
      setSavedLoading(false)
      setSavedLoaded(true)
    }
  }, [savedLoaded])

  useEffect(() => {
    if (activeTab === 0) loadMyReviews()
    if (activeTab === 1) loadSavedBusinesses()
  }, [activeTab, loadMyReviews, loadSavedBusinesses])

  const handleSaveBio = async () => {
    setBioSaving(true)
    setBioError('')
    try {
      const token = getToken()
      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bio }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setBioError(err.error || 'Kaydedilemedi.')
      } else {
        setEditMode(false)
      }
    } catch {
      setBioError('Bağlantı hatası.')
    } finally {
      setBioSaving(false)
    }
  }

  const handleLogout = () => { logout(); router.push('/giris') }

  if (!loading && !user) { router.push('/giris'); return null }
  if (loading || !user) return <AppLayout><ProfileSkeleton /></AppLayout>

  const initials = (user.fullName || user.username)
    .split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  const badgeColor = ({
    NONE: null,
    BRONZE:   { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/25', label: 'Bronz' },
    SILVER:   { bg: 'bg-slate-400/10',  text: 'text-slate-300',  border: 'border-slate-400/25',  label: 'Gümüş' },
    GOLD:     { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/25',  label: 'Altın' },
    PLATINUM: { bg: 'bg-cyan-400/10',   text: 'text-cyan-300',   border: 'border-cyan-400/25',   label: 'Platin' },
  } as any)[user.badgeLevel] || null

  const trustLevelLabel = ({
    NEWCOMER:      { label: 'Yeni Üye',      color: 'text-white/50' },
    DEVELOPING:    { label: 'Gelişiyor',      color: 'text-blue-400' },
    TRUSTED:       { label: 'Güvenilir',      color: 'text-emerald-400' },
    HIGHLY_TRUSTED:{ label: 'Çok Güvenilir', color: 'text-indigo-400' },
    VERIFIED:      { label: 'Doğrulanmış',    color: 'text-purple-400' },
  } as any)[user.trustLevel] || { label: user.trustLevel, color: 'text-white/50' }

  const joinDate = new Date(user.createdAt).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })

  return (
    <AppLayout>
      <div className="pb-4">
        <div className="relative">
          <div className="h-32 bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-surface-1 relative overflow-hidden">
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(99,102,241,0.4) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(168,85,247,0.3) 0%, transparent 50%)'
            }} />
          </div>
          <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors">
            <Settings size={15} />
          </button>
          <div className="absolute -bottom-12 left-4">
            <div className="relative">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName || user.username}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-surface shadow-2xl" />
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
              <input type="file" accept="image/*" id="avatar-upload" className="hidden" onChange={async (e) => {
                const f = e.target.files?.[0]
                if (!f) return
                const fd = new FormData()
                fd.append("file", f)
                const token = localStorage.getItem("token") || sessionStorage.getItem("token")
                const res = await fetch(`${API_BASE}/api/upload/avatar`, {
                  method: "POST",
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                  body: fd,
                })
                if (res.ok) {
                  const d = await res.json()
                  window.location.reload()
                }
              }} />
              <button onClick={() => document.getElementById("avatar-upload")?.click()}
                className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center border-2 border-surface hover:bg-indigo-600 transition-colors">
                <Camera size={12} className="text-white" />
              </button>
            </div>
          </div>
        </div>

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
            <button onClick={() => { setEditMode(!editMode); setBioError('') }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.09] text-xs font-medium text-white/60 hover:bg-white/[0.1] transition-all">
              <Edit3 size={12} />Düzenle
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-white/40 mb-3">
            <MapPin size={11} className="text-indigo-400" />
            <span className={trustLevelLabel.color + ' font-semibold'}>{trustLevelLabel.label}</span>
            <span className="text-white/20">·</span>
            <span>Üye: {joinDate}</span>
          </div>

          {editMode ? (
            <div className="mb-3">
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2}
                placeholder="Kendinizi tanıtın..." maxLength={200}
                className="w-full bg-surface-2 border border-indigo-500/40 rounded-xl p-3 text-sm text-white outline-none resize-none placeholder-white/20" />
              <div className="flex items-center gap-2 mt-2">
                <button onClick={handleSaveBio} disabled={bioSaving}
                  className="px-4 py-1.5 rounded-lg bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 transition-colors disabled:opacity-50 flex items-center gap-1.5">
                  {bioSaving && <Loader2 size={11} className="animate-spin" />}Kaydet
                </button>
                <button onClick={() => { setEditMode(false); setBio((user as any).bio || ''); setBioError('') }}
                  className="px-4 py-1.5 rounded-lg bg-white/[0.05] text-white/50 text-xs font-medium hover:bg-white/[0.1] transition-colors">
                  İptal
                </button>
                {bioError && <span className="text-xs text-red-400">{bioError}</span>}
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/50 leading-relaxed mb-3 italic">
              {bio || 'Henüz bir biyografi eklenmedi.'}
            </p>
          )}

          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/25 text-xs font-semibold">
              <Shield size={11} />TrustScore: {user.trustScore}
            </div>
            {(user as any).emailVerified && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-indigo-500/10 text-indigo-400 border-indigo-500/25 text-xs font-semibold">
                Dogrulanmis Uye
              </div>
            )}
          </div>

          <div className="flex gap-2 mb-5">
            <StatCard label="Yorum"   value={user.totalReviews}   color="indigo" />
            <StatCard label="Faydali" value={user.helpfulVotes}   color="emerald" />
            <StatCard label="Takipci" value={user.followersCount} />
            <StatCard label="Takip"   value={user.followingCount} />
          </div>

          <div className="flex gap-1 bg-surface-2 p-1 rounded-xl border border-white/[0.06] mb-4">
            {TABS.map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(i)}
                className={cn('flex-1 text-xs font-semibold py-2 rounded-lg transition-all',
                  activeTab === i ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-white/40 hover:text-white/70'
                )}>
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 0 && (
            <div>
              {reviewsLoading ? (
                <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-white/30" /></div>
              ) : myReviews.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare size={32} className="mx-auto mb-3 text-white/20" />
                  <div className="text-white/40 text-sm mb-1">Henuz yorum yok</div>
                  <Link href="/yorum-yaz" className="text-indigo-400 text-sm font-medium hover:text-indigo-300">Ilk yorumunu yaz</Link>
                </div>
              ) : myReviews.map((r) => (
                <div key={r.id} className="bg-surface-1 border border-white/[0.06] rounded-2xl p-4 mb-3">
                  {editingReview === r.id ? (
                    <div>
                      <div className="flex gap-1 mb-3">
                        {[1,2,3,4,5].map(s => (
                          <button key={s} onClick={() => setEditRating(s)}>
                            <Star size={18} className={s <= editRating ? "text-amber-400 fill-amber-400" : "text-white/20"} />
                          </button>
                        ))}
                      </div>
                      <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={3} maxLength={1000}
                        className="w-full bg-surface-2 border border-indigo-500/40 rounded-xl p-3 text-sm text-white outline-none resize-none placeholder-white/20 mb-3"
                        placeholder="Yorumunuzu yazin..." />
                      <div className="flex gap-2">
                        <button onClick={async () => {
                          setEditSaving(true)
                          const token = getToken()
                          const res = await fetch(`${API_BASE}/api/reviews/${r.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ content: editContent, rating: editRating })
                          })
                          if (res.ok) {
                            setMyReviews(prev => prev.map(x => x.id === r.id ? { ...x, content: editContent, rating: editRating } : x))
                            setEditingReview(null)
                          }
                          setEditSaving(false)
                        }} disabled={editSaving} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-500 text-white text-xs font-bold disabled:opacity-50">
                          {editSaving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}Kaydet
                        </button>
                        <button onClick={() => setEditingReview(null)} className="px-4 py-1.5 rounded-lg bg-white/[0.05] text-white/50 text-xs font-medium">
                          <X size={11} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="text-xs font-bold text-white/80 mb-1">{r.business?.name ?? "İşletme"}</p>
                          <div className="flex gap-0.5 mb-2">
                            {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= (r.rating ?? 0) ? "text-amber-400 fill-amber-400" : "text-white/20"} />)}
                          </div>
                          <p className="text-sm text-white/60 leading-relaxed">{r.content}</p>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button onClick={() => { setEditingReview(r.id); setEditContent(r.content); setEditRating(r.rating ?? 5) }}
                            className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors">
                            <Pencil size={13} />
                          </button>
                          <button onClick={async () => {
                            if (!confirm("Bu yorumu silmek istediginizden emin misiniz?")) return
                            setDeletingReview(r.id)
                            const token = getToken()
                            const res = await fetch(`${API_BASE}/api/reviews/${r.id}`, {
                              method: "DELETE",
                              headers: { Authorization: `Bearer ${token}` }
                            })
                            if (res.ok) setMyReviews(prev => prev.filter(x => x.id !== r.id))
                            setDeletingReview(null)
                          }} disabled={deletingReview === r.id}
                            className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50">
                            {deletingReview === r.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-white/25 mt-2">{new Date(r.createdAt).toLocaleDateString("tr-TR")}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 1 && (
            <div>
              {savedLoading ? (
                <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-white/30" /></div>
              ) : savedBusinesses.length === 0 ? (
                <div className="text-center py-12">
                  <Bookmark size={32} className="mx-auto mb-3 text-white/20" />
                  <div className="text-white/40 text-sm mb-1">Henuz kaydedilen yer yok</div>
                  <Link href="/kesf" className="text-indigo-400 text-sm font-medium hover:text-indigo-300">Yerleri kesfet</Link>
                </div>
              ) : savedBusinesses.map((b) => <BusinessCard key={b.id} business={b} />)}
            </div>
          )}

          {activeTab === 2 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/[0.07] bg-surface-2 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={15} className="text-emerald-400" />
                  <span className="text-sm font-bold text-white">TrustScore Detayi</span>
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
                    <div className="text-xs text-white/40">Seviye: {user.trustLevel}</div>
                  </div>
                </div>
                <ActivityBar label="Yorum Sayisi" value={Math.min(user.totalReviews, 100)} color="#818CF8" />
                <ActivityBar label="Faydali Oy Orani" value={user.totalReviews > 0 ? Math.round((user.helpfulVotes / user.totalReviews) * 100) : 0} color="#34D399" />
                <ActivityBar label="TrustScore" value={Math.round((user.trustScore / 500) * 100)} color="#F59E0B" />
              </div>
              <div className="rounded-2xl border border-white/[0.07] bg-surface-2 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={15} className="text-indigo-400" />
                  <span className="text-sm font-bold text-white">Ozet</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Dogrulanmis Yorum', value: (user as any).verifiedReviews ?? 0, color: 'text-indigo-400' },
                    { label: 'Profil Goruntulenme', value: (user as any).profileViews ?? 0, color: 'text-purple-400' },
                    { label: 'Faydali Oy', value: user.helpfulVotes, color: 'text-emerald-400' },
                    { label: 'Faydali Oran', value: user.totalReviews > 0 ? `%${Math.round((user.helpfulVotes / user.totalReviews) * 100)}` : '%0', color: 'text-amber-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white/[0.03] rounded-xl p-3">
                      <div className="text-xs text-white/40 mb-1">{label}</div>
                      <div className={cn('text-lg font-black', color)}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 3 && (
            <div className="space-y-2">
              <SettingsItem icon={User}     label="Hesap Bilgileri"   sub={user.email}                       href="/profil/hesap" />
              <SettingsItem icon={Bell}     label="Bildirimler"       sub="Push, e-posta bildirimleri"        href="/profil/bildirimler" />
              <SettingsItem icon={Shield}   label="Gizlilik"          sub="Profil gorunurlugu, veri"          href="/profil/gizlilik" />
              <SettingsItem icon={Bookmark} label="Kaydedilen Yerler" sub="Kaydettiginiz isletmeler"          href="/profil/kaydedilenler" />
              <SettingsItem icon={Building2} label="Sahip Paneli" sub="Isletmenizi yonetin veya sahiplenin" href="/sahip-paneli" />
              <SettingsItem icon={Award}    label="Muhtar Basvurusu"  sub="Mahallenizin guvenilir yorumcusu olun" />
              <div className="pt-2">
                <SettingsItem icon={LogOut} label="Cikis Yap" danger onClick={handleLogout} />
              </div>
              <div className="pt-4 pb-2 px-1">
                <p className="text-[11px] text-white/20 leading-relaxed">
                  Tecrubelerim Beta &middot;{' '}
                  <a href="/sozlesme/privacy_policy" className="hover:text-white/40 transition-colors">Gizlilik</a> &middot;{' '}
                  <a href="/sozlesme/terms_of_service" className="hover:text-white/40 transition-colors">Kullanim Kosullari</a> &middot;{' '}
                  <a href="/sozlesme/help" className="hover:text-white/40 transition-colors">Yardim</a>
                </p>
                <p className="text-[11px] text-white/15 mt-1">© 2026 Tecrubelerim</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
