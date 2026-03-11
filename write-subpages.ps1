$base = "C:\Users\PC\Desktop\tecrubelerim-frontend\app\profil"

# --- bildirimler ---
New-Item -ItemType Directory -Force -Path "$base\bildirimler" | Out-Null
Set-Content "$base\bildirimler\page.tsx" -Encoding UTF8 -Value @'
'use client'

import React, { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { ArrowLeft, Bell, MessageSquare, Heart, UserPlus, Star, Loader2, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        'relative w-10 h-5 rounded-full transition-all',
        value ? 'bg-indigo-500' : 'bg-white/[0.1]'
      )}
    >
      <div className={cn(
        'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all',
        value ? 'left-5' : 'left-0.5'
      )} />
    </button>
  )
}

function NotifRow({ icon: Icon, label, sub, value, onChange }: {
  icon: React.ElementType; label: string; sub: string; value: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0">
      <div className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center text-white/40">
        <Icon size={14} />
      </div>
      <div className="flex-1">
        <div className="text-sm text-white font-medium">{label}</div>
        <div className="text-xs text-white/35 mt-0.5">{sub}</div>
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  )
}

export default function BildirimlerPage() {
  const router = useRouter()
  const [settings, setSettings] = useState({
    yeniYorum: true,
    yeniTakipci: true,
    yorumBegeni: false,
    yorumCevap: true,
    sistemBildirimleri: true,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const update = (key: string, val: boolean) => setSettings(s => ({ ...s, [key]: val }))

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <AppLayout>
      <div className="pb-6">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06]">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-base font-bold text-white">Bildirim Ayarlari</h1>
        </div>

        <div className="px-4 pt-5 space-y-4">
          <div className="rounded-2xl border border-white/[0.07] bg-surface-2 p-4">
            <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Sosyal</h2>
            <NotifRow icon={UserPlus}     label="Yeni Takipci"    sub="Biri sizi takip ettiginde"        value={settings.yeniTakipci}   onChange={v => update('yeniTakipci', v)} />
            <NotifRow icon={Heart}        label="Yorum Begeni"    sub="Yorumunuz faydali bulundugunda"   value={settings.yorumBegeni}   onChange={v => update('yorumBegeni', v)} />
            <NotifRow icon={MessageSquare} label="Yorum Cevabi"   sub="Yorumunuza cevap verildiginde"    value={settings.yorumCevap}    onChange={v => update('yorumCevap', v)} />
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-surface-2 p-4">
            <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Sistem</h2>
            <NotifRow icon={Star} label="Isletme Guncellemeleri" sub="Kaydettiginiz isletmelerde degisiklik" value={settings.yeniYorum} onChange={v => update('yeniYorum', v)} />
            <NotifRow icon={Bell} label="Sistem Bildirimleri"    sub="Guvenlik ve hesap bildirimleri"         value={settings.sistemBildirimleri} onChange={v => update('sistemBildirimleri', v)} />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              'w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2',
              saved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-500 text-white hover:bg-indigo-600'
            )}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <><Check size={14} />Kaydedildi</> : 'Kaydet'}
          </button>
        </div>
      </div>
    </AppLayout>
  )
}
'@
Write-Host "bildirimler/page.tsx yazildi"

# --- gizlilik ---
New-Item -ItemType Directory -Force -Path "$base\gizlilik" | Out-Null
Set-Content "$base\gizlilik\page.tsx" -Encoding UTF8 -Value @'
'use client'

import React, { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { ArrowLeft, Eye, EyeOff, Shield, Loader2, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn('relative w-10 h-5 rounded-full transition-all', value ? 'bg-indigo-500' : 'bg-white/[0.1]')}
    >
      <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all', value ? 'left-5' : 'left-0.5')} />
    </button>
  )
}

function PrivacyRow({ icon: Icon, label, sub, value, onChange }: {
  icon: React.ElementType; label: string; sub: string; value: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0">
      <div className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center text-white/40">
        <Icon size={14} />
      </div>
      <div className="flex-1">
        <div className="text-sm text-white font-medium">{label}</div>
        <div className="text-xs text-white/35 mt-0.5">{sub}</div>
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  )
}

export default function GizlilikPage() {
  const router = useRouter()
  const [settings, setSettings] = useState({
    profilHerkese: true,
    yorumlarHerkese: true,
    istatistiklerGorunsun: true,
    takipListesiGorunsun: false,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const update = (key: string, val: boolean) => setSettings(s => ({ ...s, [key]: val }))

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <AppLayout>
      <div className="pb-6">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06]">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-base font-bold text-white">Gizlilik Ayarlari</h1>
        </div>

        <div className="px-4 pt-5 space-y-4">
          <div className="rounded-2xl border border-white/[0.07] bg-surface-2 p-4">
            <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Profil Gorunurlugu</h2>
            <PrivacyRow icon={Eye}     label="Profil Herkese Acik"       sub="Profilinizi herkes gorebilir"      value={settings.profilHerkese}          onChange={v => update('profilHerkese', v)} />
            <PrivacyRow icon={Eye}     label="Yorumlar Herkese Acik"      sub="Yorumlarinizi herkes gorebilir"    value={settings.yorumlarHerkese}        onChange={v => update('yorumlarHerkese', v)} />
            <PrivacyRow icon={Shield}  label="Istatistikleri Goster"      sub="TrustScore ve aktivite gorunsun"   value={settings.istatistiklerGorunsun}  onChange={v => update('istatistiklerGorunsun', v)} />
            <PrivacyRow icon={EyeOff}  label="Takip Listesi Gizli"        sub="Takip listenizi gizleyin"          value={settings.takipListesiGorunsun}   onChange={v => update('takipListesiGorunsun', v)} />
          </div>

          <div className="rounded-2xl border border-amber-500/10 bg-amber-500/[0.04] p-4">
            <div className="flex items-start gap-3">
              <Shield size={15} className="text-amber-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-amber-400 mb-1">Veri Guvenligi</div>
                <div className="text-xs text-white/40 leading-relaxed">
                  Kisisel verileriniz KVKK kapsaminda korunmaktadir. Hesabinizi silmek icin destek@tecrubelerim.com adresine yazabilirsiniz.
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              'w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2',
              saved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-500 text-white hover:bg-indigo-600'
            )}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <><Check size={14} />Kaydedildi</> : 'Kaydet'}
          </button>
        </div>
      </div>
    </AppLayout>
  )
}
'@
Write-Host "gizlilik/page.tsx yazildi"

# --- kaydedilenler ---
New-Item -ItemType Directory -Force -Path "$base\kaydedilenler" | Out-Null
Set-Content "$base\kaydedilenler\page.tsx" -Encoding UTF8 -Value @'
'use client'

import React, { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { ArrowLeft, Bookmark, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { BusinessCard } from '@/components/business/BusinessCard'
import Link from 'next/link'

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '')
const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

export default function KaydedilenlerPage() {
  const router = useRouter()
  const [businesses, setBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/users/me/saved?page=${p}&limit=10`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (res.ok) {
        const data = await res.json()
        if (p === 1) setBusinesses(data.data || [])
        else setBusinesses(prev => [...prev, ...(data.data || [])])
        setHasMore(data.pagination?.page < data.pagination?.totalPages)
      }
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load(1) }, [])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    load(next)
  }

  return (
    <AppLayout>
      <div className="pb-6">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06]">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-base font-bold text-white">Kaydedilen Yerler</h1>
            {businesses.length > 0 && <p className="text-xs text-white/40">{businesses.length} yer</p>}
          </div>
        </div>

        <div className="px-4 pt-4">
          {loading && businesses.length === 0 ? (
            <div className="flex justify-center py-16">
              <Loader2 size={24} className="animate-spin text-white/30" />
            </div>
          ) : businesses.length === 0 ? (
            <div className="text-center py-16">
              <Bookmark size={36} className="mx-auto mb-3 text-white/20" />
              <div className="text-white/40 text-sm mb-1">Henuz kaydedilen yer yok</div>
              <Link href="/kesf" className="text-indigo-400 text-sm font-medium hover:text-indigo-300">
                Yerleri kesfet
              </Link>
            </div>
          ) : (
            <>
              {businesses.map(b => <BusinessCard key={b.id} business={b} />)}
              {hasMore && (
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="w-full mt-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white/60 hover:bg-white/[0.08] transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : 'Daha Fazla'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
'@
Write-Host "kaydedilenler/page.tsx yazildi"
Write-Host ""
Write-Host "Tum sayfalar tamamlandi!"
