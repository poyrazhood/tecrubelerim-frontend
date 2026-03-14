'use client'

import React, { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { ChevronLeft, MapPin, Star, MessageSquare, Shield, BadgeCheck, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '')

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return 'Bugün'
  if (days < 30) return `${days}g önce`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} ay önce`
  return `${Math.floor(months / 12)} yıl önce`
}

export default function KullaniciPage() {
  const params = useParams()
  const router = useRouter()
  const handle = params?.handle as string

  const [user, setUser] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!handle) return
    fetchUser()
  }, [handle])

  async function fetchUser() {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/users/${handle}`)
      if (!res.ok) { setNotFound(true); return }
      const data = await res.json()
      setUser(data.user ?? data)

      const revRes = await fetch(`${API_BASE}/api/reviews?userId=${(data.user ?? data).id}&limit=10&sort=recent`)
      if (revRes.ok) {
        const revData = await revRes.json()
        setReviews(revData.reviews ?? revData.data ?? [])
      }
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    </AppLayout>
  )

  if (notFound || !user) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Shield size={40} className="text-white/20" />
        <p className="text-white/40 text-sm">Kullanıcı bulunamadı</p>
        <Link href="/" className="text-xs text-indigo-400 hover:text-indigo-300">Ana sayfaya dön</Link>
      </div>
    </AppLayout>
  )

  const initials = (user.fullName || user.username || 'U').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }) : ''

  const badgeColor = ({
    BRONZE:   { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/25', label: 'Bronz' },
    SILVER:   { bg: 'bg-slate-400/10',  text: 'text-slate-300',  border: 'border-slate-400/25',  label: 'Gümüş' },
    GOLD:     { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/25',  label: 'Altın' },
    PLATINUM: { bg: 'bg-cyan-400/10',   text: 'text-cyan-300',   border: 'border-cyan-400/25',   label: 'Platin' },
  } as any)[user.badgeLevel] || null

  return (
    <AppLayout>
      <div className="pb-8">
        {/* Cover */}
        <div className="relative">
          <div className="h-32 relative overflow-hidden">
            {user.avatarUrl ? (
              <>
                <img src={user.avatarUrl} alt="" className="absolute inset-0 w-full h-full object-cover" style={{filter: 'blur(20px)', transform: 'scale(1.2)'}} />
                <div className="absolute inset-0 bg-black/40" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface-1 to-surface-1">
                <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(99,102,241,0.4) 0%, transparent 60%)'}} />
              </div>
            )}
          </div>

          {/* Geri butonu */}
          <button onClick={() => router.back()} className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors">
            <ChevronLeft size={18} />
          </button>

          {/* Avatar */}
          <div className="absolute -bottom-12 left-4">
            <div className="relative">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName || user.username} className="w-24 h-24 rounded-2xl object-cover border-4 border-surface shadow-2xl" />
              ) : (
                <div className="w-24 h-24 rounded-2xl border-4 border-surface shadow-2xl flex items-center justify-center text-2xl font-black text-white bg-gradient-to-br from-indigo-500/30 to-purple-500/30">
                  {initials}
                </div>
              )}
              {badgeColor && (
                <div className={cn('absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 border-surface', badgeColor.bg, badgeColor.text)}>
                  {badgeColor.label[0]}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profil bilgileri */}
        <div className="pt-16 px-4 pb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-xl font-black text-white">{user.fullName || user.username}</h1>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-sm text-white/40">@{user.username}</span>
                {badgeColor && (
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', badgeColor.bg, badgeColor.text, badgeColor.border)}>
                    {badgeColor.label} Rozet
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-3 flex-wrap">
            {user.trustLevel && (
              <div className="flex items-center gap-1 text-xs text-emerald-400">
                <Shield size={11} />
                <span>{user.trustLevel === 'TRUSTED' ? 'Güvenilir' : user.trustLevel === 'HIGHLY_TRUSTED' ? 'Çok Güvenilir' : user.trustLevel}</span>
              </div>
            )}
            {joinDate && (
              <div className="flex items-center gap-1 text-xs text-white/30">
                <Calendar size={11} />
                <span>Üye: {joinDate}</span>
              </div>
            )}
          </div>

          {user.bio && <p className="text-sm text-white/60 mb-4 leading-relaxed">{user.bio}</p>}

          {user.trustScore > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-bold mb-4">
              <Shield size={11} /> TrustScore: {user.trustScore}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { label: 'Yorum', value: user._count?.reviews ?? user.reviewCount ?? 0, icon: MessageSquare, color: 'text-indigo-400' },
              { label: 'TrustScore', value: user.trustScore ?? 0, icon: Shield, color: 'text-emerald-400' },
              { label: 'Faydalı', value: user.helpfulCount ?? 0, icon: Star, color: 'text-amber-400' },
            ].map(stat => (
              <div key={stat.label} className="bg-surface-1 border border-white/[0.06] rounded-2xl p-3 text-center">
                <div className={cn('text-xl font-black', stat.color)}>{stat.value}</div>
                <div className="text-[10px] text-white/30 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Yorumlar */}
          {reviews.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <MessageSquare size={13} className="text-indigo-400" /> Son Yorumlar
              </h2>
              <div className="space-y-3">
                {reviews.map((r: any) => (
                  <div key={r.id} className="bg-surface-1 border border-white/[0.06] rounded-2xl p-4">
                    {r.business && (
                      <Link href={`/isletme/${r.business.slug}`} className="flex items-center gap-2 mb-2 group">
                        <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">{r.business.name}</div>
                        {r.rating > 0 && (
                          <div className="flex items-center gap-0.5 ml-auto flex-shrink-0">
                            {Array.from({length: 5}).map((_, i) => (
                              <span key={i} style={{fontSize: 10, color: i < r.rating ? '#FBBF24' : 'rgba(255,255,255,0.15)'}}>★</span>
                            ))}
                          </div>
                        )}
                      </Link>
                    )}
                    <p className="text-sm text-white/60 leading-relaxed line-clamp-3">{r.content}</p>
                    <p className="text-[10px] text-white/25 mt-2">{formatRelativeTime(r.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reviews.length === 0 && !loading && (
            <div className="text-center py-8 text-white/25 text-sm">
              <MessageSquare size={28} className="mx-auto mb-2 opacity-20" />
              <p>Henüz yorum yok</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
