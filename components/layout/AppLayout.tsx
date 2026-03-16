'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Search, PlusCircle, Bell, User, Award, LogOut, MapPin, Sparkles, Sun, Moon, Building2, Star, ShoppingBag, Gift, Zap , ArrowLeftRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/AuthContext'
import { useEffect, useState, useRef } from 'react'

const NAV_ITEMS = [
  { href: '/',                icon: Home,           label: 'Ana Sayfa' },
  { href: '/kesfet',          icon: Search,         label: 'Keşfet' },
  { href: '/yorum-yaz',       icon: PlusCircle,     label: 'Yorum Yaz' },
  { href: '/karsilastir/ara', icon: ArrowLeftRight, label: 'Karşılaştır' },
  { href: '/profil',          icon: User,           label: 'Profil' },
  { href: '/muhtarlar',       icon: Award,          label: 'Muhtarlar' },
  { href: '/isletme-ekle',    icon: Building2,      label: 'İşletme Ekle' },
]

const RANK_COLORS: Record<number, string> = {
  1: 'from-amber-400 to-yellow-600 text-black',
  2: 'from-slate-300 to-slate-400 text-black',
  3: 'from-amber-700 to-amber-800 text-white',
}

// ─── Tema Hook ────────────────────────────────────────────────────────────────
function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
    const initial = saved || 'dark'
    setTheme(initial)
    document.documentElement.classList.toggle('dark', initial === 'dark')
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  return { theme, toggle }
}

// ─── Tema Toggle Butonu ───────────────────────────────────────────────────────
function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      className={cn(
        'relative w-8 h-8 rounded-full flex items-center justify-center transition-all',
        'bg-white/[0.05] border border-white/[0.08] hover:bg-white/10',
        'text-white/50 hover:text-white/80',
        className
      )}
      title={theme === 'dark' ? 'Açık moda geç' : 'Koyu moda geç'}
    >
      {theme === 'dark'
        ? <Sun size={14} className="text-amber-400" />
        : <Moon size={14} className="text-indigo-400" />
      }
    </button>
  )
}

// ─── Kullanıcı Avatar ─────────────────────────────────────────────────────────
function UserAvatar({ name, username, avatarUrl, size = 'sm' }: {
  name?: string; username?: string; avatarUrl?: string | null; size?: 'sm' | 'md'
}) {
  const initials = ((name || username || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2))
  const dim = size === 'md' ? 'w-9 h-9 text-xs' : 'w-8 h-8 text-[10px]'

  const safeAvatarUrl = avatarUrl?.startsWith('http') ? avatarUrl : avatarUrl ? `https://api.tecrubelerim.com${avatarUrl}` : null
  if (safeAvatarUrl) {
    return (
      <img
        src={safeAvatarUrl}
        alt={name || username}
        className={cn(dim, 'rounded-full object-cover border border-white/10 flex-shrink-0')}
      />
    )
  }
  return (
    <div className={cn(dim, 'rounded-full flex items-center justify-center font-bold text-white flex-shrink-0')} style={{background:'var(--primary)'}}>
      {initials}
    </div>
  )
}

// ─── Sağ Panel ────────────────────────────────────────────────────────────────
const API_HOST = (process.env.NEXT_PUBLIC_API_URL || 'https://api.tecrubelerim.com').replace(/\/api\/?$/, '')

function RightPanel() {
  const [topUsers, setTopUsers] = useState<any[]>([])
  const [featuredBiz, setFeaturedBiz] = useState<any>(null)

  useEffect(() => {
    // Top kullanıcılar
    fetch(`${API_HOST}/api/users?sort=trustScore&limit=5`)
      .then(r => r.json())
      .then(d => setTopUsers(Array.isArray(d) ? d : (d.users || d.data || [])))
      .catch(() => {})

    // Öne çıkan işletme
    fetch(`${API_HOST}/api/businesses?sort=rating&limit=1`)
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : (d.data || [])
        if (list[0]) setFeaturedBiz(list[0])
      })
      .catch(() => {})
  }, [])

  return (
    <>
      {/* 1. Öne Çıkan İşletmeler */}
      {featuredBiz && (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="font-bold text-sm text-white">Öne Çıkan İşletmeler</span>
          </div>
          <Link href={`/isletme/${featuredBiz.slug}`}>
            <div className="group cursor-pointer">
              {(featuredBiz.attributes?.coverPhoto || featuredBiz.attributes?.photos?.[0]) && (
                <div className="relative rounded-xl overflow-hidden mb-3 h-32">
                  <img
                    src={featuredBiz.attributes.coverPhoto || featuredBiz.attributes.photos[0]}
                    alt={featuredBiz.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              )}
              <div className="font-bold text-sm text-white mb-1 group-hover:text-indigo-300 transition-colors">
                {featuredBiz.name}
              </div>
              <div className="flex items-center gap-1 text-xs text-white/40">
                <MapPin size={10} />
                <span>{featuredBiz.district || featuredBiz.city}</span>
                {featuredBiz.category && (
                  <>
                    <span className="text-white/20">·</span>
                    <span>{featuredBiz.category.name}</span>
                  </>
                )}
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* 2. Tecrübe Ustaları */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award size={15} className="text-amber-400" />
            <span className="font-bold text-sm text-white">Tecrübe Ustaları</span>
          </div>
          <Link href="/muhtarlar" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
            Tümü →
          </Link>
        </div>

        {topUsers.length === 0 ? (
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-3 p-2.5">
                <div className="w-8 h-8 rounded-full bg-white/[0.06] animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 bg-white/[0.06] rounded animate-pulse w-3/4" />
                  <div className="h-2 bg-white/[0.04] rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {topUsers.map((u, i) => (
              <Link href={`/kullanici/${u.username}`} key={u.id}>
                <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer">
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-black bg-gradient-to-br flex-shrink-0',
                    RANK_COLORS[(i + 1) as 1 | 2 | 3] || 'bg-white/10 text-white/50'
                  )}>
                    {i + 1}
                  </div>
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt={u.fullName || u.username} className="w-8 h-8 rounded-full object-cover border border-amber-500/20 flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300 border border-amber-500/20 flex-shrink-0">
                      {(u.fullName || u.username || 'U').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-white truncate">{u.fullName || u.username}</div>
                    <div className="text-[10px] text-white/40 truncate">@{u.username}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-xs text-emerald-400">{(u.trustScore || 0)}</div>
                    <div className="text-[9px] text-white/30">puan</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 3. Tecrübe Pazarı */}
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 to-purple-950/30 p-4 relative overflow-hidden">
        {/* Arka plan dekorasyon */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag size={14} className="text-indigo-400" />
            <span className="font-bold text-sm text-white">Tecrübe Pazarı</span>
            <span className="ml-auto text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full border border-indigo-500/20 font-medium">Yakında</span>
          </div>
          <p className="text-[11px] text-white/40 mb-4">Yorumlarınla puan kazan, ödüllere harca</p>

          {/* Özellik önizleme */}
          <div className="space-y-2.5 mb-4">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Zap size={12} className="text-amber-400" />
              </div>
              <div>
                <div className="text-xs font-medium text-white">Yorum Yaz → Puan Kazan</div>
                <div className="text-[10px] text-white/30">Her detaylı yorum +20 TP</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Gift size={12} className="text-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-medium text-white">Puanını Harca</div>
                <div className="text-[10px] text-white/30">Rozetler, özel ayrıcalıklar</div>
              </div>
            </div>
          </div>

          <Link href="/tecrube-pazari">
            <button className="w-full py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/30 transition-all">
              Pazarı Keşfet →
            </button>
          </Link>
        </div>
      </div>


      <div className="px-1">
        <p className="text-[10px] text-white/20 leading-relaxed">Tecrübelerim Beta · <a href="/sozlesme/privacy_policy" className="hover:text-white/40 transition-colors">Gizlilik</a> · <a href="/sozlesme/terms_of_service" className="hover:text-white/40 transition-colors">Kullanım Koşulları</a> · <a href="/sozlesme/help" className="hover:text-white/40 transition-colors">Yardım</a></p>
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
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [hasBusiness, setHasBusiness] = useState(false)
  const [unreadReplies, setUnreadReplies] = useState(0)

  useEffect(() => {
    if (!user) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (!token) return
    fetch(`${API_HOST}/api/users/me/businesses`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        const businesses = d.businesses || d || []
        if (businesses.length > 0) {
          setHasBusiness(true)
          // Yanitlanmamis yorum sayisi
          const total = businesses.reduce((acc: number, b: any) => acc + (b.totalReviews || 0), 0)
          setUnreadReplies(total > 0 ? 1 : 0)
        }
      })
      .catch(() => {})
  }, [user])
  const [scrolled, setScrolled] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [headerSearchVal, setHeaderSearchVal] = useState('')
  const [clientMounted, setClientMounted] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { theme, toggle } = useTheme()

  useEffect(() => {
    setClientMounted(true)
      const savedTheme = localStorage.getItem('app_theme') || 'indigo'
      document.documentElement.setAttribute('data-theme', savedTheme)
    // rAF ile DOM'un tamamen yüklenmesini bekle
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById('main-scroll')
      const handleScroll = () => {
        const scrollY = el ? el.scrollTop : window.scrollY
        setScrolled(scrollY > 60)
      }
      el?.addEventListener('scroll', handleScroll, { passive: true })
      window.addEventListener('scroll', handleScroll, { passive: true })
      // cleanup için ref'e sakla
      ;(window as any).__feedScrollCleanup = () => {
        el?.removeEventListener('scroll', handleScroll)
        window.removeEventListener('scroll', handleScroll)
      }
    })
    return () => {
      cancelAnimationFrame(raf)
      ;(window as any).__feedScrollCleanup?.()
    }
  }, [])

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
  const username = user ? `@${user.username}` : ''

  return (
    <div className="min-h-screen bg-surface">

      {/* ══════ MOBILE ══════ */}
      <div className="lg:hidden flex justify-center">
        <div className="w-full max-w-[480px] h-screen relative border-x border-white/[0.04] flex flex-col">

          <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md flex-shrink-0" style={{background:'var(--primary)'}}>
                <Star size={14} className="text-white fill-white" />
              </div>
              {clientMounted && scrolled ? (
                searchFocused ? (
                  <form onSubmit={(e) => { e.preventDefault(); if(headerSearchVal.trim()){ router.push(`/arama?q=${encodeURIComponent(headerSearchVal.trim())}`); setSearchFocused(false); setHeaderSearchVal("") }}} className="flex items-center gap-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-1 h-8 px-3 rounded-xl bg-white/[0.08] border border-indigo-500/40">
                      <Search size={12} className="text-indigo-400 flex-shrink-0" />
                      <input ref={searchInputRef} value={headerSearchVal} onChange={e => setHeaderSearchVal(e.target.value)} placeholder="Ara\u2026" className="bg-transparent outline-none text-white placeholder-white/30 w-full text-xs" autoFocus />
                    </div>
                    <button type="button" onClick={() => { setSearchFocused(false); setHeaderSearchVal("") }} className="text-white/40 hover:text-white/70 text-xs px-1 flex-shrink-0">\u2715</button>
                  </form>
                ) : (
                  <button onClick={() => { setSearchFocused(true); setTimeout(() => searchInputRef.current?.focus(), 50) }} className="flex items-center gap-2 flex-1 h-8 px-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/35 text-xs hover:bg-white/[0.09] transition-all min-w-0">
                    <Search size={12} className="flex-shrink-0" /><span className="truncate">Ara\u2026</span>
                  </button>
                )
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-base tracking-tight text-white">Tecrübelerim</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider" style={{background:'var(--primary-bg)',color:'var(--primary)',border:'1px solid var(--primary-border)'}}>Beta</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <ThemeToggle />
              <Link href="/bildirimler">
                <button aria-label="Bildirimler" className="relative w-8 h-8 rounded-full bg-white/5 border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
                  <Bell size={15} />
                </button>
              </Link>
              <Link href="/profil">
                <UserAvatar name={user?.fullName} username={user?.username} avatarUrl={user?.avatarUrl} size="sm" />
              </Link>
            </div>
          </header>

          <main id="main-scroll" className={`flex-1 min-h-0 overflow-y-auto ${hideBottomNav ? 'pb-0' : 'pb-24'}`}>{children}</main>

          {!hideBottomNav && (
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40 bg-surface/90 backdrop-blur-xl border-t border-white/[0.06] px-2 py-2">
              <div className="flex items-center justify-around">
                {NAV_ITEMS.slice(0, 5).map(({ href, icon: Icon, label }) => {
                  // Karşılaştır aktif durumu
                  if (href === '/karsilastir/ara') {
                    const active = pathname?.startsWith('/karsilastir')
                    return (
                      <Link key="karsilastir" href="/karsilastir/ara" className={cn(
                        'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all',
                        active ? 'text-emerald-400' : 'text-white/30 hover:text-white/60'
                      )}>
                        <ArrowLeftRight size={20} />
                        <span className="text-[10px] font-medium">Karşılaştır</span>
                      </Link>
                    )
                  }
                  // Kesfet slotunu isletmem ile degistir
                  if (href === '/kesfet' && hasBusiness) {
                    const active = pathname === '/sahip-paneli'
                    return (
                      <Link key="sahip-paneli" href="/sahip-paneli" className={cn(
                        'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all relative',
                        active ? 'text-primary' : 'text-white/30 hover:text-white/60'
                      )}>
                        <div className="relative">
                          <Building2 size={20} className={active ? 'fill-primary/20' : ''} />
                          {unreadReplies > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />}
                        </div>
                        <span className="text-[10px] font-medium">İşletmem</span>
                      </Link>
                    )
                  }
                  const active = pathname === href
                  return (
                    <Link key={href} href={href} className={cn(
                      'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all',
                      active ? 'text-primary' : 'text-white/30 hover:text-white/60'
                    )}>
                      {href === '/yorum-yaz' ? (
                        <div className="w-10 h-10 -mt-5 rounded-2xl flex items-center justify-center shadow-lg" style={{background:'var(--primary)'}}>
                          <Icon size={20} className="text-white" />
                        </div>
                      ) : (
                        <>
                          <Icon size={20} className={active ? 'fill-primary/20' : ''} />
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

      {/* ══════ DESKTOP ══════ */}
      <div className="hidden lg:grid min-h-screen" style={{ gridTemplateColumns: '260px 1fr 320px', maxWidth: 1240, margin: '0 auto' }}>

        {/* Sol sidebar */}
        <aside className="sticky top-0 h-screen flex flex-col px-3 py-6 border-r border-white/[0.06] overflow-y-auto">
          <Link href="/" className="flex items-center gap-2.5 mb-8 px-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0" style={{background:'var(--primary)'}}>
              <Star size={16} className="text-white fill-white" />
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
                  ? 'bg-primary-soft text-white border border-primary-soft'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                )}>
                  {href === '/yorum-yaz' ? (
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{background:'var(--primary)'}}>
                      <Icon size={13} className="text-white" />
                    </div>
                  ) : (
                    <Icon size={18} className={active ? 'text-primary' : 'text-white/40'} />
                  )}
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Karşılaştır butonu */}
          <Link href="/karsilastir/ara"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-semibold text-sm',
              pathname?.startsWith('/karsilastir')
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
            )}>
            <ArrowLeftRight size={18} />
            Karşılaştır
          </Link>

          {/* Isletmem butonu */}
          {hasBusiness && (
            <Link href="/sahip-paneli" className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-semibold text-sm mt-1 relative',
              'border',
              pathname === '/sahip-paneli'
                ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25'
                : 'text-indigo-300/70 border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 hover:text-indigo-300'
            )}>
              <div className="relative">
                <Building2 size={18} />
                {unreadReplies > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />}
              </div>
              İşletmem
            </Link>
          )}

          {/* User card + tema toggle */}
          <div className="mt-4 space-y-2">
            {/* Tema toggle */}
            <button
              onClick={toggle}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-white/50 hover:text-white hover:bg-white/[0.05] font-semibold text-sm"
            >
              {theme === 'dark'
                ? <><Sun size={18} className="text-amber-400" /> Açık Mod</>
                : <><Moon size={18} className="text-indigo-400" /> Koyu Mod</>
              }
            </button>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3">
              <Link href="/profil">
                <UserAvatar name={user?.fullName} username={user?.username} avatarUrl={user?.avatarUrl} size="md" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-white truncate">{displayName}</div>
                <div className="text-xs text-white/40 truncate">{username}</div>
              </div>
              <button
                onClick={handleLogout}
                className="text-white/30 hover:text-red-400 transition-colors p-1"
                title="Çıkış Yap" aria-label="Çıkış Yap"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </aside>

        {/* Orta */}
        <main className="flex flex-col border-r border-white/[0.06] min-w-0">
          <div className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
            <h1 className="font-black text-lg text-white">{title}</h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/bildirimler">
                <button aria-label="Bildirimler" className="w-8 h-8 rounded-full bg-white/5 border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
                  <Bell size={15} />
                </button>
              </Link>
            </div>
          </div>
          <div className={hideBottomNav ? '' : 'pb-8'}>{children}</div>
        </main>

        {/* Sağ sidebar */}
        <aside className="sticky top-0 h-screen px-4 py-6 space-y-4 overflow-y-auto">
          <RightPanel />
        </aside>
      </div>
    </div>
  )
}

