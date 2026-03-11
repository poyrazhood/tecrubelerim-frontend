'use client'
import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Building2, ChevronRight, Check, Loader2, AlertTriangle, Phone, Globe, Mail, MapPin, Edit3, Camera, X, Save, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '')
const getToken = () => typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token')) : null

export default function SahipPaneliPage() {
  const [myBusinesses, setMyBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [claimQuery, setClaimQuery] = useState('')
  const [claimResults, setClaimResults] = useState<any[]>([])
  const [claimSearching, setClaimSearching] = useState(false)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [claimMsg, setClaimMsg] = useState<string | null>(null)
  const [photoUploading, setPhotoUploading] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) return
    fetch(`${API}/api/users/me/businesses`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(d => { setMyBusinesses(Array.isArray(d) ? d : d.businesses || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const searchClaim = async () => {
    if (!claimQuery.trim()) return
    setClaimSearching(true)
    const r = await fetch(`${API}/api/businesses?search=${encodeURIComponent(claimQuery)}&limit=10`)
    const d = await r.json()
    const results = Array.isArray(d) ? d : Array.isArray(d.businesses) ? d.businesses : Array.isArray(d.data) ? d.data : []
    setClaimResults(results)
    if (results.length === 0) setClaimMsg("Sonuç bulunamadı.")
    setClaimSearching(false)
  }

  const handleClaim = async (b: any) => {
    const token = getToken()
    if (!token) { setClaimMsg("Sahiplik talebi için giriş yapmanız gerekiyor."); return }
    setClaiming(b.id)
    setClaimMsg(null)
    const res = await fetch(`${API}/api/businesses/${b.id}/claim`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    const d = await res.json()
    setClaimMsg(res.ok ? '✓ Talebiniz alındı, inceleme sonrası bildirim alacaksınız.' : d.error || 'Hata oluştu.')
    setClaiming(null)
    if (res.ok) setClaimResults([])
  }

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    const token = getToken()
    const res = await fetch(`${API}/api/businesses/${selected.slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form)
    })
    const d = await res.json()
    if (res.ok) {
      setSelected(d.business)
      setMyBusinesses(prev => prev.map(x => x.id === d.business.id ? d.business : x))
      setSaveMsg('Kaydedildi!')
      setEditing(false)
    } else {
      setSaveMsg(d.error || 'Kaydetme başarısız.')
    }
    setSaving(false)
    setTimeout(() => setSaveMsg(null), 3000)
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f || !selected) return
    setPhotoUploading(true)
    const fd = new FormData()
    fd.append('file', f)
    const token = getToken()
    const res = await fetch(`${API}/api/upload/business`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd
    })
    if (res.ok) {
      const d = await res.json()
      const updated = { ...selected, coverPhoto: d.url }
      setSelected(updated)
      setMyBusinesses(prev => prev.map(x => x.id === selected.id ? updated : x))
    }
    setPhotoUploading(false)
  }

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-2xl font-black text-white mb-1">Sahip Paneli</h1>
        <p className="text-sm text-white/40 mb-6">İşletmenizi yönetin veya sahiplik talep edin</p>

        {selected ? (
          <div>
            <button onClick={() => { setSelected(null); setEditing(false) }} className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white mb-5 transition-colors">
              <X size={14} /> Geri
            </button>

            {/* Cover + photo upload */}
            <div className="relative rounded-2xl overflow-hidden bg-surface-2 border border-white/[0.07] mb-4 h-36">
              {selected.coverPhoto ? (
                <img src={selected.coverPhoto} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 size={36} className="text-white/10" />
                </div>
              )}
              <label className="absolute bottom-3 right-3 cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-sm border border-white/20 text-xs text-white font-medium hover:bg-black/70 transition-colors">
                  {photoUploading ? <Loader2 size={11} className="animate-spin" /> : <Camera size={11} />}
                  Fotoğraf Değiştir
                </div>
              </label>
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className={cn(
                'text-xs font-bold px-2.5 py-1 rounded-full border',
                selected.claimStatus === 'CLAIMED' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                selected.claimStatus === 'PENDING' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                'bg-white/[0.05] text-white/40 border-white/10'
              )}>
                {selected.claimStatus === 'CLAIMED' ? '✓ Doğrulandı' : selected.claimStatus === 'PENDING' ? '⏳ İnceleniyor' : 'Doğrulanmamış'}
              </span>
              {selected.isVerified && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">✓ Verified</span>}
            </div>

            {/* Form */}
            <div className="bg-surface-1 border border-white/[0.07] rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-white">İşletme Bilgileri</span>
                {!editing ? (
                  <button onClick={() => { setEditing(true); setForm({ name: selected.name, address: selected.address, city: selected.city, district: selected.district, description: selected.description, phoneNumber: selected.phoneNumber, email: selected.email, website: selected.website }) }}
                    className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                    <Edit3 size={12} /> Düzenle
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500 text-white text-xs font-bold disabled:opacity-50">
                      {saving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />} Kaydet
                    </button>
                    <button onClick={() => setEditing(false)} className="px-3 py-1 rounded-lg bg-white/[0.05] text-white/40 text-xs">İptal</button>
                  </div>
                )}
              </div>
              {saveMsg && <div className={cn('text-xs mb-3 font-medium', saveMsg.startsWith('K') ? 'text-emerald-400' : 'text-red-400')}>{saveMsg}</div>}
              <div className="space-y-3">
                {[
                  { key: 'name', label: 'İşletme Adı', icon: Building2 },
                  { key: 'phoneNumber', label: 'Telefon', icon: Phone },
                  { key: 'email', label: 'E-posta', icon: Mail },
                  { key: 'website', label: 'Website', icon: Globe },
                  { key: 'address', label: 'Adres', icon: MapPin },
                  { key: 'city', label: 'Şehir', icon: MapPin },
                  { key: 'district', label: 'İlçe', icon: MapPin },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key}>
                    <div className="flex items-center gap-1.5 text-[10px] text-white/30 uppercase tracking-wider mb-1">
                      <Icon size={9} /> {label}
                    </div>
                    {editing ? (
                      <input value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })}
                        className="w-full bg-surface-2 border border-indigo-500/30 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/60" />
                    ) : (
                      <div className="text-sm text-white/70">{(selected as any)[key] || <span className="text-white/20 italic">Belirtilmemiş</span>}</div>
                    )}
                  </div>
                ))}
                <div>
                  <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Açıklama</div>
                  {editing ? (
                    <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                      className="w-full bg-surface-2 border border-indigo-500/30 rounded-xl px-3 py-2 text-sm text-white outline-none resize-none focus:border-indigo-500/60" />
                  ) : (
                    <div className="text-sm text-white/70 leading-relaxed">{selected.description || <span className="text-white/20 italic">Açıklama yok</span>}</div>
                  )}
                </div>
              </div>
            </div>

            <Link href={`/isletme/${selected.slug}`} className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-white/[0.05] border border-white/[0.08] text-sm text-white/60 hover:text-white hover:bg-white/[0.08] transition-all">
              İşletme Sayfasına Git <ChevronRight size={14} />
            </Link>
          </div>
        ) : (
          <div>
            {/* My businesses */}
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-white/30" /></div>
            ) : myBusinesses.length > 0 ? (
              <div className="mb-8">
                <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">İşletmelerim</div>
                {myBusinesses.map(b => (
                  <button key={b.id} onClick={() => setSelected(b)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl border border-white/[0.07] bg-surface-1 hover:bg-surface-2 hover:border-indigo-500/30 transition-all text-left mb-2">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {b.coverPhoto ? <img src={b.coverPhoto} alt="" className="w-full h-full object-cover" /> : <Building2 size={20} className="text-indigo-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-white truncate">{b.name}</div>
                      <div className="text-xs text-white/40">{b.district || b.city}</div>
                    </div>
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full',
                      b.claimStatus === 'CLAIMED' ? 'bg-emerald-500/15 text-emerald-400' :
                      b.claimStatus === 'PENDING' ? 'bg-amber-500/15 text-amber-400' : 'bg-white/[0.05] text-white/30'
                    )}>
                      {b.claimStatus === 'CLAIMED' ? 'Doğrulandı' : b.claimStatus === 'PENDING' ? 'Bekliyor' : 'Taslak'}
                    </span>
                    <ChevronRight size={14} className="text-white/20 flex-shrink-0" />
                  </button>
                ))}
              </div>
            ) : null}

            {/* Claim section */}
            <div className="bg-surface-1 border border-white/[0.07] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Building2 size={16} className="text-indigo-400" />
                <span className="text-sm font-bold text-white">İşletmenizi Sahiplenin</span>
              </div>
              <p className="text-xs text-white/40 mb-4">Listede işletmenizi arayın ve sahiplik talep edin.</p>
              <div className="flex gap-2 mb-3">
                <input value={claimQuery} onChange={e => setClaimQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchClaim()}
                  placeholder="İşletme adı..."
                  className="flex-1 bg-surface-2 border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/40" />
                <button onClick={searchClaim} disabled={claimSearching}
                  className="px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 transition-colors disabled:opacity-50">
                  {claimSearching ? <Loader2 size={14} className="animate-spin" /> : 'Ara'}
                </button>
              </div>
              {claimMsg && (
                <div className={cn('text-xs font-medium mb-3 p-2.5 rounded-xl', claimMsg.startsWith('✓') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')}>
                  {claimMsg}
                </div>
              )}
              {claimResults.map(b => (
                <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-surface-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{b.name}</div>
                    <div className="text-xs text-white/40">{b.district || b.city}</div>
                  </div>
                  {b.claimStatus === 'CLAIMED' ? (
                    <span className="text-xs text-white/30 italic">Sahiplenilmiş</span>
                  ) : b.claimStatus === 'PENDING' ? (
                    <span className="flex items-center gap-1 text-xs text-amber-400"><Clock size={11} /> Bekliyor</span>
                  ) : (
                    <button onClick={() => handleClaim(b)} disabled={claiming === b.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 transition-colors disabled:opacity-50">
                      {claiming === b.id ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Talep Et
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}