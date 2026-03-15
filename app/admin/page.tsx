'use client'
import ReferralAdminPanel from '@/components/admin/ReferralAdminPanel'
import React, { useState, useEffect, useCallback } from 'react'
import {
  Building2, Users, MessageSquare, CheckCircle, XCircle, Loader2,
  Search, Ban, ChevronLeft, ChevronRight, Star, AlertTriangle,
  Trash2, Eye, Shield, Flag, Clock, Filter, RefreshCw
, Settings, ShoppingBag, Gift, Plus, Image, ToggleLeft, ToggleRight, Edit2, Package } from 'lucide-react'
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
  HARASSMENT: 'Taciz', COPYRIGHT: 'Telif Hakkı', OTHER: 'DiÄŸer'
}
const REASON_COLOR: Record<string, string> = {
  SPAM: 'bg-orange-500/15 text-orange-400',
  INAPPROPRIATE: 'bg-red-500/15 text-red-400',
  FAKE_REVIEW: 'bg-pink-500/15 text-pink-400',
  HARASSMENT: 'bg-red-600/15 text-red-500',
  COPYRIGHT: 'bg-yellow-500/15 text-yellow-400',
  OTHER: 'bg-white/[0.06] text-white/40'
}

function UpgradeRequestsSection({ apiBase }: { apiBase: string }) {
  const [requests, setRequests] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [statusFilter, setStatusFilter] = React.useState('PENDING')
  const [updating, setUpdating] = React.useState<string|null>(null)

  const STATUS_COLORS: Record<string,string> = {
    PENDING: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    CONTACTED: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    COMPLETED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    REJECTED: 'text-red-400 bg-red-500/10 border-red-500/20',
  }
  const PLAN_COLORS: Record<string,string> = {
    FREE: 'text-white/40', PROFESSIONAL: 'text-blue-400', PREMIUM: 'text-amber-400', ENTERPRISE: 'text-purple-400'
  }

  const load = async () => {
    setLoading(true)
    const token = localStorage.getItem('auth_token')
    const res = await fetch(`${apiBase}/api/subscriptions/admin/requests?status=${statusFilter}`, {
      headers: { Authorization: `Bearer ${token}`, 'x-admin-secret': 'tecrube_admin_2026' }
    })
    const d = await res.json()
    setRequests(d.requests || [])
    setLoading(false)
  }

  React.useEffect(() => { load() }, [statusFilter])

  const handleStatus = async (id: string, status: string) => {
    setUpdating(id)
    const token = localStorage.getItem('auth_token')
    await fetch(`${apiBase}/api/subscriptions/admin/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'x-admin-secret': 'tecrube_admin_2026' },
      body: JSON.stringify({ status })
    })
    setUpdating(null)
    load()
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {['PENDING','CONTACTED','COMPLETED','REJECTED'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${statusFilter === s ? STATUS_COLORS[s] + ' border' : 'text-white/30 hover:text-white bg-white/[0.03]'}`}>
            {s === 'PENDING' ? 'Bekleyen' : s === 'CONTACTED' ? 'Aranıldı' : s === 'COMPLETED' ? 'Tamamlandi' : 'Reddedildi'}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="text-white/25 text-xs text-center py-4">Yukleniyor...</div>
      ) : requests.length === 0 ? (
        <div className="text-white/25 text-xs text-center py-4">Talep yok</div>
      ) : requests.map((req: any) => (
        <div key={req.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-bold text-sm text-white">{req.businessName}</div>
              <div className="text-xs text-white/40 mt-0.5">{req.fullName || req.username} Â· {req.email}</div>
              {req.phone && <div className="text-xs text-indigo-300 mt-0.5 font-bold">ğŸ“ {req.phone}</div>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${PLAN_COLORS[req.planWanted]}`}>{req.planWanted}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${STATUS_COLORS[req.status]}`}>{req.status}</span>
            </div>
          </div>
          {req.note && <div className="text-[11px] text-white/30 italic bg-white/[0.02] rounded-lg px-2 py-1">{req.note}</div>}
          <div className="text-[10px] text-white/20">{new Date(req.createdAt).toLocaleString('tr-TR')}</div>
          {req.status === 'PENDING' && (
            <div className="flex gap-1.5 pt-1">
              <button onClick={() => handleStatus(req.id, 'CONTACTED')} disabled={updating === req.id}
                className="flex-1 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-[11px] font-bold border border-blue-500/20 hover:bg-blue-500/20 disabled:opacity-40 transition-all">
                Arandı âœ“
              </button>
              <button onClick={() => handleStatus(req.id, 'COMPLETED')} disabled={updating === req.id}
                className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20 hover:bg-emerald-500/20 disabled:opacity-40 transition-all">
                Tamamlandi âœ“
              </button>
              <button onClick={() => handleStatus(req.id, 'REJECTED')} disabled={updating === req.id}
                className="flex-1 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-[11px] font-bold border border-red-500/20 hover:bg-red-500/15 disabled:opacity-40 transition-all">
                Reddet
              </button>
            </div>
          )}
          {req.status === 'CONTACTED' && (
            <button onClick={() => handleStatus(req.id, 'COMPLETED')} disabled={updating === req.id}
              className="w-full py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20 hover:bg-emerald-500/20 disabled:opacity-40 transition-all">
              Tamamlandi olarak isaretle
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Market Tab ───────────────────────────────────────────────────────────────
function MarketTab({ apiBase }: { apiBase: string }) {
  const [items, setItems] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<any>(null)
  const [showForm, setShowForm] = React.useState(false)
  const [form, setForm] = React.useState({
    name: '', description: '', pointCost: 100, category: 'BADGE',
    imageUrl: '', stock: -1, isActive: true
  })

  const CATEGORIES = [
    { key: 'BADGE', label: 'Rozet' },
    { key: 'COUPON', label: 'Kupon / İndirim' },
    { key: 'FEATURE', label: 'Özellik' },
    { key: 'DONATION', label: 'Bağış' },
  ]
  const CAT_COLORS: Record<string, string> = {
    BADGE: 'bg-indigo-500/15 text-indigo-400',
    COUPON: 'bg-emerald-500/15 text-emerald-400',
    FEATURE: 'bg-amber-500/15 text-amber-400',
    DONATION: 'bg-pink-500/15 text-pink-400',
  }

  const load = async () => {
    setLoading(true)
    try {
      const r = await fetch(`${apiBase}/api/admin/market-items`, { headers: getH() })
      const d = await r.json()
      setItems(Array.isArray(d) ? d : (d.items || []))
    } catch { setItems([]) }
    setLoading(false)
  }

  React.useEffect(() => { load() }, [])

  const resetForm = () => setForm({ name: '', description: '', pointCost: 100, category: 'BADGE', imageUrl: '', stock: -1, isActive: true })

  const openNew = () => { resetForm(); setEditingItem(null); setShowForm(true) }
  const openEdit = (item: any) => {
    setForm({ name: item.name, description: item.description || '', pointCost: item.pointCost, category: item.category, imageUrl: item.imageUrl || '', stock: item.stock ?? -1, isActive: item.isActive })
    setEditingItem(item)
    setShowForm(true)
  }

  const save = async () => {
    if (!form.name || !form.pointCost) return
    setSaving(true)
    try {
      const url = editingItem ? `${apiBase}/api/admin/market-items/${editingItem.id}` : `${apiBase}/api/admin/market-items`
      const method = editingItem ? 'PUT' : 'POST'
      await fetch(url, { method, headers: getH(), body: JSON.stringify(form) })
      await load()
      setShowForm(false)
      resetForm()
    } catch(e) { console.error(e) }
    setSaving(false)
  }

  const del = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return
    try {
      await fetch(`${apiBase}/api/admin/market-items/${id}`, { method: 'DELETE', headers: getH() })
      await load()
    } catch(e) { console.error(e) }
  }

  const toggleActive = async (item: any) => {
    try {
      await fetch(`${apiBase}/api/admin/market-items/${item.id}`, {
        method: 'PUT', headers: getH(),
        body: JSON.stringify({ ...item, isActive: !item.isActive })
      })
      await load()
    } catch(e) { console.error(e) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black">Tecrübe Pazarı</h2>
          <p className="text-sm text-white/40 mt-1">Kullanıcıların TP harcayarak alabileceği ödülleri yönetin</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-semibold hover:bg-indigo-500/30 transition-all">
          <Plus size={15} /> Yeni Ürün
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#13131f] border border-white/[0.1] rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-lg mb-5">{editingItem ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Ürün Adı *</label>
                <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
                  placeholder="Örn: Altın Rozet" />
              </div>

              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Açıklama</label>
                <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))}
                  rows={2} className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 resize-none"
                  placeholder="Ürün açıklaması..." />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Puan Maliyeti (TP) *</label>
                  <input type="number" value={form.pointCost} onChange={e => setForm(p => ({...p, pointCost: parseInt(e.target.value) || 0}))}
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Stok (-1 = sınırsız)</label>
                  <input type="number" value={form.stock} onChange={e => setForm(p => ({...p, stock: parseInt(e.target.value)}))}
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50" />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Kategori</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(c => (
                    <button key={c.key} onClick={() => setForm(p => ({...p, category: c.key}))}
                      className={cn('px-3 py-2 rounded-xl text-xs font-medium border transition-all',
                        form.category === c.key ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/70'
                      )}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Görsel URL</label>
                <input value={form.imageUrl} onChange={e => setForm(p => ({...p, imageUrl: e.target.value}))}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
                  placeholder="https://..." />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-sm text-white/60">Aktif</span>
                <button onClick={() => setForm(p => ({...p, isActive: !p.isActive}))}
                  className={cn('w-10 h-6 rounded-full transition-all relative', form.isActive ? 'bg-indigo-500' : 'bg-white/[0.1]')}>
                  <span className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all', form.isActive ? 'left-4' : 'left-0.5')} />
                </button>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={save} disabled={saving || !form.name}
                className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-bold disabled:opacity-40 hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2">
                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                {editingItem ? 'Güncelle' : 'Ekle'}
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl bg-white/[0.06] text-white/50 text-sm font-medium hover:bg-white/[0.1]">
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ürün listesi */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-white/30" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/[0.1] rounded-2xl">
          <Package size={40} className="mx-auto mb-3 text-white/20" />
          <div className="text-white/40 text-sm mb-1">Henüz ürün yok</div>
          <div className="text-white/25 text-xs mb-4">İlk ödülü ekleyin</div>
          <button onClick={openNew} className="px-4 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium">
            Ürün Ekle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((item: any) => (
            <div key={item.id} className={cn('rounded-2xl border p-4 transition-all', item.isActive ? 'border-white/[0.08] bg-white/[0.02]' : 'border-white/[0.04] bg-white/[0.01] opacity-60')}>
              <div className="flex items-start gap-3">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <Gift size={20} className="text-indigo-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-white truncate">{item.name}</span>
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0', CAT_COLORS[item.category] || 'bg-white/10 text-white/40')}>
                      {CATEGORIES.find(c => c.key === item.category)?.label}
                    </span>
                  </div>
                  {item.description && <p className="text-xs text-white/40 mb-2 truncate">{item.description}</p>}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-amber-400">{item.pointCost} TP</span>
                    <span className="text-xs text-white/30">{item.stock === -1 ? 'Sınırsız stok' : `${item.stock} adet`}</span>
                    <span className="text-xs text-white/30">{item.totalRedeemed || 0} kez alındı</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.05]">
                <button onClick={() => toggleActive(item)}
                  className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                    item.isActive ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25' : 'bg-white/[0.05] text-white/30 hover:bg-white/[0.1]'
                  )}>
                  {item.isActive ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                  {item.isActive ? 'Aktif' : 'Pasif'}
                </button>
                <button onClick={() => openEdit(item)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/[0.05] text-white/50 hover:bg-white/[0.1] hover:text-white transition-all">
                  <Edit2 size={12} /> Düzenle
                </button>
                <button onClick={() => del(item.id)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all ml-auto">
                  <Trash2 size={12} /> Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SubscriptionsTab({ apiBase }: { apiBase: string }) {
  const [subs, setSubs] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [planFilter, setPlanFilter] = React.useState('ALL')
  const [search, setSearch] = React.useState('')
  const [upgradeModal, setUpgradeModal] = React.useState<any>(null)
  const [selectedPlan, setSelectedPlan] = React.useState('PROFESSIONAL')
  const [notes, setNotes] = React.useState('')
  const [saving, setSaving] = React.useState(false)

  const PLANS = ['FREE','PROFESSIONAL','PREMIUM','ENTERPRISE']
  const PLAN_COLORS: Record<string,string> = {
    FREE: 'text-white/40 bg-white/[0.05] border-white/10',
    PROFESSIONAL: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    PREMIUM: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    ENTERPRISE: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  }
  const PLAN_PRICES: Record<string,string> = { FREE:'0â‚º', PROFESSIONAL:'99â‚º/ay', PREMIUM:'299â‚º/ay', ENTERPRISE:'999â‚º/ay' }

  const load = async () => {
    setLoading(true)
    const token = localStorage.getItem('auth_token')
    const planQ = planFilter !== 'ALL' ? `&plan=${planFilter}` : ''
    const res = await fetch(`${apiBase}/api/subscriptions/admin/list?status=ACTIVE${planQ}`, {
      headers: { Authorization: `Bearer ${token}`, 'x-admin-secret': 'tecrube_admin_2026' }
    })
    const d = await res.json()
    setSubs(d.subs || [])
    setLoading(false)
  }

  React.useEffect(() => { load() }, [planFilter])

  const handleUpgrade = async () => {
    if (!upgradeModal) return
    setSaving(true)
    const token = localStorage.getItem('auth_token')
    await fetch(`${apiBase}/api/subscriptions/business/${upgradeModal.id}/upgrade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'x-admin-secret': 'tecrube_admin_2026' },
      body: JSON.stringify({ plan: selectedPlan, notes })
    })
    setSaving(false)
    setUpgradeModal(null)
    setNotes('')
    load()
  }

  const handleCancel = async (businessId: string) => {
    const token = localStorage.getItem('auth_token')
    await fetch(`${apiBase}/api/subscriptions/business/${businessId}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'x-admin-secret': 'tecrube_admin_2026' }
    })
    load()
  }

  const filtered = subs.filter(s => !search || s.business?.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-4">
      {/* Filtreler */}
      <div className="flex gap-2 flex-wrap">
        {['ALL',...PLANS].map(p => (
          <button key={p} onClick={() => setPlanFilter(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${planFilter === p ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-white/40 hover:text-white bg-white/[0.03]'}`}>
            {p === 'ALL' ? 'Tumu' : p}
          </button>
        ))}
      </div>

      {/* Arama + Yeni Abonelik */}
      <div className="flex gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Isletme ara..."
          className="flex-1 bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/40" />
        <button onClick={() => setUpgradeModal({ id: '', name: 'Yeni' })}
          className="px-4 py-2 rounded-xl bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 transition-all">
          + Abonelik Ekle
        </button>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="text-white/30 text-sm text-center py-8">Yukleniyor...</div>
      ) : filtered.length === 0 ? (
        <div className="text-white/30 text-sm text-center py-8">Abonelik bulunamadi</div>
      ) : filtered.map((sub: any) => (
        <div key={sub.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-white truncate">{sub.business?.name}</div>
            <div className="text-xs text-white/40 mt-0.5">{sub.business?.city} Â· {new Date(sub.endsAt).toLocaleDateString('tr-TR')} tarihine kadar</div>
            {sub.notes && <div className="text-[11px] text-white/25 mt-1 italic">{sub.notes}</div>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${PLAN_COLORS[sub.plan]}`}>{sub.plan}</span>
            <span className="text-xs text-white/30">{PLAN_PRICES[sub.plan]}</span>
            <button onClick={() => { setUpgradeModal(sub.business); setSelectedPlan(sub.plan) }}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-[11px] font-bold border border-indigo-500/20 hover:bg-indigo-500/20 transition-all">
              Duzenle
            </button>
            <button onClick={() => handleCancel(sub.businessId)}
              className="px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-[11px] font-bold border border-red-500/20 hover:bg-red-500/15 transition-all">
              Iptal
            </button>
          </div>
        </div>
      ))}

      {/* Upgrade Modal */}
      {upgradeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12121a] border border-white/[0.1] rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="font-black text-white">Plan Ata / Guncelle</div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Isletme ID</label>
              <input value={upgradeModal.id || ''} onChange={e => setUpgradeModal((m: any) => ({...m, id: e.target.value}))}
                placeholder="Business ID girin"
                className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/40" />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-2 block">Plan Sec</label>
              <div className="grid grid-cols-2 gap-2">
                {PLANS.map(p => (
                  <button key={p} onClick={() => setSelectedPlan(p)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${selectedPlan === p ? PLAN_COLORS[p] : 'text-white/30 bg-white/[0.03] border-white/[0.07]'}`}>
                    <div>{p}</div>
                    <div className="text-[10px] font-normal opacity-70 mt-0.5">{PLAN_PRICES[p]}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Not (opsiyonel)</label>
              <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Odeme referansi, aciklama..."
                className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/40" />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={handleUpgrade} disabled={saving || !upgradeModal.id}
                className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 disabled:opacity-40 transition-all">
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              <button onClick={() => { setUpgradeModal(null); setNotes('') }}
                className="px-4 py-2.5 rounded-xl bg-white/[0.06] text-white/50 text-sm hover:bg-white/[0.1] transition-all">
                Iptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Yukseltme Talepleri */}
      <div className="mt-6">
        <div className="text-xs text-white/30 font-bold uppercase tracking-wider px-1 mb-3">Yukseltme Talepleri</div>
        <UpgradeRequestsSection apiBase={apiBase} />
      </div>
    </div>
  )
}



function PendingBusinessSection({ apiBase }: { apiBase: string }) {
  const [businesses, setBusinesses] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [acting, setActing] = React.useState<string|null>(null)

  const load = async () => {
    setLoading(true)
    const r = await fetch(`${apiBase}/businesses/pending?secret=tecrube_admin_2026`)
    const d = await r.json()
    setBusinesses(d.businesses || [])
    setLoading(false)
  }

  React.useEffect(() => { load() }, [])

  async function approve(id: string) {
    setActing(id)
    await fetch(`${apiBase}/businesses/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: 'tecrube_admin_2026' })
    })
    await load()
    setActing(null)
  }

  async function reject(id: string) {
    setActing(id)
    await fetch(`${apiBase}/businesses/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: 'tecrube_admin_2026' })
    })
    await load()
    setActing(null)
  }

  if (loading) return <div className="p-6 text-white/40 text-sm">Yükleniyor...</div>

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-black text-white">Bekleyen İşletmeler</h2>
          <p className="text-sm text-white/40">{businesses.length} işletme onay bekliyor</p>
        </div>
        <button onClick={load} className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-white/40 hover:text-white transition-colors">
          <RefreshCw size={14} />
        </button>
      </div>
      {businesses.length === 0 ? (
        <div className="text-center py-12 text-white/25">
          <CheckCircle size={32} className="mx-auto mb-3 opacity-30" />
          <p>Bekleyen işletme yok</p>
        </div>
      ) : (
        <div className="space-y-3">
          {businesses.map(biz => (
            <div key={biz.id} className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm">{biz.name}</div>
                  <div className="text-xs text-white/40 mt-0.5">
                    {biz.category?.name} Â· {biz.city} {biz.district && `/ ${biz.district}`}
                  </div>
                  <div className="text-xs text-white/30 mt-0.5">{biz.address}</div>
                  {biz.owner && <div className="text-xs text-indigo-400 mt-1">@{biz.owner.username}</div>}
                  <div className="text-[10px] text-white/20 mt-1">{new Date(biz.createdAt).toLocaleDateString('tr-TR')}</div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => approve(biz.id)} disabled={acting === biz.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-xs font-bold hover:bg-emerald-500/25 transition-all disabled:opacity-50">
                    <CheckCircle size={12} /> Onayla
                  </button>
                  <button onClick={() => reject(biz.id)} disabled={acting === biz.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/25 text-xs font-bold hover:bg-red-500/25 transition-all disabled:opacity-50">
                    <XCircle size={12} /> Reddet
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
function ThemeSection() {
  const [active, setActive] = useState(() => {
    if (typeof window === 'undefined') return 'indigo'
    return localStorage.getItem('app_theme') || 'indigo'
  })
  const [saved, setSaved] = useState(false)
  const THEMES = [
    { id:'indigo', label:'Indigo (Mevcut)', primary:'#6366F1', colors:['#6366F1','#818CF8','#4F46E5','#3730A3'], bg:'#0f0f1a' },
    { id:'emerald', label:'Emerald Green',  primary:'#10B981', colors:['#10B981','#34D399','#059669','#047857'], bg:'#0a1410' },
    { id:'amber',   label:'Amber',          primary:'#F59E0B', colors:['#F59E0B','#FBBF24','#D97706','#92400E'], bg:'#140f00' },
    { id:'rose',    label:'Rose',           primary:'#F43F5E', colors:['#F43F5E','#FB7185','#E11D48','#9F1239'], bg:'#140008' },
  ]
  function apply(id: string) {
    setActive(id)
    const th = THEMES.find(x => x.id === id)
    if (!th) return
    document.documentElement.setAttribute('data-theme', id)
    localStorage.setItem('app_theme', id)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }
  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-lg font-black text-white mb-1">Tema ve Renk Ayarları</h2>
        <p className="text-sm text-white/40">Uygulamanın ana renk temasını seçin</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {THEMES.map((th, idx) => (
          <button key={th.id} onClick={() => apply(th.id)}
            className={`relative p-4 rounded-2xl border-2 transition-all text-left ${active === th.id ? 'border-white/30 bg-white/[0.07]' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]'}`}>
            {active === th.id && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle size={12} className="text-white" />
              </div>
            )}
            <div className="rounded-xl p-3 mb-3 border border-white/[0.08]" style={{ background: th.bg }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: th.primary }}>
                  <Star size={10} className="text-white fill-white" />
                </div>
                <span className="text-xs font-black text-white">Tecrübelerim</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold ml-1" style={{ background: th.primary + '33', border: '1px solid ' + th.primary + '55', color: th.primary }}>BETA</span>
              </div>
              <div className="h-5 rounded-lg mb-1.5 bg-white/[0.06] border border-white/[0.05] flex items-center px-2">
                <span className="text-[9px] text-white/25">Kafe ara...</span>
              </div>
              <div className="text-[9px] text-white/30 mb-1.5">Navigasyon rengi</div>
              <div className="flex gap-1">
                {th.colors.map((c, i) => <div key={i} className="w-4 h-4 rounded-full border border-white/10" style={{ background: c }} />)}
              </div>
            </div>
            <div className="text-xs font-bold" style={{ color: active === th.id ? th.primary : 'rgba(255,255,255,0.6)' }}>
              {idx + 1} â€” {th.label}
            </div>
          </button>
        ))}
      </div>
      {saved && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-sm font-medium">
          <CheckCircle size={14} /> Tema uygulandı!
        </div>
      )}
    </div>
  )
}
function MuhtarTab({ apiBase }: { apiBase: string }) {
  const [apps, setApps] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [statusFilter, setStatusFilter] = React.useState('PENDING')
  const [actionLoading, setActionLoading] = React.useState<string|null>(null)
  const [adminNote, setAdminNote] = React.useState<Record<string,string>>({})

  const load = async () => {
    setLoading(true)
    const token = localStorage.getItem('auth_token')
    const res = await fetch(`${apiBase}/api/muhtar/admin/list?status=${statusFilter}`, {
      headers: { Authorization: `Bearer ${token}`, 'x-admin-secret': 'tecrube_admin_2026' }
    })
    const d = await res.json()
    setApps(d.apps || [])
    setLoading(false)
  }

  React.useEffect(() => { load() }, [statusFilter])

  const handleAction = async (id: string, action: 'APPROVED'|'REJECTED') => {
    setActionLoading(id)
    const token = localStorage.getItem('auth_token')
    await fetch(`${apiBase}/api/muhtar/admin/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'x-admin-secret': 'tecrube_admin_2026' },
      body: JSON.stringify({ action, adminNote: adminNote[id] || '' })
    })
    setActionLoading(null)
    load()
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['PENDING','APPROVED','REJECTED'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === s ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-white/40 hover:text-white bg-white/[0.03]'}`}>
            {s === 'PENDING' ? 'Bekleyen' : s === 'APPROVED' ? 'Onaylanan' : 'Reddedilen'}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="text-white/30 text-sm text-center py-8">Yukleniyor...</div>
      ) : apps.length === 0 ? (
        <div className="text-white/30 text-sm text-center py-8">Basvuru yok</div>
      ) : apps.map((app: any) => (
        <div key={app.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-bold text-sm text-white">{app.user?.fullName || app.user?.username}</div>
              <div className="text-xs text-white/40 mt-0.5">{app.user?.totalReviews} yorum Â· TrustScore: {app.user?.trustScore} Â· {app.user?.trustLevel}</div>
              <div className="text-xs text-indigo-300 mt-1">{app.neighborhood}, {app.district} / {app.city}</div>
            </div>
            <div className={`text-[10px] font-bold px-2 py-1 rounded-lg ${app.status === 'PENDING' ? 'bg-amber-500/15 text-amber-400' : app.status === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
              {app.status}
            </div>
          </div>
          <div className="text-xs text-white/50 bg-white/[0.03] rounded-xl p-3 leading-relaxed">{app.reason}</div>
          {app.status === 'PENDING' && (
            <div className="space-y-2">
              <input value={adminNote[app.id] || ''} onChange={e => setAdminNote(n => ({...n, [app.id]: e.target.value}))}
                placeholder="Admin notu (opsiyonel)"
                className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/40" />
              <div className="flex gap-2">
                <button onClick={() => handleAction(app.id, 'APPROVED')} disabled={actionLoading === app.id}
                  className="flex-1 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/20 hover:bg-emerald-500/25 disabled:opacity-40 transition-all">
                  {actionLoading === app.id ? 'Isleniyor...' : 'Onayla (MUHTAR yap)'}
                </button>
                <button onClick={() => handleAction(app.id, 'REJECTED')} disabled={actionLoading === app.id}
                  className="flex-1 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20 hover:bg-red-500/15 disabled:opacity-40 transition-all">
                  Reddet
                </button>
              </div>
            </div>
          )}
          {app.adminNote && <div className="text-[11px] text-white/30 italic">Admin notu: {app.adminNote}</div>}
        </div>
      ))}
    </div>
  )
}

function SiteSettingsTab({ apiBase }: { apiBase: string }) {
  const CONFIGS = [
    { key: 'privacy_policy',   label: 'Gizlilik Politikasi' },
    { key: 'terms_of_service', label: 'Kullanim Kosullari' },
    { key: 'help',             label: 'Yardim' },
  ]
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all(
      CONFIGS.map(c =>
        fetch(`${apiBase}/api/site-config/${c.key}`)
          .then(r => r.json())
          .then(d => ({ key: c.key, value: d.value || '' }))
          .catch(() => ({ key: c.key, value: '' }))
      )
    ).then(results => {
      const map: Record<string, string> = {}
      results.forEach(r => { map[r.key] = r.value })
      setValues(map)
      setLoading(false)
    })
  }, [])

  const save = async (key: string) => {
    setSaving(key)
    await fetch(`${apiBase}/api/admin/site-config/${key}`, {
      method: 'PATCH',
      headers: getH(),
      body: JSON.stringify({ value: values[key] })
    })
    setSaving(null)
    setSaved(key)
    setTimeout(() => setSaved(null), 2000)
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-white/30" /></div>

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black">Site Ayarlari</h2>
      {CONFIGS.map(({ key, label }) => (
        <div key={key} className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-white">{label}</h3>
            <button onClick={() => save(key)} disabled={saving === key}
              className="px-4 py-1.5 rounded-xl bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 disabled:opacity-40 transition-all flex items-center gap-1.5">
              {saving === key ? <Loader2 size={12} className="animate-spin" /> : saved === key ? 'âœ“ Kaydedildi' : 'Kaydet'}
            </button>
          </div>
          <textarea value={values[key] || ''}
            onChange={e => setValues(prev => ({ ...prev, [key]: e.target.value }))}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-indigo-500/50 font-mono"
            rows={10} placeholder={`${label} icerigini buraya yazin...`} />
          <p className="text-[11px] text-white/30 mt-2">Satirlari ayirmak icin Enter kullanin.</p>
        </div>
      ))}
    </div>
  )
}

export default function AdminPage() {
  const [tab, setTab] = useState<'stats'|'reports'|'flagged'|'claims'|'businesses'|'users'|'reviews'|'settings'|'muhtar'|'subscriptions'|'pending'|'theme'|'market'|'referral'>('stats')
  const [stats, setStats] = useState<any>(null)
  const [modStats, setModStats] = useState<any>(null)
  const [pendingBizCount, setPendingBizCount] = React.useState(0)
  const [muhtarPending, setMuhtarPending] = React.useState(0)
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [claimFilter, setClaimFilter] = useState('PENDING')
  const [reportFilter, setReportFilter] = useState('PENDING')

  const loadStats = () => {
    fetch(`${API}/api/businesses/pending?secret=tecrube_admin_2026`)
      .then(r=>r.json()).then(d=>setPendingBizCount((d.businesses||[]).length)).catch(()=>{});
    fetch(`${API}/api/muhtar/admin/list?status=PENDING`, { headers: getH() })
      .then(r=>r.json()).then(d=>setMuhtarPending((d.applications||[]).length)).catch(()=>{});
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
    if (!confirm('Bu yorumu kalıcı olarak silmek istediÄŸinizden emin misiniz?')) return
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
    { key: 'businesses', label: 'İşletmeler',      icon: Building2, badge: stats?.businesses },
    { key: 'users',      label: 'Kullanıcılar',    icon: Users, badge: stats?.users },
    { key: 'reviews',    label: 'Tüm Yorumlar',    icon: MessageSquare, badge: stats?.reviews },
    { key: 'subscriptions', label: 'Abonelikler', icon: Star, badge: stats?.activeSubscriptions },
    { key: 'muhtar',    label: 'Muhtar Basvurulari', icon: Shield, badge: muhtarPending },
    { key: 'pending',    label: 'Bekleyen İşletmeler', icon: Clock,   badge: pendingBizCount },
    { key: 'theme',      label: 'Tema ve Renk',        icon: Settings },
    { key: 'market',     label: 'Tecrübe Pazarı',      icon: ShoppingBag },
    { key: 'referral',   label: 'Referral',             icon: Gift },
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
          {stats && <span className="text-xs text-white/30">{stats.users?.toLocaleString()} kullanıcı Â· {stats.businesses?.toLocaleString()} işletme</span>}
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
              {badge > 0 && <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-red-500 text-white min-w-[18px] text-center animate-pulse">{badge > 99 ? '99+' : badge}</span>}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 max-w-5xl overflow-auto">

          {/* â”€â”€ STATS â”€â”€ */}
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
                  Dikkat gerektiren {(modStats.pendingReports || 0) + (modStats.flaggedReviews || 0) + (modStats.pendingClaims || 0)} öÄŸe var
                </div>
              )}
            </div>
          )}

          {/* â”€â”€ REPORTS â”€â”€ */}
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
                      {f === 'PENDING' ? 'Bekleyen' : f === 'REVIEWING' ? 'İnceleniyor' : f === 'RESOLVED' ? 'Ã‡özüldü' : f === 'DISMISSED' ? 'Reddedildi' : 'Tümü'}
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
                                <span className="text-white/20">â†’</span>
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
                              {actionLoading === r.id ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle size={10} />} Ã‡özüldü
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

          {/* â”€â”€ FLAGGED REVIEWS â”€â”€ */}
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
                            <span className="text-white/25 text-xs">â†’</span>
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

          {/* â”€â”€ CLAIMS â”€â”€ */}
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

          {/* â”€â”€ BUSINESSES â”€â”€ */}
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
                          {b.isVerified && <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">âœ“ DoÄŸrulandı</span>}
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

          {/* â”€â”€ USERS â”€â”€ */}
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

          {/* â”€â”€ ALL REVIEWS â”€â”€ */}
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
                            <span className="text-white/25">â†’</span>
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
                <ChevronLeft size={14} /> Ã–nceki
              </button>
              <span className="text-xs text-white/30">{page} / {totalPages} Â· {total} öÄŸe</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages || loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.05] text-white/50 text-sm disabled:opacity-30 hover:text-white transition-colors">
                Sonraki <ChevronRight size={14} />
              </button>
            </div>
          )}


          {/* â”€â”€ SITE SETTINGS â”€â”€ */}
          {tab === 'subscriptions' && (
            <SubscriptionsTab apiBase={API} />
          )}
          {tab === 'pending' && <PendingBusinessSection apiBase={`${API}/api`} />}
              {tab === 'theme' && <ThemeSection />}
              {tab === 'muhtar' && (
            <MuhtarTab apiBase={API} />
          )}
          {tab === 'settings' && (
            <SiteSettingsTab apiBase={API} />
          )}
          {tab === 'market' && (
            <MarketTab apiBase={API} />
          )}
          {tab === 'referral' && (
            <ReferralAdminPanel />
          )}
        </div>
      </div>
    </div>
  )
}
