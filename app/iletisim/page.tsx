'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { ChevronLeft, Send, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

const CATEGORIES = [
  { value: 'technical', label: 'Teknik sorun' },
  { value: 'suggestion', label: 'Öneri' },
  { value: 'other', label: 'Diğer' },
]

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function IletisimPage() {
  const [form, setForm] = useState({
    email: '',
    phone: '',
    category: 'technical',
    subject: '',
    message: '',
  })
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.email || !form.message) return

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch(`${API_BASE}/support/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          phone: form.phone || undefined,
          category: form.category,
          subject: form.subject || undefined,
          message: form.message,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message ?? 'Bir hata oluştu')
      }

      setStatus('success')
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.message ?? 'Lütfen tekrar deneyin.')
    }
  }

  if (status === 'success') {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <CheckCircle size={32} className="text-indigo-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Talebiniz alındı</h2>
            <p className="text-sm text-white/50 max-w-xs">
              En kısa sürede e-posta adresinize dönüş yapacağız.
            </p>
            <Link
              href="/"
              className="mt-4 px-5 py-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-sm font-semibold text-indigo-300 hover:bg-indigo-500/30 transition-all"
            >
              Ana sayfaya dön
            </Link>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Link
          href="/profil"
          className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-6 transition-colors"
        >
          <ChevronLeft size={16} /> Geri
        </Link>

        <h1 className="text-xl font-black text-white mb-1">İletişim</h1>
        <p className="text-sm text-white/40 mb-8">
          Destek talebinizi iletin, ekibimiz en kısa sürede yanıtlasın.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Kategori */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
              Konu türü
            </label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => update('category', cat.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    form.category === cat.value
                      ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                      : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* E-posta */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
              E-posta <span className="text-indigo-400">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="ornek@mail.com"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all"
            />
          </div>

          {/* Telefon */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
              Telefon <span className="text-white/25">(isteğe bağlı)</span>
            </label>
            <input
              type="tel"
              placeholder="05xx xxx xx xx"
              value={form.phone}
              onChange={e => update('phone', e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all"
            />
          </div>

          {/* Konu başlığı */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
              Başlık <span className="text-white/25">(isteğe bağlı)</span>
            </label>
            <input
              type="text"
              placeholder="Kısaca ne hakkında?"
              value={form.subject}
              onChange={e => update('subject', e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all"
            />
          </div>

          {/* Mesaj */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
              Mesajınız <span className="text-indigo-400">*</span>
            </label>
            <textarea
              required
              rows={5}
              placeholder="Sorununuzu veya önerinizi detaylıca açıklayın..."
              value={form.message}
              onChange={e => update('message', e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all resize-none"
            />
          </div>

          {/* Hata */}
          {status === 'error' && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              <AlertCircle size={15} className="flex-shrink-0" />
              {errorMsg || 'Bir hata oluştu, lütfen tekrar deneyin.'}
            </div>
          )}

          {/* Gönder */}
          <button
            type="submit"
            disabled={status === 'loading' || !form.email || !form.message}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all
              bg-indigo-500/20 border border-indigo-500/30 text-indigo-300
              hover:bg-indigo-500/30 active:scale-[0.98]
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? (
              <>
                <span className="w-4 h-4 border-2 border-indigo-400/40 border-t-indigo-400 rounded-full animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Send size={15} />
                Talebi gönder
              </>
            )}
          </button>
        </form>
      </div>
    </AppLayout>
  )
}
