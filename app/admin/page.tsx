'use client'
import { useState, useEffect, useCallback } from 'react'
import { Building2, Users, MessageSquare, CheckCircle, XCircle, Loader2, Search, Ban, ChevronLeft, ChevronRight, Star, AlertTriangle, Trash2, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '')
const ADMIN_SECRET = 'tecrube_admin_2026'
const getH = () => ({ 'x-admin-secret': 'tecrube_admin_2026', 'Content-Type': 'application/json' })

function normalizeRating(raw: number) {
  if (!raw || raw <= 0) return 0
  if (raw <= 5) return raw
  if (raw <= 50) return raw / 10
  if (raw <= 500) return raw / 100
  return raw / 1000
}

export default function AdminPage() {
  const [tab, setTab] = useState<'stats'|'claims'|'businesses'|'users'|'reviews'>('stats')
  const [stats, setStats] = useState<any>(null)
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [claimFilter, setClaimFilter] = useState('PENDING')

  useEffect(() => {
    fetch(`${API}/api/admin/stats`, { headers: getH() })
      .then(r => r.json()).then(setStats).catch(() => {})
  }, [])

  const load = useCallback(async () => {
    if (tab === 'stats') return
    setLoading(true)
    try {
      let url = ''
      if (tab === 'claims') url = `${API}/api/admin/claims?status=${claimFilter}&page=${page}`
      if (tab === 'businesses') url = `${API}/api/admin/businesses?page=${page}&search=${encodeURIComponent(search)}`
      if (tab === 'users') url = `${API}/api/admin/users?page=${page}&search=${encodeURIComponent(search)}`
      if (tab === 'reviews') url = `${API}/api/admin/reviews?page=${page}`
      const r = await fetch(url, { headers: getH() })
      const d = await r.json()
      setData(d.claims || d.businesses || d.users || d.reviews || [])
      setTotal(d.total || 0)
    } catch(e) { console.error(e) }
    setLoading(false)
  }, [tab, page, search, claimFilter])

  useEffect(() => { setPage(1); setData([]) }, [tab, claimFilter])
  useEffect(() => { load() }, [load])

  const claimAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id)
    try {
      const res = await fetch(`${API}/api/admin/claims/${id}`, { method: 'PATCH', headers: getH(), body: JSON.stringify({ action }) })
      const d = await res.json()
      console.log('claim action result:', d)
      await load()
      fetch(`${API}/api/admin/stats`, { headers: getH() }).then(r => r.json()).then(setStats).catch(() => {})
    } catch(e) { console.error('claimAction error:', e) }
    setActionLoading(null)
  }

  const banUser = async (id: string, ban: boolean) => {
    setActionLoading(id)
    await fetch(`${API}/api/admin/users/${id}/ban`, { method: 'PATCH', headers: getH(), body: JSON.stringify({ ban }) })
    await load()
    setActionLoading(null)
  }

  const deleteReview = async (id: string) => {
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return
    setActionLoading(id)
    await fetch(`${API}/api/admin/reviews/${id}`, { method: 'DELETE', headers: getH() })
    await load()
    setActionLoading(null)
  }

  const tabs = [
    { key: 'stats', label: 'Genel Bakış', icon: Star },
    { key: 'claims', label: 'Talepler', icon: CheckCircle, badge: stats?.pendingClaims },
    { key: 'businesses', label: 'İşletmeler', icon: Building2 },
    { key: 'users', label: 'Kullanıcılar', icon: Users },
    { key: 'reviews', label: 'Yorumlar', icon: MessageSquare },
  ] as const

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="border-b border-white/[0.07] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <ChevronLeft size={16} />
          </Link>
          <span className="font-black text-lg">Admin Paneli</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 font-bold">BETA</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/30">
          {stats && <span>{stats.users?.toLocaleString()} kullanıcı · {stats.businesses?.toLocaleString()} işletme</span>}
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-52 border-r border-white/[0.07] min-h-[calc(100vh-57px)] p-3 flex-shrink-0">
          {tabs.map(({ key, label, icon: Icon, badge }: any) => (
            <button key={key} onClick={() => setTab(key)}
              className={cn('w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1',
                tab === key ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
              )}>
              <Icon size={15} />
              <span className="flex-1 text-left">{label}</span>
              {badge > 0 && <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-red-500 text-white">{badge}</span>}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 max-w-5xl">

          {/* Stats */}
          {tab === 'stats' && stats && (
            <div>
              <h2 className="text-xl font-black mb-5">Genel Bakış</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Kullanıcılar', value: stats.users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                  { label: 'İşletmeler', value: stats.businesses, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                  { label: 'Yorumlar', value: stats.reviews, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'Bekleyen Talep', value: stats.pendingClaims, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={cn('rounded-2xl border border-white/[0.07] p-5', bg)}>
                    <div className={cn('text-3xl font-black mb-1', color)}>{value?.toLocaleString()}</div>
                    <div className="text-xs text-white/40">{label}</div>
                  </div>
                ))}
              </div>
              {stats.pendingClaims > 0 && (
                <button onClick={() => setTab('claims')}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-bold hover:bg-amber-500/15 transition-colors">
                  <AlertTriangle size={15} /> {stats.pendingClaims} bekleyen sahiplik talebi var — İncele
                </button>
              )}
            </div>
          )}

          {/* Claims */}
          {tab === 'claims' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black">Sahiplik Talepleri</h2>
                <div className="flex gap-1">
                  {['PENDING','APPROVED','REJECTED','ALL'].map(f => (
                    <button key={f} onClick={() => setClaimFilter(f)}
                      className={cn('px-3 py-1.5 rounded-lg text-xs font-bold transition-colors',
                        claimFilter === f ? 'bg-indigo-500 text-white' : 'bg-white/[0.05] text-white/40 hover:text-white'
                      )}>{f === 'PENDING' ? 'Bekleyen' : f === 'APPROVED' ? 'Onaylı' : f === 'REJECTED' ? 'Reddedildi' : 'Tümü'}</button>
                  ))}
                </div>
              </div>
              {loading ? <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-white/30" /></div> : (
                <div className="space-y-3">
                  {data.map((c: any) => (
                    <div key={c.id} className="bg-[#111118] border border-white/[0.07] rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-full',
                              c.status === 'PENDING' ? 'bg-amber-500/15 text-amber-400' :
                              c.status === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                            )}>{c.status}</span>
                            <span className="text-xs text-white/30">{new Date(c.createdAt).toLocaleDateString('tr-TR')}</span>
                          </div>
                          <div className="text-sm font-bold text-white mb-0.5">{c.business?.name}</div>
                          <div className="text-xs text-white/40">{c.business?.district || c.business?.city}</div>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-500/30 flex items-center justify-center text-xs font-black text-indigo-300">
                              {c.user?.username?.[0]?.toUpperCase()}
                            </div>
                            <span className="text-xs text-white/50">@{c.user?.username}</span>
                            <span className="text-xs text-white/25">{c.user?.email}</span>
                          </div>
                        </div>
                        {c.status === 'PENDING' && (
                          <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => claimAction(c.id, 'approve')} disabled={actionLoading === c.id}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-xs font-bold hover:bg-emerald-500/25 transition-colors disabled:opacity-50">
                              {actionLoading === c.id ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />} Onayla
                            </button>
                            <button onClick={() => claimAction(c.id, 'reject')} disabled={actionLoading === c.id}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/15 text-red-400 border border-red-500/25 text-xs font-bold hover:bg-red-500/25 transition-colors disabled:opacity-50">
                              <XCircle size={11} /> Reddet
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {data.length === 0 && !loading && <div className="text-center py-12 text-white/30">Talep bulunamadı</div>}
                </div>
              )}
            </div>
          )}

          {/* Businesses */}
          {tab === 'businesses' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black">İşletmeler <span className="text-white/30 font-normal text-base">({total.toLocaleString()})</span></h2>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 bg-[#111118] border border-white/[0.08] rounded-xl px-3 py-2">
                    <Search size={13} className="text-white/30" />
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Ara..." className="bg-transparent text-sm text-white outline-none w-40 placeholder-white/20" />
                  </div>
                </div>
              </div>
              {loading ? <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-white/30" /></div> : (
                <div className="space-y-2">
                  {data.map((b: any) => (
                    <div key={b.id} className="bg-[#111118] border border-white/[0.07] rounded-xl p-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white truncate">{b.name}</span>
                          {b.isVerified && <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">✓</span>}
                          <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full',
                            b.claimStatus === 'CLAIMED' ? 'bg-emerald-500/10 text-emerald-400' :
                            b.claimStatus === 'PENDING' ? 'bg-amber-500/10 text-amber-400' : 'bg-white/[0.05] text-white/30'
                          )}>{b.claimStatus}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-white/35">{b.district || b.city}</span>
                          {b.category && <span className="text-xs text-white/25">{b.category.name}</span>}
                          {b.owner && <span className="text-xs text-white/25">@{b.owner.username}</span>}
                          <span className="text-xs text-white/25">{b.totalReviews} yorum</span>
                        </div>
                      </div>
                      <Link href={`/isletme/${b.slug}`} target="_blank"
                        className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-white/30 hover:text-white transition-colors">
                        <Eye size={13} />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Users */}
          {tab === 'users' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black">Kullanıcılar <span className="text-white/30 font-normal text-base">({total.toLocaleString()})</span></h2>
                <div className="flex items-center gap-2 bg-[#111118] border border-white/[0.08] rounded-xl px-3 py-2">
                  <Search size={13} className="text-white/30" />
                  <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Kullanıcı ara..." className="bg-transparent text-sm text-white outline-none w-40 placeholder-white/20" />
                </div>
              </div>
              {loading ? <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-white/30" /></div> : (
                <div className="space-y-2">
                  {data.map((u: any) => (
                    <div key={u.id} className={cn('bg-[#111118] border rounded-xl p-3 flex items-center gap-3', u.isBanned ? 'border-red-500/20' : 'border-white/[0.07]')}>
                      <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center text-sm font-black text-indigo-300 flex-shrink-0">
                        {u.username?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">@{u.username}</span>
                          {u.isBanned && <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full">Banlı</span>}
                          <span className="text-xs text-white/30">{u.badgeLevel}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-white/35">{u.email}</span>
                          <span className="text-xs text-white/25">{u.totalReviews} yorum</span>
                          <span className="text-xs text-white/25">Trust: {u.trustScore}</span>
                        </div>
                      </div>
                      <button onClick={() => banUser(u.id, !u.isBanned)} disabled={actionLoading === u.id}
                        className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50',
                          u.isBanned ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        )}>
                        {actionLoading === u.id ? <Loader2 size={11} className="animate-spin" /> : <Ban size={11} />}
                        {u.isBanned ? 'Banı Kaldır' : 'Banla'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reviews */}
          {tab === 'reviews' && (
            <div>
              <h2 className="text-xl font-black mb-4">Yorumlar <span className="text-white/30 font-normal text-base">({total.toLocaleString()})</span></h2>
              {loading ? <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-white/30" /></div> : (
                <div className="space-y-3">
                  {data.map((r: any) => (
                    <div key={r.id} className="bg-[#111118] border border-white/[0.07] rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-white">@{r.user?.username}</span>
                            <span className="text-white/25">→</span>
                            <Link href={`/isletme/${r.business?.slug}`} target="_blank" className="text-xs text-indigo-400 hover:underline">{r.business?.name}</Link>
                            <div className="flex gap-0.5 ml-auto">
                              {[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= (r.rating ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-white/15'} />)}
                            </div>
                          </div>
                          <p className="text-sm text-white/60 leading-relaxed line-clamp-2">{r.content}</p>
                          <span className="text-[10px] text-white/25 mt-1 block">{new Date(r.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <button onClick={() => deleteReview(r.id)} disabled={actionLoading === r.id}
                          className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50 flex-shrink-0">
                          {actionLoading === r.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && tab !== 'stats' && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.06]">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1 || loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.05] text-white/50 text-sm disabled:opacity-30 hover:text-white transition-colors">
                <ChevronLeft size={14} /> Önceki
              </button>
              <span className="text-xs text-white/30">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages || loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.05] text-white/50 text-sm disabled:opacity-30 hover:text-white transition-colors">
                Sonraki <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}