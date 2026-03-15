'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Search, ChevronRight, Users, TrendingUp, Tag,
  Calendar, ToggleLeft, ToggleRight, Trash2, X, Check,
  Copy, AlertTriangle, Gift, Loader2, BarChart3,
  ChevronDown, ExternalLink, RefreshCw, Shield
} from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL

type Campaign = {
  id: string; name: string; description?: string; isActive: boolean
  createdAt: string; totalCodes: number; totalUses: number; activeUsers: number
}
type Code = {
  id: string; code: string; isActive: boolean; totalUses: number; activeUsers: number
  maxUses: number | null; expiresAt: string | null; rewardBadge: string | null
  rewardNote: string | null; createdAt: string; campaign?: { name: string } | null
  _count: { uses: number }
}
type CodeUser = {
  usedAt: string; rewardGiven: boolean
  user: { id: string; username: string; fullName: string; avatarUrl?: string; createdAt: string; _count: { reviews: number } }
}

function authHeaders() {
  const t = localStorage.getItem('auth_token') || localStorage.getItem('token') || sessionStorage.getItem('token')
  return { 
    'Content-Type': 'application/json', 
    'x-admin-secret': 'tecrube_admin_2026',
    ...(t ? { Authorization: `Bearer ${t}` } : {}) 
  }
}

// ─── Küçük yardımcı bileşenler ───────────────────────────────────────────────

function Badge({ children, color = 'indigo' }: { children: React.ReactNode; color?: string }) {
  const map: Record<string, string> = {
    indigo: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    red: 'bg-red-500/15 text-red-300 border-red-500/25',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
    gray: 'bg-white/[0.06] text-white/40 border-white/10',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${map[color]}`}>
      {children}
    </span>
  )
}

function StatCard({ label, value, sub, icon: Icon, color = '#818cf8' }: any) {
  return (
    <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-white/40">{label}</span>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: color + '20' }}>
          <Icon size={13} style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-[11px] text-white/30 mt-0.5">{sub}</p>}
    </div>
  )
}

function UsageBar({ used, max }: { used: number; max: number | null }) {
  if (!max) return <span className="text-xs text-white/30">Sınırsız · {used} kullanım</span>
  const pct = Math.min((used / max) * 100, 100)
  const color = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f97316' : '#22c55e'
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span style={{ color }}>{used} / {max}</span>
        <span className="text-white/30">%{Math.round(pct)}</span>
      </div>
      <div className="h-1 rounded-full bg-white/[0.07] overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

// ─── Modal: Kod oluştur ───────────────────────────────────────────────────────
function CreateCodeModal({ campaigns, onClose, onCreated }: {
  campaigns: Campaign[]; onClose: () => void; onCreated: () => void
}) {
  const [form, setForm] = useState({
    code: '', campaignId: '', maxUses: '', expiresAt: '',
    rewardBadge: '', rewardNote: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    setForm(p => ({ ...p, code }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch(`${API}/referral/admin/codes`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({
          code: form.code,
          ...(form.campaignId && { campaignId: form.campaignId }),
          ...(form.maxUses && { maxUses: form.maxUses }),
          ...(form.expiresAt && { expiresAt: form.expiresAt }),
          ...(form.rewardBadge && { rewardBadge: form.rewardBadge }),
          ...(form.rewardNote && { rewardNote: form.rewardNote }),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onCreated(); onClose()
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  const badgeOptions = [
    { value: 'EARLY_ADOPTER', label: '🌟 Erken Kullanıcı' },
    { value: 'TRUSTED', label: '🤝 Güvenilir' },
    { value: 'FEATURED', label: '🔥 Öne Çıkan' },
    { value: 'PREMIUM', label: '💎 Premium' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: '#0e0e14', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={e => e.stopPropagation()}>
        <div className="h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(99,102,241,0.6),transparent)' }} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white">Yeni Referral Kodu</h2>
            <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors"><X size={16} /></button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl text-xs text-red-400 flex items-center gap-2"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertTriangle size={13} />{error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {/* Kod */}
            <div>
              <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Kod</label>
              <div className="flex gap-2">
                <input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))}
                  placeholder="MART26" required maxLength={20}
                  className="flex-1 px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/20 outline-none font-mono tracking-widest"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }} />
                <button type="button" onClick={generateCode}
                  className="px-3 rounded-xl text-xs text-white/50 hover:text-white/80 transition-all flex items-center gap-1.5"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
                  <RefreshCw size={12} /> Üret
                </button>
              </div>
            </div>

            {/* Kampanya */}
            <div>
              <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Kampanya</label>
              <select value={form.campaignId} onChange={e => setForm(p => ({ ...p, campaignId: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
                <option value="">Kampanyasız</option>
                {campaigns.filter(c => c.isActive).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Limit + Tarih */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Maks. Kullanım</label>
                <input type="number" min="1" value={form.maxUses} onChange={e => setForm(p => ({ ...p, maxUses: e.target.value }))}
                  placeholder="Sınırsız"
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/20 outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }} />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Son Tarih</label>
                <input type="date" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', colorScheme: 'dark' }} />
              </div>
            </div>

            {/* Rozet */}
            <div>
              <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Kullanıcıya Rozet</label>
              <select value={form.rewardBadge} onChange={e => setForm(p => ({ ...p, rewardBadge: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
                <option value="">Rozet yok</option>
                {badgeOptions.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>

            {form.rewardBadge && (
              <div>
                <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Rozet Notu</label>
                <input value={form.rewardNote} onChange={e => setForm(p => ({ ...p, rewardNote: e.target.value }))}
                  placeholder="Ör: İlk 100 kullanıcı ödülü"
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/20 outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }} />
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 8px 24px rgba(99,102,241,0.25)' }}>
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              {loading ? 'Oluşturuluyor...' : 'Kodu Oluştur'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ─── Modal: Kampanya oluştur ──────────────────────────────────────────────────
function CreateCampaignModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState(''); const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    await fetch(`${API}/referral/admin/campaigns`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify({ name, description: desc }),
    })
    setLoading(false); onCreated(); onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: '#0e0e14', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
        <div className="h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(99,102,241,0.6),transparent)' }} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white">Yeni Kampanya</h2>
            <button onClick={onClose} className="text-white/30 hover:text-white/70"><X size={16} /></button>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Kampanya Adı</label>
              <input value={name} onChange={e => setName(e.target.value)} required placeholder="Mart 2026 Lansmanı"
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/20 outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Açıklama</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} placeholder="Opsiyonel..."
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/20 outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              Kampanya Oluştur
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ─── Ana bileşen ──────────────────────────────────────────────────────────────
export default function ReferralAdminPanel() {
  const [tab, setTab] = useState<'overview' | 'campaigns' | 'codes'>('overview')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [codes, setCodes] = useState<Code[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCampaign, setFilterCampaign] = useState('')
  const [expandedCode, setExpandedCode] = useState<string | null>(null)
  const [codeUsers, setCodeUsers] = useState<Record<string, CodeUser[]>>({})
  const [showCreateCode, setShowCreateCode] = useState(false)
  const [showCreateCampaign, setShowCreateCampaign] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [campRes, codesRes, statsRes] = await Promise.all([
      fetch(`${API}/referral/admin/campaigns`, { headers: authHeaders() }),
      fetch(`${API}/referral/admin/codes`, { headers: authHeaders() }),
      fetch(`${API}/referral/admin/stats`, { headers: authHeaders() }),
    ])
    if (campRes.ok) setCampaigns(await campRes.json())
    if (codesRes.ok) setCodes(await codesRes.json())
    if (statsRes.ok) setStats(await statsRes.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function toggleCode(id: string, isActive: boolean) {
    await fetch(`${API}/referral/admin/codes/${id}`, {
      method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ isActive: !isActive }),
    })
    setCodes(p => p.map(c => c.id === id ? { ...c, isActive: !isActive } : c))
  }

  async function toggleCampaign(id: string, isActive: boolean) {
    await fetch(`${API}/referral/admin/campaigns/${id}`, {
      method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ isActive: !isActive }),
    })
    setCampaigns(p => p.map(c => c.id === id ? { ...c, isActive: !isActive } : c))
  }

  async function deleteCode(id: string) {
    if (!confirm('Bu kodu silmek istediğinize emin misiniz?')) return
    const res = await fetch(`${API}/referral/admin/codes/${id}`, { method: 'DELETE', headers: authHeaders() })
    if (res.ok) setCodes(p => p.filter(c => c.id !== id))
    else { const d = await res.json(); alert(d.error) }
  }

  async function loadCodeUsers(codeId: string) {
    if (codeUsers[codeId]) return
    const res = await fetch(`${API}/referral/admin/codes/${codeId}/users`, { headers: authHeaders() })
    if (res.ok) {
      const data = await res.json()
      setCodeUsers(p => ({ ...p, [codeId]: data.uses }))
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 1500)
  }

  const filteredCodes = codes.filter(c => {
    const matchSearch = !search || c.code.includes(search.toUpperCase())
    const matchCampaign = !filterCampaign || c.campaign?.name === filterCampaign
    return matchSearch && matchCampaign
  })

  const isExpired = (c: Code) => c.expiresAt && new Date(c.expiresAt) < new Date()
  const isLimitReached = (c: Code) => c.maxUses && c.totalUses >= c.maxUses

  // ── Render ──
  return (
    <div className="p-6" style={{ color: 'white' }}>
      {showCreateCode && (
        <CreateCodeModal campaigns={campaigns} onClose={() => setShowCreateCode(false)} onCreated={load} />
      )}
      {showCreateCampaign && (
        <CreateCampaignModal onClose={() => setShowCreateCampaign(false)} onCreated={load} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Referral Yönetimi</h1>
          <p className="text-sm text-white/40 mt-0.5">Kampanya ve kodları yönetin</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCreateCampaign(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-white/60 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
            <Plus size={13} /> Kampanya
          </button>
          <button onClick={() => setShowCreateCode(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.25)' }}>
            <Plus size={13} /> Kod Oluştur
          </button>
        </div>
      </div>

      {/* Tab'lar */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {(['overview', 'campaigns', 'codes'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: tab === t ? 'rgba(99,102,241,0.25)' : 'transparent',
              color: tab === t ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
              border: tab === t ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
            }}>
            {t === 'overview' ? 'Genel Bakış' : t === 'campaigns' ? 'Kampanyalar' : 'Kodlar'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} className="animate-spin text-indigo-400" />
        </div>
      ) : (
        <>
          {/* ─── GENEL BAKIŞ ─── */}
          {tab === 'overview' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Toplam Kod" value={stats.totalCodes} icon={Tag} color="#818cf8" />
                <StatCard label="Aktif Kod" value={stats.activeCodes} icon={Check} color="#22c55e" />
                <StatCard label="Toplam Kullanım" value={stats.totalUses} icon={Users} color="#38bdf8" />
                <StatCard label="Son 30 Gün" value={stats.last30Days} icon={TrendingUp} color="#f97316"
                  sub={`+${stats.last30Days} yeni kullanıcı`} />
              </div>

              {/* Günlük kullanım grafiği */}
              {stats.daily?.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 size={15} className="text-indigo-400" />
                    <span className="text-sm font-semibold text-white">Son 7 Günlük Kullanım</span>
                  </div>
                  <div className="flex items-end gap-2 h-24">
                    {(() => {
                      const max = Math.max(...stats.daily.map((d: any) => d.count), 1)
                      return stats.daily.map((d: any) => (
                        <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[10px] text-white/40">{d.count}</span>
                          <div className="w-full rounded-t-md transition-all"
                            style={{ height: `${(d.count / max) * 72}px`, background: 'rgba(99,102,241,0.5)', minHeight: 4 }} />
                          <span className="text-[9px] text-white/25">
                            {new Date(d.date).toLocaleDateString('tr', { weekday: 'short' })}
                          </span>
                        </div>
                      ))
                    })()}
                  </div>
                </div>
              )}

              {/* En aktif kodlar */}
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span className="text-sm font-semibold text-white">En Çok Kullanılan Kodlar</span>
                </div>
                {[...codes].sort((a, b) => b.totalUses - a.totalUses).slice(0, 5).map((c, i) => (
                  <div key={c.id} className="flex items-center justify-between px-5 py-3"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/25 w-4">{i + 1}</span>
                      <span className="font-mono text-sm font-bold text-white">{c.code}</span>
                      {c.campaign && <Badge color="indigo">{c.campaign.name}</Badge>}
                    </div>
                    <span className="text-sm font-bold text-white/70">{c.totalUses} kullanım</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── KAMPANYALAR ─── */}
          {tab === 'campaigns' && (
            <div className="space-y-3">
              {campaigns.length === 0 && (
                <div className="text-center py-16 text-white/30">
                  <Tag size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Henüz kampanya yok</p>
                </div>
              )}
              {campaigns.map(c => (
                <div key={c.id} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{c.name}</h3>
                        <Badge color={c.isActive ? 'emerald' : 'gray'}>{c.isActive ? 'Aktif' : 'Pasif'}</Badge>
                      </div>
                      {c.description && <p className="text-xs text-white/40 mb-2">{c.description}</p>}
                      <div className="flex items-center gap-4 text-xs text-white/30">
                        <span><Tag size={11} className="inline mr-1" />{c.totalCodes} kod</span>
                        <span><Users size={11} className="inline mr-1" />{c.totalUses} kullanım</span>
                        <span><Calendar size={11} className="inline mr-1" />
                          {new Date(c.createdAt).toLocaleDateString('tr')}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => toggleCampaign(c.id, c.isActive)}
                      className="text-white/40 hover:text-white/80 transition-colors">
                      {c.isActive ? <ToggleRight size={20} className="text-emerald-400" /> : <ToggleLeft size={20} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─── KODLAR ─── */}
          {tab === 'codes' && (
            <div className="space-y-4">
              {/* Filtreler */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kod ara..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }} />
                </div>
                <select value={filterCampaign} onChange={e => setFilterCampaign(e.target.value)}
                  className="px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
                  <option value="">Tüm kampanyalar</option>
                  {campaigns.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              {/* Kod listesi */}
              {filteredCodes.length === 0 && (
                <div className="text-center py-16 text-white/30">
                  <Gift size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Kod bulunamadı</p>
                </div>
              )}
              {filteredCodes.map(c => (
                <div key={c.id} className="rounded-2xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${isExpired(c) || isLimitReached(c) ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.07)'}` }}>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Kod satırı */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-lg font-bold text-white tracking-widest">{c.code}</span>
                          <button onClick={() => copyCode(c.code)}
                            className="text-white/30 hover:text-white/70 transition-colors">
                            {copied === c.code ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          </button>
                          {c.campaign && <Badge color="indigo">{c.campaign.name}</Badge>}
                          {c.rewardBadge && <Badge color="amber"><Gift size={9} className="mr-1 inline" />{c.rewardBadge}</Badge>}
                          {isExpired(c) && <Badge color="red">Süresi Doldu</Badge>}
                          {isLimitReached(c) && <Badge color="red">Limit Doldu</Badge>}
                          {!c.isActive && !isExpired(c) && <Badge color="gray">Pasif</Badge>}
                        </div>

                        {/* İstatistik */}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-2">
                          <UsageBar used={c.totalUses} max={c.maxUses} />
                          <div className="text-xs text-white/30">
                            {c.expiresAt
                              ? isExpired(c)
                                ? <span className="text-red-400">Süresi doldu</span>
                                : `${new Date(c.expiresAt).toLocaleDateString('tr')} tarihine kadar`
                              : 'Süresiz'
                            }
                          </div>
                        </div>

                        <div className="text-[11px] text-white/25">
                          Oluşturulma: {new Date(c.createdAt).toLocaleDateString('tr')}
                        </div>
                      </div>

                      {/* Aksiyon butonları */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => toggleCode(c.id, c.isActive)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-white/[0.07]"
                          title={c.isActive ? 'Pasife Al' : 'Aktife Al'}>
                          {c.isActive ? <ToggleRight size={16} className="text-emerald-400" /> : <ToggleLeft size={16} className="text-white/30" />}
                        </button>
                        <button onClick={() => deleteCode(c.id)}
                          className="p-1.5 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <Trash2 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (expandedCode === c.id) { setExpandedCode(null) }
                            else { setExpandedCode(c.id); loadCodeUsers(c.id) }
                          }}
                          className="p-1.5 rounded-lg text-white/25 hover:text-white/70 transition-all flex items-center gap-1 text-xs">
                          <Users size={13} />
                          <ChevronDown size={11} className={`transition-transform ${expandedCode === c.id ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Kullanıcı listesi */}
                  {expandedCode === c.id && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                      {!codeUsers[c.id] ? (
                        <div className="py-6 flex justify-center">
                          <Loader2 size={16} className="animate-spin text-white/30" />
                        </div>
                      ) : codeUsers[c.id].length === 0 ? (
                        <p className="py-6 text-center text-xs text-white/25">Henüz kullanım yok</p>
                      ) : (
                        <div>
                          <div className="px-4 py-2.5 flex items-center gap-2"
                            style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <Users size={12} className="text-white/30" />
                            <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                              {codeUsers[c.id].length} Kullanıcı
                            </span>
                          </div>
                          {codeUsers[c.id].map(u => (
                            <div key={u.user.id} className="flex items-center justify-between px-4 py-3"
                              style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0"
                                  style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.2)' }}>
                                  {u.user.avatarUrl
                                    ? <img src={u.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-indigo-400">
                                        {(u.user.fullName || u.user.username).charAt(0).toUpperCase()}
                                      </div>
                                  }
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-white">{u.user.fullName || u.user.username}</p>
                                  <p className="text-[10px] text-white/35">@{u.user.username} · {u.user._count.reviews} yorum</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-white/30">
                                  {new Date(u.usedAt).toLocaleDateString('tr')}
                                </p>
                                {u.rewardGiven && (
                                  <Badge color="amber"><Shield size={8} className="inline mr-0.5" />Rozet verildi</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
