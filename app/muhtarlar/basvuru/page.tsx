'use client'
import React, { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { ArrowLeft, Shield, Loader2, Check, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '')
const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

export default function MuhtarBasvuruPage() {
  const router = useRouter()
  const [form, setForm] = useState({ neighborhood: '', district: '', city: '', reason: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [existing, setExisting] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/giris'); return }
    fetch(API + '/api/muhtar/my', { headers: { Authorization: 'Bearer ' + token } })
      .then(r => r.json())
      .then(d => { if (d[0]) setExisting(d[0]) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async () => {
    if (!form.neighborhood || !form.district || !form.city || !form.reason) {
      setError('Tum alanlar zorunlu'); return
    }
    if (form.reason.length < 50) { setError('Basvuru nedeniniz en az 50 karakter olmali'); return }
    setSubmitting(true); setError('')
    const token = getToken()
    const res = await fetch(API + '/api/muhtar/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify(form)
    })
    const d = await res.json()
    if (!res.ok) { setError(d.error || 'Bir hata olustu'); setSubmitting(false); return }
    setSuccess(true); setSubmitting(false)
  }

  if (loading) return null

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <ArrowLeft size={15} />
          </button>
          <div>
            <h1 className="font-black text-lg text-white">Muhtar Basvurusu</h1>
            <p className="text-xs text-white/35">Mahallenizin muhtari olun</p>
          </div>
        </div>
        <div className="rounded-2xl border border-indigo-500/15 bg-indigo-500/[0.05] p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-indigo-400" />
            <span className="text-sm font-bold text-indigo-400">Muhtar Nedir?</span>
          </div>
          <p className="text-xs text-white/40 leading-relaxed">Muhtarlar, mahalleleri hakkinda yetkili yorumlar yapabilen ve topluluga onculuk eden kullanicilardir. Basvurunuz admin tarafindan incelenir.</p>
          <div className="text-[11px] text-white/30 pt-1">Gereksinim: En az 5 yorum</div>
        </div>
        {existing ? (
          <div className={cn('rounded-2xl border p-4 text-center space-y-2', existing.status === 'PENDING' ? 'border-amber-500/20 bg-amber-500/[0.05]' : existing.status === 'APPROVED' ? 'border-emerald-500/20 bg-emerald-500/[0.05]' : 'border-red-500/20 bg-red-500/[0.05]')}>
            <div className={cn('font-bold text-sm', existing.status === 'PENDING' ? 'text-amber-400' : existing.status === 'APPROVED' ? 'text-emerald-400' : 'text-red-400')}>
              {existing.status === 'PENDING' ? 'Basvurunuz Inceleniyor' : existing.status === 'APPROVED' ? 'Basvurunuz Onaylandi!' : 'Basvurunuz Reddedildi'}
            </div>
            <div className="text-xs text-white/40">{existing.neighborhood}, {existing.district}</div>
            {existing.adminNote && <div className="text-xs text-white/30 italic">Admin notu: {existing.adminNote}</div>}
          </div>
        ) : success ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-6 text-center space-y-2">
            <Check size={24} className="text-emerald-400 mx-auto" />
            <div className="font-bold text-emerald-400">Basvurunuz Alindi!</div>
            <div className="text-xs text-white/40">Admin incelemesinin ardindan bildirim gonderilecek.</div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 space-y-3">
            {[{key:'neighborhood',label:'Mahalle',placeholder:'Baglarbasi Mahallesi'},{key:'district',label:'Ilce',placeholder:'Uskudar'},{key:'city',label:'Sehir',placeholder:'Istanbul'}].map(({key,label,placeholder}) => (
              <div key={key}>
                <label className="text-xs text-white/40 mb-1 block">{label}</label>
                <input value={(form as any)[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))} placeholder={placeholder}
                  className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/40" />
              </div>
            ))}
            <div>
              <label className="text-xs text-white/40 mb-1 block">Basvuru Nedeni ({form.reason.length}/50 min)</label>
              <textarea value={form.reason} onChange={e => setForm(f => ({...f, reason: e.target.value}))} placeholder="Bu mahallede yasiyorum, isletmeleri yakindan taniyorum..." rows={4}
                className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/40 resize-none" />
            </div>
            {error && <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/[0.08] rounded-xl px-3 py-2"><AlertCircle size={12} />{error}</div>}
            <button onClick={handleSubmit} disabled={submitting}
              className="w-full py-3 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
              {submitting ? <><Loader2 size={14} className="animate-spin" />Gonderiliyor...</> : 'Basvuruyu Gonder'}
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}