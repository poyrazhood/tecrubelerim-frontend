'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  Building2, Users, MessageSquare, CheckCircle, XCircle, Loader2,
  Search, Ban, ChevronLeft, ChevronRight, Star, AlertTriangle,
  Trash2, Eye, Shield, Flag, Clock, Filter, RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '')
const getH = () => ({ 'x-admin-secret': 'tecrube_admin_2026', 'Content-Type': 'application/json' })

function normalizeRating(raw: number) {
  if (!raw || raw <= 0) return 0
  if (raw <= 5) return raw
  if (raw <= 50) return raw / 10
  if (raw <= 500) return raw / 100
  return raw / 1000
}

const REASON_LABEL: Record<string, string> = {
  SPAM: 'Spam', INAPPROPRIATE: 'Uygunsuz', FAKE_REVIEW: 'Sahte Yorum',
  HARASSMENT: 'Taciz', COPYRIGHT: 'Telif Hakkı', OTHER: 'Diğer'
}
const REASON_COLOR: Record<string, string> = {
  SPAM: 'bg-orange-500/15 text-orange-400',
  INAPPROPRIATE: 'bg-red-500/15 text-red-400',
  FAKE_REVIEW: 'bg-pink-500/15 text-pink-400',
  HARASSMENT: 'bg-red-600/15 text-red-500',
  COPYRIGHT: 'bg-yellow-500/15 text-yellow-400',
  OTHER: 'bg-white/[0.06] text-white/40'
}

export default function AdminPage() {
  const [tab, setTab] = useState<'stats'|'reports'|'flagged'|'claims'|'businesses'|'users'|'reviews'>('stats')
  const [stats, setStats] = useState<any>(null)
  const [modStats, setModStats] = useState<any>(null)
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [claimFilter, setClaimFilter] = useState('PENDING')
  const [reportFilter, setReportFilter] = useState('PENDING')

  const loadStats = () => {
    fetch(`${API}/api/admin/stats`, { headers: getH() }).then(r => r.json()).then(setStats).catch(() => {})
    fetch(`${API}/api/admin/moderation-stats`, { headers: getH() }).then(r => r.json()).then(setModStats).catch(() => {})
  }

  useEffect(() => { loadStats() }, [])

  const load = useCallback(async () => {
    if (tab === 'stats') return
    setLoading(true)
    try {
      let url = ''
      if (tab === 'reports') url = `${API}/api/admin/reports?status=${reportFilter}&page=${page}`
      if (tab === 'flagged') url = `${API}/api/admin/flagged-reviews?page=${page}`
      if (tab === 'claims') url = `${API}/api/admin/claims?status=${claimFilter}&page=${page}`
      if (tab === 'businesses') url = `${API}/api/admin/businesses?page=${page}&search=${encodeURIComponent(search)}`
      if (tab === 'users') url = `${API}/api/admin/users?page=${page}&search=${encodeURIComponent(search)}`
      if (tab === 'reviews') url = `${API}/api/admin/reviews?page=${page}`
      const r = await fetch(url, { headers: getH() })
      const d = await r.json()
      setData(d.reports || d.claims || d.businesses || d.users || d.reviews || [])
      setTotal(d.total || 0)
    } catch(e) { console.error(e) }
    setLoading(false)
  }, [tab, page, search, claimFilter, reportFilter])

  useEffect(() => { setPage(1); setData([]) }, [tab, claimFilter, reportFilter])
  useEffect(() => { load() }, [load])

  const claimAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id)
    try {
      await fetch(`${API}/api/admin/claims/${id}`, { method: 'PATCH', headers: getH(), body: JSON.stringify({ action }) })
      await load(); loadStats()
    } catch(e) { console.error(e) }
    setActionLoading(null)
  }

  const reportAction = async (id: string, action: 'resolve' | 'dismiss' | 'reviewing') => {
    setActionLoading(id)
    try {
      await fetch(`${API}/api/admin/reports/${id}`, { method: 'PATCH', headers: getH(), body: JSON.stringify({ action }) })
      await load(); loadStats()
    } catch(e) { console.error(e) }
    setActionLoading(null)
  }

  const flagAction = async (id: string, isFlagged: boolean, isPublished: boolean) => {
    setActionLoading(id)
    try {
      await fetch(`${API}/api/admin/reviews/${id}/flag`, { method: 'PATCH', headers: getH(), body: JSON.stringify({ isFlagged, isPublished }) })
      await load(); loadStats()
    } catch(e) { console.error(e) }
    setActionLoading(null)
  }

  const banUser = async (id: string, ban: boolean) => {
    setActionLoading(id)
    try {
      await fetch(`${API}/api/admin/users/${id}/ban`, { method: 'PATCH', headers: getH(), body: JSON.stringify({ ban }) })
      await load()
    } catch(e) { console.error(e) }
    setActionLoading(null)
  }

  const deleteReview = async (id: string) => {
    if (!confirm('Bu yorumu kalıcı olarak silmek istediğinizden emin misiniz?')) return
    setActionLoading(id)
    try {
      await fetch(`${API}/api/admin/reviews/${id}`, { method: 'DELETE', headers: getH() })
      await load()
    } catch(e) { console.error(e) }
    setActionLoading(null)
  }

  const tabs = [
    { key: 'stats',      label: 'Genel Bakış',    icon: Star },
    { key: 'reports',    label: 'Şikayetler',      icon: Flag,       badge: modStats?.pendingReports },
    { key: 'flagged',    label: 'Şüpheli Yorumlar',icon: Shield,     badge: modStats?.flaggedReviews },
    { key: 'claims',     label: 'Sahiplik Talepleri', icon: CheckCircle, badge: modStats?.pendingClaims },
    { key: 'businesses', label: 'İşletmeler',      icon: Building2 },
    { key: 'users',      label: 'Kullanıcılar',    icon: Users },
    { key: 'reviews',    label: 'Tüm Yorumlar',    icon: MessageSquare },
  ] as const

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="border-b border-white/[0.07] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0f] z-10">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <ChevronLeft size={16} />
          </Link>
          <span className="font-black text-lg">Admin Paneli</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 font-bold">BETA</span>
        </div>
        <div className="flex items-center gap-3">
          {stats && <span className="text-xs text-white/30">{stats.users?.toLocaleString()} kullanıcı · {stats.businesses?.toLocaleString()} işletme</span>}
          <button onClick={loadStats} className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-56 border-r border-white/[0.07] min-h-[calc(100vh-57px)] p-3 flex-shrink-0 sticky top-[57px] self-start">
          {tabs.map(({ key, label, icon: Icon, badge }: any) => (
            <button key={key} onClick={() => setTab(key)}
              className={cn('w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1',
                tab === key ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
              )}>
              <Icon size={15} />
              <span className="flex-1 text-left">{label}</span>
              {badge > 0 && <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-red-500 text-white min-w-[18px] text-center">{badge}</span>}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 max-w-5xl overflow-auto">

          {/* ── STATS ── */}
          {tab === 'stats' && stats && (
            <div>
              <h2 className="text-xl font-black mb-5">Genel Bakış</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Kullanıcılar', value: stats.users, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
                  { label: 'İşletmeler',   value: stats.businesses, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
                  { label: 'Yorumlar',     value: stats.reviews, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                  { label: 'Bekleyen Talep', value: stats.pendingClaims, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={cn('rounded-2xl border p-5', bg)}>
                    <div className={cn('text-3xl font-black mb-1', color)}>{value?.toLocaleString()}</div>
                    <div className="text-xs text-white/40">{label}</div>
                  </div>
                ))}
              </div>

              {/* Moderasyon özeti */}
              {modStats && (
                <div>
                  <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Moderasyon Durumu</div>
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      { label: 'Bekleyen Şikayet', value: modStats.pendingReports, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', tab: 'reports' },
                      { label: 'Şüpheli Yorum',    value: modStats.flaggedReviews, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', tab: 'flagged' },
                      { label: 'Bekleyen Sahiplik', value: modStats.pendingClaims, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', tab: 'claims' },
                    ].map(({ label, value, color, bg, tab: t }) => (
                      <button key={label} onClick={() => setTab(t as any)}
                        className={cn('rounded-2xl border p-4 text-left hover:opacity-80 transition-opacity', bg)}>
                        <div className={cn('text-2xl font-black mb-1', color)}>{value}</div>
                        <div className="text-xs text-white/40">{label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(modStats?.pendingReports > 0 || modStats?.flaggedReviews > 0 || modStats?.pendingClaims > 0) && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-bold">
                  <AlertTriangle size={15} />
                  Dikkat gerektiren {(modStats.pendingReports || 0) + (modStats.flaggedReviews || 0) + (modStats.pendingClaims || 0)} öğe var
                </div>
              )}
            </div>
          )}

          {/* ── REPORTS ── */}
          {tab === 'reports' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black">Kullanıcı Şikayetleri</h2>
                <div className="flex gap-1">
                  {['PENDING','REVIEWING','RESOLVED','DISMISSED','ALL'].map(f => (
                    <button key={f} onClick={() => setReportFilter(f)}
                      className={cn('px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors',
                        reportFilter === f ? 'bg-indigo-500 text-white' : 'bg-white/[0.05] text-white/40 hover:text-white'
                      )}>
                      {f === 'PENDING' ? 'Bekleyen' : f === 'REVIEWING' ? 'İnceleniyor' : f === 'RESOLVED' ? 'Çözüldü' : f === 'DISMISSED' ? 'Reddedildi' : 'Tümü'}
                    </button>
                  ))}
                </div>
              </div>
              {loading ? <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-white/30" /></div> : (
                <div className="space-y-3">
                  {data.map((r: any) => (
                    <div key={r.id} className="bg-[#111118] border border-white/[0.07] rounded-2xl p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-full', REASON_COLOR[r.reason] || REASON_COLOR.OTHER)}>
                              {REASON_LABEL[r.reason] || r.reason}
                            </span>
                            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full',
                              r.status === 'PENDING' ? 'bg-amber-500/15 text-amber-400' :
                              r.status === 'REVIEWING' ? 'bg-blue-500/15 text-blue-400' :
                              r.status === 'RESOLVED' ? 'bg-emerald-500/15 text-emerald-400' :
                              'bg-white/[0.05] text-white/30'
                            )}>{r.status}</span>
                            <span className="text-xs text-white/25">{new Date(r.createdAt).toLocaleDateString('tr-TR')}</span>
                          </div>

                          {r.reportedReview && (
                            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 mb-2">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-white/50">@{r.reportedReview.user?.username}</span>
                                <span className="text-white/20">→</span>
                                <Link href={`/isletme/${r.reportedReview.business?.slug}`} target="_blank"
                                  className="text-xs text-indigo-400 hover:underline">{r.reportedReview.business?.name}</Link>
                                <div className="flex gap-0.5 ml-auto">
                                  {[1,2,3,4,5].map(s => <Star key={s} size={9} className={s <= r.reportedReview.rating ? 'text-amber-400 fill-amber-400' : 'text-white/10'} />)}
                                </div>
                              </div>
                              <p className="text-xs text-white/50 line-clamp-2">{r.reportedReview.content}</p>
                              {r.reportedReview.isFlagged && (
                                <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded-full">
                                  <Flag size={8} /> Flaglendi
                                </span>
                              )}
                            </div>
                          )}

                          {r.reportedUser && (
                            <div className="text-xs text-white/40 mb-1">Şikayet edilen kullanıcı: <span className="text-white/60 font-bold">@{r.reportedUser.username}</span></div>
                          )}

                          <div className="text-xs text-white/30">
                            Şikayet eden: <span className="text-white/50">@{r.reporter?.username}</span>
                            {r.description && <span className="ml-2 italic">"{r.description}"</span>}
                          </div>
                        </div>

                        {(r.status === 'PENDING' || r.status === 'REVIEWING') && (
                          <div className="flex flex-col gap-1.5 flex-shrink-0">
                            {r.status === 'PENDING' && (
                              <button onClick={() => reportAction(r.id, 'reviewing')} disabled={actionLoading === r.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/20 text-xs font-bold hover:bg-blue-500/25 transition-colors disabled:opacity-50">
                                <Clock size={10} /> İncele
                              </button>
                            )}
                            <button onClick={() => reportAction(r.id, 'resolve')} disabled={actionLoading === r.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/25 transition-colors disabled:opacity-50">
                              {actionLoading === r.id ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle size={10} />} Çözüldü
                            </button>
                            <button onClick={() => reportAction(r.id, 'dismiss')} disabled={actionLoading === r.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] text-white/40 text-xs font-bold hover:bg-white/[0.08] transition-colors disabled:opacity-50">
                              <XCircle size={10} /> Reddet
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {data.length === 0 && !loading && (
                    <div className="text-center py-16">
                      <Shield size={32} className="mx-auto mb-3 text-white/10" />
                      <div className="text-white/25 text-sm">Bekleyen şikayet yok</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── FLAGGED REVIEWS ── */}
          {tab === 'flagged' && (
            <div>
              <h2 className="text-xl font-black mb-4">Şüpheli & Raporlanan Yorumlar</h2>
              {loading ? <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-white/30" /></div> : (
                <div className="space-y-3">
                  {data.map((r: any) => (
                    <div key={r.id} className={cn('bg-[#111118] border rounded-2xl p-4', r.isFlagged ? 'border-orange-500/20' : 'border-white/[0.07]')}>
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="text-xs font-bold text-white">@{r.user?.username}</span>
                            <span className="text-white/25 text-xs">→</span>
                            <Link href={`/isletme/${r.business?.slug}`} target="_blank" className="text-xs text-indigo-400 hover:underline">{r.business?.name}</Link>
                            <div className="flex gap-0.5 ml-1">
                              {[1,2,3,4,5].map(s => <Star key={s} size={9} className={s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-white/10'} />)}
                            </div>
                            {r.isFlagged && (
                              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400">
                                <Flag size={8} /> Flaglendi
                              </span>
                            )}
                            {!r.isPublished && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">Gizli</span>
                            )}
                          </div>

                          <p className="text-sm text-white/60 leading-relaxed mb-2 line-clamp-3">{r.content}</p>

                          {r.reports?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {r.reports.map((rep: any) => (
                                <span key={rep.id} className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-bold', REASON_COLOR[rep.reason] || REASON_COLOR.OTHER)}>
                                  {REASON_LABEL[rep.reason]} ({rep.status})
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="text-[10px] text-white/25">Trust Score: {r.user?.trustScore}</div>
                        </div>

                        <div className="flex flex-col gap-1.5 flex-shrink-0">
                          {r.isPublished ? (
                            <button onClick={() => flagAction(r.id, true, false)} disabled={actionLoading === r.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/20 text-xs font-bold hover:bg-orange-500/25 transition-colors disabled:opacity-50">
                              {actionLoading === r.id ? <Loader2 size={10} className="animate-spin" /> : <Flag size={10} />} Gizle
                            </button>
                          ) : (
                            <button onClick={() => flagAction(r.id, false, true)} disabled={actionLoading === r.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/25 transition-colors disabled:opacity-50">
                              {actionLoading === r.id ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle size={10} />} Yayınla
                            </button>
                          )}
                          <button onClick={() => deleteReview(r.id)} disabled={actionLoading === r.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/20 text-xs font-bold hover:bg-red-500/25 transition-colors disabled:opacity-50">
                            <Trash2 size={10} /> Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {data.length === 0 && !loading && (
                    <div className="text-center py-16">
                      <Shield size={32} className="mx-auto mb-3 text-white/10" />
                      <div className="text-white/25 text-sm">Şüpheli yorum yok</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── CLAIMS ── */}
          {tab === 'claims' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black">Sahiplik Talepleri</h2>
                <div className="flex gap-1">
                  {['PENDING','CLAIMED','UNCLAIMED','ALL'].map(f => (
                    <button key={f} onClick={() => setClaimFilter(f)}
                      className={cn('px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors',
                        claimFilter === f ? 'bg-indigo-500 text-white' : 'bg-white/[0.05] text-white/40 hover:text-white'
                      )}>
                      {f === 'PENDING' ? 'Bekleyen' : f === 'CLAIMED' ? 'Onaylı' : f === 'UNCLAIMED' ? 'Reddedildi' : 'Tümü'}
                    </button>
                  ))}
                </div>
              </div>
              {loading ? <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-white/30" /></div> : (
                <div className="space-y-3">
                  {data.map((c: any) => (
                    <div key={c.id} className="bg-[#111118] border border-white/[0.07] rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-full',
                              c.status === 'PENDING' ? 'bg-amber-500/15 text-amber-400' :
                              c.status === 'CLAIMED' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                            )}>{c.status}</span>
                            <span className="text-xs text-white/30">{new Date(c.createdAt).toLocaleDateString('tr-TR')}</span>
                          </div>
                          <div className="text-sm font-bold text-white mb-0.5">{c.business?.name}</div>
                          <div className="text-xs text-white/40 mb-2">{c.business?.district || c.business?.city}</div>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-500/25 flex items-center justify-center text-xs font-black text-indigo-300">
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
                  {data.length === 0 && !loading && <div className="text-center py-12 text-white/25 text-sm">Talep bulunamadı</div>}
                </div>
              )}
            </div>
          )}

          {/* ── BUSINESSES ── */}
          {tab === 'businesses' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black">İşletmeler <span className="text-white/30 font-normal text-base">({total.toLocaleString()})</span></h2>
                <div className="flex items-center gap-2 bg-[#111118] border border-white/[0.08] rounded-xl px-3 py-2">
                  <Search size={13} className="text-white/30" />
                  <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Ara..." className="bg-transparent text-sm text-white outline-none w-40 placeholder-white/20" />
                </div>
              </div>
              {loading ? <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-white/30" /></div> : (
                <div className="space-y-2">
                  {data.map((b: any) => (
                    <div key={b.id} className="bg-[#111118] border border-white/[0.07] rounded-xl p-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white truncate">{b.name}</span>
                          {b.isVerified && <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">✓ Doğrulandı</span>}
                          <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full',
                            b.claimStatus === 'CLAIMED' ? 'bg-emerald-500/10 text-emerald-400' :
                            b.claimStatus === 'PENDING' ? 'bg-amber-500/10 text-amber-400' : 'bg-white/[0.05] text-white/30'
                          )}>{b.claimStatus}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          <span className="text-xs text-white/35">{b.district || b.city}</span>
                          {b.category && <span className="text-xs text-white/25">{b.category.name}</span>}
                          {b.owner && <span className="text-xs text-white/25">@{b.owner.username}</span>}
                          <span className="text-xs text-white/25">{b.totalReviews} yorum</span>
                        </div>
                      </div>
                      <Link href={`/isletme/${b.slug}`} target="_blank"
                        className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-white/30 hover:text-white transition-colors flex-shrink-0">
                        <Eye size={13} />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── USERS ── */}
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white">@{u.username}</span>
                          {u.isBanned && <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full font-bold">Banlı</span>}
                          <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                            u.trustLevel === 'HIGHLY_TRUSTED' || u.trustLevel === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-400' :
                            u.trustLevel === 'TRUSTED' ? 'bg-blue-500/10 text-blue-400' : 'bg-white/[0.05] text-white/30'
                          )}>{u.trustLevel}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          <span className="text-xs text-white/35">{u.email}</span>
                          <span className="text-xs text-white/25">{u.totalReviews} yorum</span>
                          <span className="text-xs text-white/25">Trust: {u.trustScore}</span>
                        </div>
                      </div>
                      <button onClick={() => banUser(u.id, !u.isBanned)} disabled={actionLoading === u.id}
                        className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex-shrink-0',
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

          {/* ── ALL REVIEWS ── */}
          {tab === 'reviews' && (
            <div>
              <h2 className="text-xl font-black mb-4">Tüm Yorumlar <span className="text-white/30 font-normal text-base">({total.toLocaleString()})</span></h2>
              {loading ? <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-white/30" /></div> : (
                <div className="space-y-3">
                  {data.map((r: any) => (
                    <div key={r.id} className={cn('bg-[#111118] border rounded-xl p-4', r.isFlagged ? 'border-orange-500/20' : 'border-white/[0.07]')}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-bold text-white">@{r.user?.username}</span>
                            <span className="text-white/25">→</span>
                            <Link href={`/isletme/${r.business?.slug}`} target="_blank" className="text-xs text-indigo-400 hover:underline">{r.business?.name}</Link>
                            <div className="flex gap-0.5 ml-auto">
                              {[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= (r.rating ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-white/15'} />)}
                            </div>
                            {r.isFlagged && <span className="text-[10px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded-full font-bold">Flaglendi</span>}
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
              <span className="text-xs text-white/30">{page} / {totalPages} · {total} öğe</span>
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