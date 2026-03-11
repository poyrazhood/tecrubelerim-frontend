'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import {
  ThumbsUp, Heart, MessageCircle, Award, Shield,
  ShieldCheck, Star, UserPlus, TrendingUp, Bell,
  Check, Trash2, Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type NotifType = 'like' | 'thank' | 'reply' | 'muhtar' | 'shield' | 'follow' | 'review_milestone' | 'trust_update' | 'system'

interface Notification {
  id: string
  type: NotifType
  read: boolean
  time: string
  actor?: { name: string; handle: string; image?: string; isMuhtar?: boolean }
  business?: { name: string; slug: string }
  content?: string
  meta?: string
}

const MOCK_NOTIFS: Notification[] = [
  {
    id: 'n1', type: 'muhtar', read: false, time: '2 dk önce',
    meta: 'Bu ay 1. sıraya yükseldiniz! 🏆',
  },
  {
    id: 'n2', type: 'like', read: false, time: '15 dk önce',
    actor: { name: 'Can Yıldız', handle: 'canyildiz', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', isMuhtar: true },
    business: { name: 'Kahve Dünyası Moda', slug: 'kahve-dunyasi-moda' },
    meta: 'yorumunuzu faydalı buldu',
  },
  {
    id: 'n3', type: 'reply', read: false, time: '1 saat önce',
    actor: { name: 'Fatma Öğretmen', handle: 'fatmaogretmen', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face' },
    business: { name: 'Kadıköy Matematik Kursu', slug: 'kadikoy-matematik-kursu' },
    content: 'Kesinlikle katılıyorum, öğretmenlerin ilgisi gerçekten farklı bir seviyede.',
  },
  {
    id: 'n4', type: 'trust_update', read: false, time: '3 saat önce',
    business: { name: 'Bostancı Oto Servis', slug: 'bostanci-oto-servis-ahmet' },
    meta: 'TrustScore A\'dan A+\'ya yükseldi ↑',
  },
  {
    id: 'n5', type: 'follow', read: true, time: '5 saat önce',
    actor: { name: 'Zeynep Demir', handle: 'zeynepdemir', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' },
    meta: 'sizi takip etmeye başladı',
  },
  {
    id: 'n6', type: 'thank', read: true, time: '1 gün önce',
    actor: { name: 'Mehmet Kaya', handle: 'mehmetkaya42' },
    business: { name: 'Kahve Dünyası Moda', slug: 'kahve-dunyasi-moda' },
    meta: 'yorumunuz için teşekkür etti',
  },
  {
    id: 'n7', type: 'review_milestone', read: true, time: '2 gün önce',
    meta: '100 faydalı oy aldınız! Topluluk sizi seviyor 💙',
  },
  {
    id: 'n8', type: 'shield', read: true, time: '3 gün önce',
    business: { name: 'Bostancı Oto Servis', slug: 'bostanci-oto-servis-ahmet' },
    meta: 'Şüpheli yorum AI tarafından işaretlendi ve kaldırıldı',
  },
  {
    id: 'n9', type: 'like', read: true, time: '3 gün önce',
    actor: { name: 'Ayşe Yılmaz', handle: 'ayseyilmaz', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face', isMuhtar: true },
    business: { name: 'Kahve Dünyası Moda', slug: 'kahve-dunyasi-moda' },
    meta: 'yorumunuzu faydalı buldu',
  },
  {
    id: 'n10', type: 'system', read: true, time: '1 hafta önce',
    meta: 'Tecrübelerim\'e hoş geldiniz! Profilinizi tamamlayarak başlayın.',
  },
]

const NOTIF_CONFIG: Record<NotifType, {
  icon: React.ElementType
  color: string
  bg: string
  label: string
}> = {
  like:              { icon: ThumbsUp,   color: 'text-indigo-400',  bg: 'bg-indigo-500/15',  label: 'Beğeni' },
  thank:             { icon: Heart,      color: 'text-pink-400',    bg: 'bg-pink-500/15',    label: 'Teşekkür' },
  reply:             { icon: MessageCircle, color: 'text-sky-400',  bg: 'bg-sky-500/15',     label: 'Yanıt' },
  muhtar:            { icon: Award,      color: 'text-amber-400',   bg: 'bg-amber-500/15',   label: 'Muhtar' },
  shield:            { icon: Shield,     color: 'text-red-400',     bg: 'bg-red-500/15',     label: 'Güvenlik' },
  follow:            { icon: UserPlus,   color: 'text-emerald-400', bg: 'bg-emerald-500/15', label: 'Takip' },
  review_milestone:  { icon: Star,       color: 'text-amber-400',   bg: 'bg-amber-500/15',   label: 'Başarı' },
  trust_update:      { icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/15', label: 'TrustScore' },
  system:            { icon: Bell,       color: 'text-white/50',    bg: 'bg-white/10',       label: 'Sistem' },
}

const FILTER_TABS = ['Tümü', 'Okunmamış', 'Beğeniler', 'Yanıtlar', 'Sistem']

function NotifIcon({ type }: { type: NotifType }) {
  const cfg = NOTIF_CONFIG[type]
  const Icon = cfg.icon
  return (
    <div className={cn('w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0', cfg.bg)}>
      <Icon size={15} className={cfg.color} />
    </div>
  )
}

function ActorAvatar({ actor }: { actor: NonNullable<Notification['actor']> }) {
  return (
    <div className="relative flex-shrink-0">
      {actor.image ? (
        <img src={actor.image} alt={actor.name} className="w-9 h-9 rounded-full object-cover" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">
          {actor.name.slice(0, 2).toUpperCase()}
        </div>
      )}
      {actor.isMuhtar && (
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
  const cfg = NOTIF_CONFIG[notif.type]

  const inner = (
    <div
      className={cn(
        'group flex items-start gap-3 px-4 py-3.5 transition-all relative',
        !notif.read ? 'bg-indigo-500/[0.04]' : 'hover:bg-white/[0.02]'
      )}
      onClick={() => !notif.read && onRead(notif.id)}
    >
      {/* Unread dot */}
      {!notif.read && (
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-400" />
      )}

      {/* Avatar or icon */}
      {notif.actor ? <ActorAvatar actor={notif.actor} /> : <NotifIcon type={notif.type} />}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-sm leading-snug text-white/80">
          {notif.actor && (
            <span className="font-bold text-white">{notif.actor.name} </span>
          )}
          {notif.type === 'reply' && notif.content ? (
            <>
              <span className="text-white/60">yanıtladı: </span>
              <span className="text-white/70 italic">"{notif.content.slice(0, 60)}..."</span>
            </>
          ) : (
            <span className="text-white/60">{notif.meta}</span>
          )}
          {notif.business && (
            <> — <span className={cn('font-medium', cfg.color)}>{notif.business.name}</span></>
          )}
        </div>
        <div className="text-[11px] text-white/30 mt-1">{notif.time}</div>
      </div>

      {/* Delete btn */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(notif.id) }}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60 flex-shrink-0"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )

  if (notif.business) {
    return <Link href={`/isletme/${notif.business.slug}`}>{inner}</Link>
  }
  if (notif.actor) {
    return <Link href={`/kullanici/${notif.actor.handle}`}>{inner}</Link>
  }
  return <div>{inner}</div>
}

export default function BildirimlerPage() {
  const [notifs, setNotifs] = useState(MOCK_NOTIFS)
  const [filter, setFilter] = useState('Tümü')

  const unreadCount = notifs.filter(n => !n.read).length

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  const deleteNotif = (id: string) => setNotifs(prev => prev.filter(n => n.id !== id))

  const filtered = notifs.filter(n => {
    if (filter === 'Okunmamış') return !n.read
    if (filter === 'Beğeniler') return n.type === 'like' || n.type === 'thank'
    if (filter === 'Yanıtlar') return n.type === 'reply'
    if (filter === 'Sistem') return n.type === 'system' || n.type === 'trust_update' || n.type === 'shield' || n.type === 'review_milestone' || n.type === 'muhtar'
    return true
  })

  // Group by today / earlier
  const today = filtered.filter(n =>
    n.time.includes('dk') || n.time.includes('saat')
  )
  const earlier = filtered.filter(n =>
    !n.time.includes('dk') && !n.time.includes('saat')
  )

  return (
    <AppLayout>
      <div className="pb-4">
        {/* Header actions */}
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

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
              <Bell size={24} className="text-white/20" />
            </div>
            <div className="text-sm font-semibold text-white/40 mb-1">Bildirim yok</div>
            <div className="text-xs text-white/25">Bu kategoride henüz bildirim bulunmuyor</div>
          </div>
        )}

        {/* Today group */}
        {today.length > 0 && (
          <div>
            <div className="px-4 py-2 text-[10px] font-bold text-white/30 uppercase tracking-wider">
              Bugün
            </div>
            <div className="divide-y divide-white/[0.04]">
              {today.map(n => (
                <NotifItem key={n.id} notif={n} onRead={markRead} onDelete={deleteNotif} />
              ))}
            </div>
          </div>
        )}

        {/* Earlier group */}
        {earlier.length > 0 && (
          <div>
            <div className="px-4 py-2 text-[10px] font-bold text-white/30 uppercase tracking-wider mt-2">
              Daha Önce
            </div>
            <div className="divide-y divide-white/[0.04]">
              {earlier.map(n => (
                <NotifItem key={n.id} notif={n} onRead={markRead} onDelete={deleteNotif} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
