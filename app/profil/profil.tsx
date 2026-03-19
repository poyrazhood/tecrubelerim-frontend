'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import {
  Settings, TrendingUp, Camera, Edit3, ChevronRight, ShoppingBag, Zap, Gift,
  Shield, Bookmark, MessageSquare, Bell, LogOut,
  MapPin, Award, User as UserIcon, Loader2, Trash2, Star, Pencil, Check, X, Building2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReviewCard } from '@/components/feed/ReviewCard'
import { BusinessCard } from '@/components/business/BusinessCard'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'

import type { User } from '@/types'
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '')
const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

const TABS = ['Yorumlar', 'Kaydedilenler', 'İstatistikler', 'Ayarlar']

function StatCard({ label, value, color = 'white' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex-1 p-3 rounded-2xl bg-surface-2 border border-white/[0.06] text-center">
      <div className={cn(
        'text-xl font-black',
        color === 'emerald' ? 'text-emerald-400' :
        color === 'indigo' || color === 'primary' ? 'text-primary' : 'text-white'
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
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [avatarProgress, setAvatarProgress] = useState(0)
  const [reviewsLoaded, setReviewsLoaded] = useState(false)

  const [savedBusinesses, setSavedBusinesses] = useState<any[]>([])
  const [savedLoading, setSavedLoading] = useState(false)
  const [savedLoaded, setSavedLoaded] = useState(false)

  const [pointLogs, setPointLogs] = useState<any[]>([])
  const [pointLogsLoading, setPointLogsLoading] = useState(false)
  const [pointLogsLoaded, setPointLogsLoaded] = useState(false)

  const loadPointLogs = useCallback(async () => {
    if (pointLogsLoaded) return
    setPointLogsLoading(true)
    try {
      const token = getToken()
      const res = await fetch(`${API_BASE}/api/market/points/log?limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setPointLogs(data.logs || [])
      }
    } catch {}
    finally {
      setPointLogsLoading(false)
      setPointLogsLoaded(true)
    }
  }, [pointLogsLoaded])

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
    if (activeTab === 2) loadPointLogs()
  }, [activeTab, loadMyReviews, loadSavedBusinesses, loadPointLogs])

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
  } as any)[user.badgeLevel ?? ""] || null

  const trustLevelLabel = ({
    NEWCOMER:      { label: 'Yeni Üye',      color: 'text-white/50' },
    DEVELOPING:    { label: 'Gelişiyor',      color: 'text-blue-400' },
    TRUSTED:       { label: 'Güvenilir',      color: 'text-emerald-400' },
    HIGHLY_TRUSTED:{ label: 'Çok Güvenilir', color: 'text-primary' },
    VERIFIED:      { label: 'Doğrulanmış',    color: 'text-primary' },
  } as any)[user.trustLevel ?? ""] || { label: user.trustLevel, color: 'text-white/50' }

  const joinDate = new Date((user as any).createdAt ?? Date.now()).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })

  return (
    <AppLayout>
      <div className="pb-4">
        <div className="relative">
          <div className="h-32 relative overflow-hidden">
            {user.avatarUrl ? (
              <>
                <img src={user.avatarUrl} alt="" className="absolute inset-0 w-full h-full object-cover scale-110" style={{filter: 'blur(20px)', transform: 'scale(1.2)'}} />
                <div className="absolute inset-0 bg-black/40" />
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-1 to-surface-1" />
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(99,102,241,0.4) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(168,85,247,0.3) 0%, transparent 50%)'
                }} />
              </>
            )}
          </div>
          <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors">
            <Settings size={15} />
          </button>
          <div className="absolute -bottom-12 left-4">
            <div className="relative">
              {avatarUploading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 rounded-2xl">
                  <div className="flex gap-0.5 mb-1">
                    {[1,2,3,4,5].map(s => <span key={s} style={{fontSize:16, color: s <= Math.ceil(avatarProgress/20) ? "#FBBF24" : "rgba(255,255,255,0.15)", transition:"color 0.15s"}}>★</span>)}
                  </div>
                  <span className="text-white text-[11px] font-bold mt-0.5">{avatarProgress}%</span>
                </div>
              )}
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName || user.username}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-surface shadow-2xl" />
              ) : (
                <div className="w-24 h-24 rounded-2xl border-4 border-surface shadow-2xl flex items-center justify-center text-2xl font-black text-white">
                  {initials}
                </div>
              )}
              {badgeColor && (
                <div className={cn('absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 border-surface', badgeColor.bg, badgeColor.text)}>
                  {badgeColor.label[0]}
                </div>
              )}
              <input type="file" accept="image/*" ref={avatarInputRef} className="hidden" onChange={async (e) => {
                const f = e.target.files?.[0]
                if (!f) return
                setAvatarUploading(true); setAvatarProgress(0)
                const interval = setInterval(() => setAvatarProgress(p => p >= 90 ? (clearInterval(interval), 90) : p + 5), 200)
                const fd = new FormData()
                fd.append("file", f)
                const token = localStorage.getItem("auth_token")
                const res = await fetch(`${API_BASE}/api/upload/avatar`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd })
                clearInterval(interval)
                if (res.ok) { setAvatarProgress(100); setTimeout(() => { setAvatarUploading(false); window.location.reload() }, 700) }
                else { setAvatarUploading(false); setAvatarProgress(0) }
              }} />
              <button onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center border-2 border-surface transition-colors bg-indigo-500">
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
            <MapPin size={11} className="text-primary" />
            <span className={trustLevelLabel.color + ' font-semibold'}>{trustLevelLabel.label}</span>
            <span className="text-white/20">·</span>
            <span>Üye: {joinDate}</span>
          </div>

          {editMode ? (
            <div className="mb-3">
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2}
                placeholder="Kendinizi tanıtın..." maxLength={200}
                className="w-full bg-surface-2 border border-primary-soft rounded-xl p-3 text-sm text-white outline-none resize-none placeholder-white/20" />
              <div className="flex items-center gap-2 mt-2">
                <button onClick={handleSaveBio} disabled={bioSaving}
                  className="px-4 py-1.5 rounded-lg text-white hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-1.5">
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
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-primary/10 text-primary border-primary-soft text-xs font-semibold">
                Dogrulanmis Uye
              </div>
            )}
          </div>

          <div className="flex gap-2 mb-5">
            <StatCard label="Yorum"   value={(user as any).totalReviews ?? 0}   color="primary" />
            <StatCard label="Faydali" value={(user as any).helpfulVotes ?? 0}   color="emerald" />
            <StatCard label="Takipci" value={(user as any).followersCount ?? 0} />
            <StatCard label="Takip"   value={(user as any).followingCount ?? 0} />
          </div>

          <div className="flex gap-1 bg-surface-2 p-1 rounded-xl border border-white/[0.06] mb-4">
            {TABS.map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(i)}
                className={cn('flex-1 text-xs font-semibold py-2 rounded-lg transition-all',
                  activeTab === i ? 'bg-primary-soft text-primary border border-primary-soft' : 'text-white/40 hover:text-white/70'
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
                  <Link href="/yorum-yaz" className="text-primary text-sm font-medium hover:text-primary">Ilk yorumunu yaz</Link>
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
                        className="w-full bg-surface-2 border border-primary-soft rounded-xl p-3 text-sm text-white outline-none resize-none placeholder-white/20 mb-3"
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
                        }} disabled={editSaving} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-bold disabled:opacity-50">
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
                            className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-primary hover:bg-primary/10 transition-colors">
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
                  <Link href="/kesf" className="text-primary text-sm font-medium hover:text-primary">Yerleri kesfet</Link>
                </div>
              ) : savedBusinesses.map((b) => <BusinessCard key={b.id} business={b} />)}
            </div>
          )}

          {activeTab === 2 && (() => {
            // Seviye sistemi
            const totalEarned = (user as any).totalEarnedPoints ?? 0
            const currentPts  = (user as any).currentPoints ?? 0
            const LEVELS = [
              { name: 'Acemi Kaşif',    min: 0,    max: 100,  color: '#94A3B8', icon: '🌱' },
              { name: 'Mahalle Sakini', min: 100,  max: 300,  color: '#60A5FA', icon: '🏘️' },
              { name: 'Deneyim Ustası', min: 300,  max: 700,  color: '#818CF8', icon: '⭐' },
              { name: 'Güvenilir Ses',  min: 700,  max: 1500, color: '#34D399', icon: '🎖️' },
              { name: 'Mahalle Muhtarı',min: 1500, max: 3000, color: '#F59E0B', icon: '👑' },
              { name: 'Efsane Kaşif',   min: 3000, max: 99999,color: '#F43F5E', icon: '🏆' },
            ]
            const lvl      = LEVELS.findLast(l => totalEarned >= l.min) ?? LEVELS[0]
            const nextLvl  = LEVELS[LEVELS.indexOf(lvl) + 1]
            const progress = nextLvl ? Math.round(((totalEarned - lvl.min) / (nextLvl.min - lvl.min)) * 100) : 100
            const toNext   = nextLvl ? nextLvl.min - totalEarned : 0

            const REASON_ICON: Record<string, string> = {
              REVIEW_WRITTEN: '💬', HELPFUL_VOTE: '👍', PHOTO_UPLOAD: '📸',
              BUSINESS_ADDED: '🏢', PURCHASE: '🛍️',
            }
            const REASON_LABEL: Record<string, string> = {
              REVIEW_WRITTEN: 'Yorum Yazıldı', HELPFUL_VOTE: 'Faydalı Oy Alındı',
              PHOTO_UPLOAD: 'Fotoğraf Yüklendi', BUSINESS_ADDED: 'İşletme Eklendi',
              PURCHASE: 'Ödül Satın Alındı',
            }

            return (
              <div className="space-y-4">

                {/* Seviye Kartı */}
                <div className="rounded-2xl border p-4 relative overflow-hidden"
                  style={{ borderColor: lvl.color + '40', background: `linear-gradient(135deg, ${lvl.color}10, transparent)` }}>
                  <div className="absolute top-0 right-0 w-28 h-28 rounded-full blur-2xl pointer-events-none"
                    style={{ background: lvl.color + '15' }} />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                        style={{ background: lvl.color + '20' }}>
                        {lvl.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-white/40 mb-0.5">Mevcut Seviye</div>
                        <div className="font-black text-base text-white">{lvl.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black" style={{ color: lvl.color }}>{currentPts.toLocaleString('tr-TR')}</div>
                        <div className="text-[10px] text-white/30">Kullanılabilir TP</div>
                      </div>
                    </div>

                    {/* İlerleme çubuğu */}
                    {nextLvl && (
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-white/40">{lvl.name}</span>
                          <span className="text-white/40">{nextLvl.name}</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${progress}%`, background: lvl.color }} />
                        </div>
                        <div className="flex justify-between text-[10px] mt-1.5">
                          <span style={{ color: lvl.color }}>{totalEarned.toLocaleString('tr-TR')} TP</span>
                          <span className="text-white/30">{toNext.toLocaleString('tr-TR')} TP daha → {nextLvl.icon}</span>
                        </div>
                      </div>
                    )}
                    {!nextLvl && (
                      <div className="text-center text-xs text-amber-400 font-bold py-1">
                        🏆 Maksimum seviyeye ulaştınız!
                      </div>
                    )}
                  </div>
                </div>

                {/* Puan Özeti */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
                    <div className="text-2xl font-black text-amber-400">{currentPts.toLocaleString('tr-TR')}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">Harcayabileceğin TP</div>
                  </div>
                  <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-center">
                    <div className="text-2xl font-black text-indigo-400">{totalEarned.toLocaleString('tr-TR')}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">Toplam Kazanılan TP</div>
                  </div>
                </div>

                {/* Puan Kazanma Rehberi */}
                <div className="rounded-2xl border border-white/[0.07] bg-surface-2 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap size={14} className="text-amber-400" />
                    <span className="text-sm font-bold text-white">Puan Kazan</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { icon: '💬', label: 'Yorum Yaz', desc: 'Günde max 3', pts: '+20 TP', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                      { icon: '🏢', label: 'İşletme Ekle', desc: 'Günde max 1', pts: '+50 TP', color: 'text-purple-400', bg: 'bg-purple-500/10' },
                      { icon: '📸', label: 'Fotoğraf Yükle', desc: 'Günde max 3', pts: '+5 TP',  color: 'text-blue-400',   bg: 'bg-blue-500/10' },
                      { icon: '👍', label: 'Faydalı Oy Al', desc: 'Günde max 10', pts: '+5 TP', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    ].map(({ icon, label, desc, pts, color, bg }) => (
                      <div key={label} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                        <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center text-base', bg)}>{icon}</div>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-white">{label}</div>
                          <div className="text-[10px] text-white/30">{desc}</div>
                        </div>
                        <div className={cn('text-xs font-black', color)}>{pts}</div>
                      </div>
                    ))}
                  </div>
                  <Link href="/tecrube-pazari">
                    <button className="w-full mt-3 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/30 transition-all">
                      Tecrübe Pazarı'na Git →
                    </button>
                  </Link>
                </div>

                {/* Puan Geçmişi */}
                <div className="rounded-2xl border border-white/[0.07] bg-surface-2 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={14} className="text-primary" />
                    <span className="text-sm font-bold text-white">Puan Geçmişi</span>
                  </div>
                  {pointLogsLoading ? (
                    <div className="space-y-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-12 rounded-xl bg-white/[0.04] animate-pulse" />
                      ))}
                    </div>
                  ) : pointLogs.length === 0 ? (
                    <div className="text-center py-6 text-white/30 text-xs">
                      <Zap size={24} className="mx-auto mb-2 opacity-20" />
                      Henüz puan kazanımın yok.<br />
                      <span className="text-indigo-400">Yorum yaz, işletme ekle, puan kazan!</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pointLogs.map((log: any) => (
                        <div key={log.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                          <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center text-base flex-shrink-0">
                            {REASON_ICON[log.reason] ?? '⚡'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-white truncate">
                              {REASON_LABEL[log.reason] ?? log.description ?? log.reason}
                            </div>
                            <div className="text-[10px] text-white/30">
                              {new Date(log.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          <div className={cn('text-sm font-black flex-shrink-0', log.points > 0 ? 'text-emerald-400' : 'text-red-400')}>
                            {log.points > 0 ? '+' : ''}{log.points} TP
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* TrustScore */}
                <div className="rounded-2xl border border-white/[0.07] bg-surface-2 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield size={15} className="text-emerald-400" />
                    <span className="text-sm font-bold text-white">TrustScore Detayı</span>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center"
                      style={{ background: `conic-gradient(#22C55E ${Math.min((user.trustScore ?? 0) / 5, 100) * 3.6}deg, #1F1F24 ${Math.min((user.trustScore ?? 0) / 5, 100) * 3.6}deg)` }}>
                      <div className="w-14 h-14 rounded-full bg-surface-2 flex items-center justify-center">
                        <span className="text-lg font-black text-emerald-400">{user.trustScore}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white mb-1">{trustLevelLabel.label}</div>
                      <div className="text-xs text-white/40">Seviye: {user.trustLevel}</div>
                    </div>
                  </div>
                  <ActivityBar label="Yorum Sayısı" value={Math.min((user.totalReviews ?? 0), 100)} color="#818CF8" />
                  <ActivityBar label="Faydalı Oy Oranı" value={(user.totalReviews ?? 0) > 0 ? Math.round(((user.helpfulVotes ?? 0) / (user.totalReviews ?? 0)) * 100) : 0} color="#34D399" />
                  <ActivityBar label="TrustScore" value={Math.round(((user.trustScore ?? 0) / 500) * 100)} color="#F59E0B" />
                </div>

              </div>
            )
          })()}

          {activeTab === 3 && (
            <div className="space-y-2">
              <SettingsItem icon={UserIcon}     label="Hesap Bilgileri"   sub={user.email}                       href="/profil/hesap" />
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
