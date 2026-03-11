'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import {
  ThumbsUp, Heart, MessageCircle, Award, Shield,
  Star, UserPlus, TrendingUp, Bell, Check, Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '')

type NotifType = 'like' | 'thank' | 'reply' | 'muhtar' | 'shield' | 'follow' | 'review_milestone' | 'trust_update' | 'system'

interface Notification {
  id: string
  type: NotifType
  read: boolean
  createdAt: string
  actor?: { name: string; username: string; avatarUrl?: string; badgeLevel?: string }
  business?: { name: string; slug: string }
  content?: string
  message?: string
}

const NOTIF_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  like:             { icon: ThumbsUp,      color: 'text-indigo-400',  bg: 'bg-indigo-500/15' },
  thank:            { icon: Heart,         color: 'text-pink-400',    bg: 'bg-pink-500/15' },
  reply:            { icon: MessageCircle, color: 'text-sky-400',     bg: 'bg-sky-500/15' },
  muhtar:           { icon: Award,         color: 'text-amber-400',   bg: 'bg-amber-500/15' },
  shield:           { icon: Shield,        color: 'text-red-400',     bg: 'bg-red-500/15' },
  follow:           { icon: UserPlus,      color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  review_milestone: { icon: Star,          color: 'text-amber-400',   bg: 'bg-amber-500/15' },
  trust_update:     { icon: TrendingUp,    color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  system:           { icon: Bell,          color: 'text-white/50',    bg: 'bg-white/10' },
}

const FILTER_TABS = ['Tümü', 'Okunmamış', 'Beğeniler', 'Yanıtlar', 'Sistem']

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'az önce'
  if (m < 60) return `${m} dk önce`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} saat önce`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d} gün önce`
  return `${Math.floor(d / 7)} hafta önce`
}

function isToday(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  return diff < 86400000
}

function NotifIcon({ type }: { type: string }) {
  const cfg = NOTIF_CONFIG[type] || NOTIF_CONFIG.system
  const Icon = cfg.icon
  return (
    <div className={cn('w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0', cfg.bg)}>
      <Icon size={15} className={cfg.color} />
    </div>
  )
}

function ActorAvatar({ actor }: { actor: NonNullable<Notification['actor']> }) {
  const isMuhtar = actor.badgeLevel === 'MUHTAR'
  return (
    <div className="relative flex-shrink-0">
      {actor.avatarUrl ? (
        <img src={actor.avatarUrl} alt={actor.name} className="w-9 h-9 rounded-full object-cover" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">
          {(actor.name || actor.username || 'U').slice(0, 2).toUpperCase()}
        </div>
      )}
      {isMuhtar && (
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-[8px] font-black text-black border border-surface-1">M</div>
      )}
    </div>
  )
}

function NotifItem({ notif, onRead, onDelete }: {
  notif: Notification
  onRead: (id: string) => void
  onDelete: (id: string) => void
}) {
  const cfg = NOTIF_CONFIG[notif.type] || NOTIF_CONFIG.system

  const inner = (
    <div
      className={cn(
        'group flex items-start gap-3 px-4 py-3.5 transition-all relative',
        !notif.read ? 'bg-indigo-500/[0.04]' : 'hover:bg-white/[0.02]'
      )}
      onClick={() => !notif.read && onRead(notif.id)}
    >
      {!notif.read && (
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-400" />
      )}

      {notif.actor ? <ActorAvatar actor={notif.actor} /> : <NotifIcon type={notif.type} />}

      <div className="flex-1 min-w-0">
        <div className="text-sm leading-snug text-white/80">
          {notif.actor && (
            <span className="font-bold text-white">{notif.actor.name || notif.actor.username} </span>
          )}
          {notif.type === 'reply' && notif.content ? (
            <>
              <span className="text-white/60">yanıtladı: </span>
              <span className="text-white/70 italic">"{notif.content.slice(0, 60)}..."</span>
            </>
          ) : (
            <span className="text-white/60">{notif.message}</span>
          )}
          {notif.business && (
            <> — <span className={cn('font-medium', cfg.color)}>{notif.business.name}</span></>
          )}
        </div>
        <div className="text-[11px] text-white/30 mt-1">{timeAgo(notif.createdAt)}</div>
      </div>

      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(notif.id) }}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60 flex-shrink-0"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )

  if (notif.business) return <Link href={`/isletme/${notif.business.slug}`}>{inner}</Link>
  if (notif.actor) return <Link href={`/kullanici/${notif.actor.username}`}>{inner}</Link>
  return <div>{inner}</div>
}

function Skeleton() {
  return (
    <div className="divide-y divide-white/[0.04]">
      {[1,2,3,4,5].map(i => (
        <div key={i} className="flex items-start gap-3 px-4 py-3.5">
          <div className="w-9 h-9 rounded-full bg-white/[0.06] animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-white/[0.06] rounded animate-pulse w-3/4" />
            <div className="h-2.5 bg-white/[0.04] rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function BildirimlerPage() {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Tümü')
  const [loggedIn, setLoggedIn] = useState(true)

  const getToken = () =>
    typeof window !== 'undefined'
      ? (localStorage.getItem('token') || sessionStorage.getItem('token'))
      : null

  const fetchNotifs = async () => {
    const token = getToken()
    if (!token) { setLoggedIn(false); setLoading(false); return }

    try {
      const r = await fetch(`${API}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (r.status === 401) { setLoggedIn(false); setLoading(false); return }
      const d = await r.json()
      const list = Array.isArray(d) ? d : (d.notifications || d.data || [])
      setNotifs(list)
    } catch {
      setNotifs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNotifs() }, [])

  const unreadCount = notifs.filter(n => !n.read).length

  const markAllRead = async () => {
    const token = getToken()
    try {
      await fetch(`${API}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch {}
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  const markRead = async (id: string) => {
    const token = getToken()
    try {
      await fetch(`${API}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch {}
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const deleteNotif = async (id: string) => {
    const token = getToken()
    try {
      await fetch(`${API}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch {}
    setNotifs(prev => prev.filter(n => n.id !== id))
  }

  const filtered = notifs.filter(n => {
    if (filter === 'Okunmamış') return !n.read
    if (filter === 'Beğeniler') return n.type === 'like' || n.type === 'thank'
    if (filter === 'Yanıtlar') return n.type === 'reply'
    if (filter === 'Sistem') return ['system', 'trust_update', 'shield', 'review_milestone', 'muhtar'].includes(n.type)
    return true
  })

  const todayNotifs = filtered.filter(n => isToday(n.createdAt))
  const earlierNotifs = filtered.filter(n => !isToday(n.createdAt))

  return (
    <AppLayout>
      <div className="pb-4">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-white/60" />
            <span className="text-sm font-bold text-white">Bildirimler</span>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                {unreadCount} yeni
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
            >
              <Check size={12} />
              Tümünü okundu say
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 px-4 mb-1 overflow-x-auto scrollbar-hide pb-1">
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                'flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all',
                filter === tab
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-white/40 hover:text-white/70 bg-white/[0.03] border border-white/[0.06]'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && <Skeleton />}

        {/* Giriş gerekli */}
        {!loading && !loggedIn && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
              <Bell size={24} className="text-white/20" />
            </div>
            <div className="text-sm font-semibold text-white/40 mb-1">Giriş yapmanız gerekiyor</div>
            <div className="text-xs text-white/25 mb-4">Bildirimleri görmek için hesabınıza giriş yapın</div>
            <Link href="/giris" className="px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-semibold">
              Giriş Yap
            </Link>
          </div>
        )}

        {/* Empty */}
        {!loading && loggedIn && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
              <Bell size={24} className="text-white/20" />
            </div>
            <div className="text-sm font-semibold text-white/40 mb-1">Bildirim yok</div>
            <div className="text-xs text-white/25">Bu kategoride henüz bildirim bulunmuyor</div>
          </div>
        )}

        {/* Today */}
        {!loading && loggedIn && todayNotifs.length > 0 && (
          <div>
            <div className="px-4 py-2 text-[10px] font-bold text-white/30 uppercase tracking-wider">Bugün</div>
            <div className="divide-y divide-white/[0.04]">
              {todayNotifs.map(n => (
                <NotifItem key={n.id} notif={n} onRead={markRead} onDelete={deleteNotif} />
              ))}
            </div>
          </div>
        )}

        {/* Earlier */}
        {!loading && loggedIn && earlierNotifs.length > 0 && (
          <div>
            <div className="px-4 py-2 text-[10px] font-bold text-white/30 uppercase tracking-wider mt-2">Daha Önce</div>
            <div className="divide-y divide-white/[0.04]">
              {earlierNotifs.map(n => (
                <NotifItem key={n.id} notif={n} onRead={markRead} onDelete={deleteNotif} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
