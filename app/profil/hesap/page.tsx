'use client'

import React, { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { ArrowLeft, User, Mail, Phone, Lock, Loader2, Check, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { cn } from '@/lib/utils'

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '')
const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

function Field({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="flex items-center gap-1.5 text-xs text-white/40 font-medium mb-2">
        <Icon size={11} />
        {label}
      </label>
      {children}
    </div>
  )
}

export default function HesapPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [fullName, setFullName] = useState(user?.fullName || '')
  const [phone, setPhone] = useState((user as any)?.phoneNumber || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [passSaving, setPassSaving] = useState(false)
  const [passSaved, setPassSaved] = useState(false)
  const [passError, setPassError] = useState('')

  const handleSaveProfile = async () => {
    setSaving(true); setError(''); setSaved(false)
    try {
      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ fullName, phoneNumber: phone }),
      })
      if (!res.ok) { const e = await res.json().catch(() => ({})); setError(e.error || 'Hata.') }
      else { setSaved(true); setTimeout(() => setSaved(false), 2000) }
    } catch { setError('BaÄŸlantÄ± hatasÄ±.') }
    finally { setSaving(false) }
  }

  const handleChangePassword = async () => {
    if (!currentPass || !newPass) { setPassError('TÃ¼m alanlarÄ± doldurun.'); return }
    if (newPass.length < 8) { setPassError('Åifre en az 8 karakter olmalÄ±.'); return }
    setPassSaving(true); setPassError(''); setPassSaved(false)
    try {
      const res = await fetch(`${API_BASE}/api/auth/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
      })
      if (!res.ok) { const e = await res.json().catch(() => ({})); setPassError(e.error || 'Hata.') }
      else { setPassSaved(true); setCurrentPass(''); setNewPass(''); setTimeout(() => setPassSaved(false), 2000) }
    } catch { setPassError('BaÄŸlantÄ± hatasÄ±.') }
    finally { setPassSaving(false) }
  }

  if (!user) return null

  return (
    <AppLayout>
      <div className="pb-6">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06]">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-base font-bold text-white">Hesap Bilgileri</h1>
        </div>

        <div className="px-4 pt-5 space-y-5">
          {/* Profil Bilgileri */}
          <div className="rounded-2xl border border-white/[0.07] bg-surface-2 p-4">
            <h2 className="text-sm font-bold text-white mb-4">Profil Bilgileri</h2>

            <Field label="KullanÄ±cÄ± AdÄ±" icon={User}>
              <div className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white/40">
                @{user.username}
                <span className="text-xs text-white/25 ml-2">(deÄŸiÅŸtirilemez)</span>
              </div>
            </Field>

            <Field label="Ad Soyad" icon={User}>
              <input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="AdÄ±nÄ±z SoyadÄ±nÄ±z"
                className="w-full bg-surface border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 placeholder-white/20 transition-colors"
              />
            </Field>

            <Field label="E-posta" icon={Mail}>
              <div className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-sm text-white/40">
                {user.email}
                {(user as any).emailVerified && <span className="ml-2 text-xs text-emerald-400">âœ“ DoÄŸrulandÄ±</span>}
              </div>
            </Field>

            <Field label="Telefon" icon={Phone}>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+90 5xx xxx xx xx"
                className="w-full bg-surface border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 placeholder-white/20 transition-colors"
              />
            </Field>

            {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className={cn(
                'w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2',
                saved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-500 text-white hover:bg-indigo-600'
              )}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <><Check size={14} />Kaydedildi</> : 'DeÄŸiÅŸiklikleri Kaydet'}
            </button>
          </div>

          {/* Åifre DeÄŸiÅŸtir */}
          <div className="rounded-2xl border border-white/[0.07] bg-surface-2 p-4">
            <h2 className="text-sm font-bold text-white mb-4">Åifre DeÄŸiÅŸtir</h2>

            <Field label="Mevcut Åifre" icon={Lock}>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={currentPass}
                  onChange={e => setCurrentPass(e.target.value)}
                  placeholder="Mevcut ÅŸifreniz"
                  className="w-full bg-surface border border-white/[0.08] rounded-xl px-3 py-2.5 pr-10 text-sm text-white outline-none focus:border-indigo-500/50 placeholder-white/20 transition-colors"
                />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </Field>

            <Field label="Yeni Åifre" icon={Lock}>
              <input
                type={showPass ? 'text' : 'password'}
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                placeholder="En az 8 karakter"
                className="w-full bg-surface border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50 placeholder-white/20 transition-colors"
              />
            </Field>

            {passError && <p className="text-xs text-red-400 mb-3">{passError}</p>}

            <button
              onClick={handleChangePassword}
              disabled={passSaving}
              className={cn(
                'w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2',
                passSaved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/[0.07] text-white hover:bg-white/[0.12] border border-white/[0.09]'
              )}
            >
              {passSaving ? <Loader2 size={14} className="animate-spin" /> : passSaved ? <><Check size={14} />Åifre DeÄŸiÅŸtirildi</> : 'Åifreyi DeÄŸiÅŸtir'}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
