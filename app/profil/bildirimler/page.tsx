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
