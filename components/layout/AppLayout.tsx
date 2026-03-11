'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Search, PlusCircle, Bell, User, Award, LogOut, MapPin, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_MUHTARLAR, MOCK_BUSINESSES } from '@/lib/mock-data'
import { useAuth } from '@/lib/AuthContext'

const NAV_ITEMS = [
  { href: '/',           icon: Home,       label: 'Ana Sayfa' },
  { href: '/kesfet',     icon: Search,     label: 'Keşfet' },
  { href: '/yorum-yaz',  icon: PlusCircle, label: 'Yorum Yaz' },
  { href: '/bildirimler',icon: Bell,       label: 'Bildirimler' },
  { href: '/profil',     icon: User,       label: 'Profil' },
  { href: '/muhtarlar',  icon: Award,      label: 'Muhtarlar' },
]

const RANK_COLORS: Record<number, string> = {
  1: 'from-amber-400 to-yellow-600 text-black',
  2: 'from-slate-300 to-slate-400 text-black',
  3: 'from-amber-700 to-amber-800 text-white',
}

// ─── Kullanıcı Avatar Yardımcısı ─────────────────────────────────────────────

function UserAvatar({ name, username, avatarUrl, size = 'sm' }: {
  name?: string; username?: string; avatarUrl?: string | null; size?: 'sm' | 'md'
}) {
  const initials = ((name || username || 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2))
  const dim = size === 'md' ? 'w-9 h-9 text-xs' : 'w-8 h-8 text-[10px]'

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || username}
        className={cn(dim, 'rounded-full object-cover border border-white/10 flex-shrink-0')}
      />
    )
  }
  return (
    <div className={cn(dim, 'rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white flex-shrink-0')}>
      {initials}
    </div>
  )
}

// ─── Sağ Panel ────────────────────────────────────────────────────────────────

function RightPanel() {
  return (
    <>
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award size={15} className="text-amber-400" />
            <span className="font-bold text-sm text-white">Mahalle Muhtarları</span>
          </div>
          <Link href="/muhtarlar" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
            Tümü →
          </Link>
        </div>
        <div className="space-y-2">
          {MOCK_MUHTARLAR.map((m) => {
            const handle = m.handle?.replace('@', '') || m.id
            return (
              <Link href={`/kullanici/${handle}`} key={m.id}>
                <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer">
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-black bg-gradient-to-br flex-shrink-0',
                    RANK_COLORS[m.rank as 1|2|3] || 'bg-white/10 text-white/50'
                  )}>
                    {m.rank}
                  </div>
                  {m.image ? (
                    <img src={m.image} alt={m.name} className="w-8 h-8 rounded-full object-cover border border-amber-500/20 flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300 border border-amber-500/20 flex-shrink-0">
                      {m.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-white truncate">{m.name}</div>
                    <div className="text-[10px] text-white/40 truncate">{m.neighborhood} · {m.expertise[0]}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-xs text-emerald-400">{m.helpfulCount.toLocaleString('tr-TR')}</div>
                    <div className="text-[9px] text-white/30">faydalı</div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={14} className="text-indigo-400" />
          <span className="font-bold text-sm text-white">AI Önerisi</span>
        </div>
        <Link href={`/isletme/${MOCK_BUSINESSES[0].slug}`}>
          <div className="group cursor-pointer">
            <div className="relative rounded-xl overflow-hidden mb-3 h-32">
              <img src={MOCK_BUSINESSES[0].image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-2 left-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 backdrop-blur-sm">
                  %{MOCK_BUSINESSES[0].semanticMatch} eşleşme
                </span>
              </div>
            </div>
            <div className="font-bold text-sm text-white mb-1 group-hover:text-indigo-300 transition-colors">
              {MOCK_BUSINESSES[0].name}
            </div>
            <div className="flex items-center gap-1 text-xs text-white/40">
              <MapPin size={10} />
              <span>{MOCK_BUSINESSES[0].district}</span>
              <span className="text-white/20">·</span>
              <span>{MOCK_BUSINESSES[0].reviewCount.toLocaleString('tr-TR')} yorum</span>
            </div>
          </div>
        </Link>
      </div>

      <div className="px-1">
        <p className="text-[10px] text-white/20 leading-relaxed">
          Tecrübelerim Beta · Gizlilik · Kullanım Koşulları · Yardım
        </p>
        <p className="text-[10px] text-white/15 mt-1">© 2026 Tecrübelerim</p>
      </div>
    </>
  )
}

// ─── Ana Layout ───────────────────────────────────────────────────────────────

export function AppLayout({ children, hideBottomNav }: {
  children: React.ReactNode
  hideBottomNav?: boolean
}) {
  const pathname  = usePathname()
  const router    = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push('/giris')
  }

  const pageTitle: Record<string, string> = {
    '/':            'Ana Sayfa',
    '/kesfet':      'Keşfet',
    '/muhtarlar':   'Mahalle Muhtarları',
    '/profil':      'Profil',
    '/yorum-yaz':   'Yorum Yaz',
    '/bildirimler': 'Bildirimler',
  }
  const title = pageTitle[pathname] ?? 'Tecrübelerim'

  const displayName = user?.fullName || user?.username || '...'
  const username    = user ? `@${user.username}` : ''

  return (
    <div className="min-h-screen bg-surface">

      {/* ══════ MOBILE ( < lg ) ══════ */}
      <div className="lg:hidden flex justify-center">
        <div className="w-full max-w-[480px] min-h-screen relative border-x border-white/[0.04] flex flex-col">

          {/* Mobile header */}
          <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-[10px] font-black text-white">T</span>
              </div>
              <span className="font-black text-base tracking-tight text-white">Tecrübelerim</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-wider">Beta</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/bildirimler">
                <button className="relative w-8 h-8 rounded-full bg-white/5 border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
                  <Bell size={15} />
                </button>
              </Link>
              <Link href="/profil">
                <UserAvatar
                  name={user?.fullName}
                  username={user?.username}
                  avatarUrl={user?.avatarUrl}
                  size="sm"
                />
              </Link>
            </div>
          </header>

          <main className={`flex-1 ${hideBottomNav ? 'pb-0' : 'pb-24'}`}>{children}</main>

          {!hideBottomNav && (
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40 bg-surface/90 backdrop-blur-xl border-t border-white/[0.06] px-2 py-2">
              <div className="flex items-center justify-around">
                {NAV_ITEMS.slice(0, 5).map(({ href, icon: Icon, label }) => {
                  const active = pathname === href
                  return (
                    <Link key={href} href={href} className={cn(
                      'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all',
                      active ? 'text-indigo-400' : 'text-white/30 hover:text-white/60'
                    )}>
                      {href === '/yorum-yaz' ? (
                        <div className="w-10 h-10 -mt-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                          <Icon size={20} className="text-white" />
                        </div>
                      ) : (
                        <>
                          <Icon size={20} className={active ? 'fill-indigo-400/20' : ''} />
                          <span className="text-[10px] font-medium">{label}</span>
                        </>
                      )}
                    </Link>
                  )
                })}
              </div>
            </nav>
          )}
        </div>
      </div>

      {/* ══════ DESKTOP ( >= lg ) ══════ */}
      <div className="hidden lg:grid min-h-screen" style={{ gridTemplateColumns: '260px 1fr 320px', maxWidth: 1240, margin: '0 auto' }}>

        {/* Sol sidebar */}
        <aside className="sticky top-0 h-screen flex flex-col px-3 py-6 border-r border-white/[0.06] overflow-y-auto">
          <Link href="/" className="flex items-center gap-2.5 mb-8 px-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-sm font-black text-white">T</span>
            </div>
            <span className="font-black text-lg tracking-tight text-white">Tecrübelerim</span>
          </Link>

          <nav className="flex flex-col gap-1 flex-1">
            {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
              const active = pathname === href
              return (
                <Link key={href} href={href} className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-semibold text-sm',
                  active
                    ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                )}>
                  {href === '/yorum-yaz' ? (
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <Icon size={13} className="text-white" />
                    </div>
                  ) : (
                    <Icon size={18} className={active ? 'text-indigo-400' : 'text-white/40'} />
                  )}
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* User card */}
          <div className="mt-4 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3">
            <Link href="/profil">
              <UserAvatar
                name={user?.fullName}
                username={user?.username}
                avatarUrl={user?.avatarUrl}
                size="md"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-white truncate">{displayName}</div>
              <div className="text-xs text-white/40 truncate">{username}</div>
            </div>
            <button
              onClick={handleLogout}
              className="text-white/30 hover:text-red-400 transition-colors p-1"
              title="Çıkış Yap"
            >
              <LogOut size={14} />
            </button>
          </div>
        </aside>

        {/* Orta — ana içerik */}
        <main className="flex flex-col border-r border-white/[0.06] min-w-0">
          <div className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
            <h1 className="font-black text-lg text-white">{title}</h1>
            <Link href="/bildirimler">
              <button className="w-8 h-8 rounded-full bg-white/5 border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
                <Bell size={15} />
              </button>
            </Link>
          </div>
          <div className={hideBottomNav ? '' : 'pb-8'}>
            {children}
          </div>
        </main>

        {/* Sağ sidebar */}
        <aside className="sticky top-0 h-screen px-4 py-6 space-y-4 overflow-y-auto">
          <RightPanel />
        </aside>
      </div>

    </div>
  )
}
