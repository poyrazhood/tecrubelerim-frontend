'use client'
// @ts-ignore
import YetkinlikRadari from '@/components/business/YetkinlikRadari'
// @ts-ignore
import VerificationWizard from '@/components/business/VerificationWizard'
import React, { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import {
  Building2, ChevronRight, Check, Loader2, MapPin, Phone, Globe,
  Mail, Edit3, Camera, X, Save, Clock, Star, TrendingUp,
  MessageSquare, Eye, BarChart2, AlertCircle, ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '')
const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

function normalizeRating(raw: number) {
  if (!raw || raw <= 0) return 0
  if (raw <= 5) return raw
  if (raw <= 50) return raw / 10
  if (raw <= 500) return raw / 100
  return raw / 1000
}

function SubscriptionTab({ business }: { business: any }) {
  const [sub, setSub] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [requestSent, setRequestSent] = React.useState<string|null>(null)
  const [sending, setSending] = React.useState<string|null>(null)
  const [phone, setPhone] = React.useState('')
  const [showPhoneFor, setShowPhoneFor] = React.useState<string|null>(null)
  const [successPlan, setSuccessPlan] = React.useState<string|null>(null)
  const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '')

  const PLAN_FEATURES: Record<string, string[]> = {
    FREE:         [],
    PROFESSIONAL: ['Gelismis Analitik', 'Dogrulanmis Rozet', 'Hizli Yorum Yanitlama'],
    PREMIUM:      ['Gelismis Analitik', 'Dogrulanmis Rozet', 'Hizli Yorum Yanitlama', 'Arama Onceligi', 'Rakip Reklamlari Kaldirma', 'One Cikan Listeleme'],
    ENTERPRISE:   ['Tum Premium Ozellikler', 'Kurumsal API Erisimi', 'White-label Widget', 'Ozel Destek'],
  }
  const PLAN_PRICES: Record<string, string> = { FREE: 'Ucretsiz', PROFESSIONAL: '99â‚º/ay', PREMIUM: '299â‚º/ay', ENTERPRISE: '999â‚º/ay' }
  const PLAN_COLORS: Record<string, string> = {
    FREE: 'border-white/10 bg-white/[0.02]',
    PROFESSIONAL: 'border-blue-500/20 bg-blue-500/[0.04]',
    PREMIUM: 'border-amber-500/20 bg-amber-500/[0.04]',
    ENTERPRISE: 'border-purple-500/20 bg-purple-500/[0.04]',
  }
  const PLAN_TEXT: Record<string, string> = {
    FREE: 'text-white/40', PROFESSIONAL: 'text-blue-400', PREMIUM: 'text-amber-400', ENTERPRISE: 'text-purple-400'
  }
  const PLAN_BTN: Record<string, string> = {
    PROFESSIONAL: 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30',
    PREMIUM: 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30',
    ENTERPRISE: 'bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30',
  }

  React.useEffect(() => {
    const token = localStorage.getItem('auth_token')
    fetch(`${API}/api/subscriptions/business/${business.id}`, {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(r => r.json())
      .then(d => { setSub(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [business.id])

  const handleRequest = async (plan: string) => {
    if (!phone.trim()) { setShowPhoneFor(plan); return }
    setSending(plan)
    const token = localStorage.getItem('auth_token')
    const res = await fetch(`${API}/api/subscriptions/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ businessId: business.id, planWanted: plan, phone })
    })
    const d = await res.json()
    setSending(null)
    if (res.ok) { setSuccessPlan(plan); setShowPhoneFor(null); setPhone('') }
    else if (d.error) { alert(d.error) }
  }

  const currentPlan = sub?.plan || 'FREE'
  const endsAt = sub?.endsAt ? new Date(sub.endsAt).toLocaleDateString('tr-TR') : null

  if (loading) return <div className="text-white/30 text-sm text-center py-8">Yukleniyor...</div>

  return (
    <div className="space-y-4">
      {/* Basari Animasyonu */}
      {successPlan && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSuccessPlan(null)}>
          <div className="bg-[#12121a] border border-emerald-500/20 rounded-3xl p-8 max-w-sm w-full text-center space-y-4 animate-[fadeInScale_0.3s_ease-out]">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="font-black text-xl text-white">Talebiniz Alindi!</div>
            <div className="text-sm text-white/50 leading-relaxed">
              <span className="text-emerald-400 font-bold">{successPlan}</span> paketi icin talebiniz iletildi.
              <br /><br />
              Ekibimiz en kisa surede sizi <span className="text-white/70 font-semibold">telefon</span> ile arayarak bilgi verecektir.
            </div>
            <div className="text-xs text-white/25">Kapatmak icin tiklayin</div>
          </div>
        </div>
      )}

      {/* Mevcut Plan */}
      <div className={`rounded-2xl border p-4 ${PLAN_COLORS[currentPlan]}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className={`text-lg font-black ${PLAN_TEXT[currentPlan]}`}>{currentPlan}</div>
            <div className="text-xs text-white/40 mt-0.5">{PLAN_PRICES[currentPlan]}</div>
          </div>
          {endsAt && currentPlan !== 'FREE' && (
            <div className="text-right">
              <div className="text-[11px] text-white/30">Bitis tarihi</div>
              <div className="text-xs text-white/50 font-bold">{endsAt}</div>
            </div>
          )}
        </div>
        {PLAN_FEATURES[currentPlan].length > 0 ? (
          <div className="space-y-1.5">
            {PLAN_FEATURES[currentPlan].map((f: string) => (
              <div key={f} className="flex items-center gap-2 text-xs text-white/50">
                <div className="w-1 h-1 rounded-full bg-current shrink-0" />
                {f}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-white/30">Temel ozellikler aktif</div>
        )}
      </div>

      {/* Diger Planlar */}
      <div className="text-xs text-white/30 font-bold uppercase tracking-wider px-1">Planlari Karsilastir</div>
      {['PROFESSIONAL','PREMIUM','ENTERPRISE'].filter(p => p !== currentPlan).map(plan => (
        <div key={plan} className={`rounded-2xl border p-4 ${PLAN_COLORS[plan]} transition-all`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`font-black text-sm ${PLAN_TEXT[plan]}`}>{plan}</div>
            <div className={`text-sm font-bold ${PLAN_TEXT[plan]}`}>{PLAN_PRICES[plan]}</div>
          </div>
          <div className="space-y-1 mb-4">
            {PLAN_FEATURES[plan].map((f: string) => (
              <div key={f} className="flex items-center gap-2 text-xs text-white/40">
                <div className="w-1 h-1 rounded-full bg-current shrink-0" />
                {f}
              </div>
            ))}
          </div>
          {showPhoneFor === plan ? (
            <div className="space-y-2">
              <input value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="Telefon numaraniz (ornek: 0555 123 45 67)"
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/40" />
              <div className="flex gap-2">
                <button onClick={() => handleRequest(plan)} disabled={sending === plan || !phone.trim()}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${PLAN_BTN[plan]} disabled:opacity-40`}>
                  {sending === plan ? (
                    <><svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>Gonderiliyor...</>
                  ) : 'Talep Gonder'}
                </button>
                <button onClick={() => { setShowPhoneFor(null); setPhone('') }}
                  className="px-3 py-2.5 rounded-xl bg-white/[0.05] text-white/40 text-xs hover:bg-white/[0.08] transition-all">
                  Iptal
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowPhoneFor(plan)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-all ${PLAN_BTN[plan]}`}>
              Bu Pakete Gec â€” Beni Arayin
            </button>
          )}
        </div>
      ))}
    </div>
  )
}


function AnalyticsTab({ business }: { business: any }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replySaving, setReplySaving] = useState(false)
  const [recentReviews, setRecentReviews] = useState<any[]>([])
  const [view, setView] = useState<'aylik'|'trend'>('aylik')

  useEffect(() => {
    const token = getToken()
    Promise.all([
      fetch(`${API}/api/businesses/${business.id}/analytics`, { headers: { Authorization: `Bearer `+token } }).then(r => r.json()),
      fetch(`${API}/api/businesses/${business.id}/reviews?limit=5`).then(r => r.json())
    ]).then(([analytics, reviews]) => {
      setData(analytics)
      setRecentReviews(reviews.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [business.id])

  const saveReply = async (reviewId: string) => {
    setReplySaving(true)
    const token = getToken()
    const res = await fetch(`${API}/api/reviews/${reviewId}/owner-reply`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer `+token },
      body: JSON.stringify({ ownerReply: replyText })
    })
    if (res.ok) {
      setRecentReviews(prev => prev.map(r => r.id === reviewId ? { ...r, ownerReply: replyText } : r))
      setReplyingTo(null)
      setReplyText('')
    }
    setReplySaving(false)
  }

  const downloadPDF = async () => {
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    const d = data?.overview
    doc.setFontSize(18)
    doc.text(business.name, 20, 20)
    doc.setFontSize(11)
    doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 20, 30)
    doc.line(20, 34, 190, 34)
    doc.setFontSize(13)
    doc.text('Genel Ozet', 20, 44)
    doc.setFontSize(11)
    doc.text(`Toplam Goruntulenme: ${d?.totalViews ?? 0}`, 20, 54)
    doc.text(`Toplam Yorum: ${(d?.totalReviews ?? 0)}${d?.totalReviews ?? 0}`, 20, 62)
    doc.text(`Ortalama Puan: ${d?.averageRating?.toFixed(1) ?? 0}`, 20, 70)
    doc.text(`Sehir Sirasi: #${d?.cityRank ?? '-'}`, 20, 78)
    doc.setFontSize(13)
    doc.text('Aylik Yorum Trendi', 20, 94)
    doc.setFontSize(10)
    let y = 104
    data?.monthlyTrend?.forEach((m: any) => {
      doc.text(`${m.month}: ${m.count} yorum, ort puan ${m.avgRating}`, 25, y)
      y += 8
    })
    doc.setFontSize(13)
    doc.text('Kategori Karsilastirmasi', 20, y + 10)
    doc.setFontSize(10)
    y += 20
    data?.competitors?.forEach((c: any, i: number) => {
      doc.text(`${i+1}. ${c.name}${c.isSelf ? ' (siz)' : ''} â€” Puan: ${c.averageRating?.toFixed(1)}, Yorum: ${(c.totalReviews ?? 0) + (c._count?.externalReviews ?? 0)}${c.totalReviews}`, 25, y)
      y += 8
    })
    doc.save(`${business.name}-rapor.pdf`)
  }


  if (loading) return <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-white/40" /></div>
  if (!data) return <div className="text-center py-12 text-white/40 text-sm">Veri yuklenemedi.</div>

  const maxCount = Math.max(...(data.monthlyTrend?.map((m: any) => m.count) ?? [1]), 1)
  const maxRating = 5
  const MONTHS_TR = ['Oca','Sub','Mar','Nis','May','Haz','Tem','Agu','Eyl','Eki','Kas','Ara']

  return (
    <div className="space-y-4 p-4">

      {/* PDF indir butonu */}
      <button onClick={downloadPDF} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 text-xs font-bold hover:bg-indigo-500/25 transition-all">
        <BarChart2 size={14} /> PDF Rapor Indir
      </button>

      {/* Overview kartlari */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Toplam Goruntulenme', value: data.overview.totalViews?.toLocaleString('tr'), icon: Eye, color: 'indigo' },
          { label: 'Toplam Yorum', value: data.overview.totalReviews, icon: MessageSquare, color: 'emerald' },
          { label: 'Ortalama Puan', value: data.overview.averageRating?.toFixed(1), icon: Star, color: 'amber' },
          { label: 'Sehir Sirasi', value: `#${data.overview.cityRank}`, icon: TrendingUp, color: 'purple' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-3.5 rounded-2xl bg-surface-1 border border-white/[0.07]">
            <div className={`w-8 h-8 rounded-xl bg-${color}-500/15 flex items-center justify-center mb-2`}>
              <Icon size={15} className={`text-${color}-400`} />
            </div>
            <div className="text-lg font-bold text-white">{value ?? 'â€”'}</div>
            <div className="text-[11px] text-white/40 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Trend grafigi â€” toggle */}
      {data.monthlyTrend?.length > 0 && (
        <div className="p-4 rounded-2xl bg-surface-1 border border-white/[0.07]">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-white/70">Son 6 Ay Trendi</div>
            <div className="flex gap-1">
              {(['aylik','trend'] as const).map(v => (
                <button key={v} onClick={() => setView(v)} className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all ${view === v ? 'bg-indigo-500/30 text-indigo-300' : 'text-white/30 hover:text-white/60'}`}>
                  {v === 'aylik' ? 'Yorum' : 'Puan'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-24">
            {data.monthlyTrend.map((m: any) => {
              const val = view === 'aylik' ? m.count : m.avgRating
              const max = view === 'aylik' ? maxCount : maxRating
              const height = Math.max((val / max) * 100, 4)
              const monthIdx = parseInt(m.month.split('-')[1]) - 1
              const color = view === 'aylik' ? 'bg-indigo-500/70 hover:bg-indigo-400' : 'bg-amber-500/70 hover:bg-amber-400'
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[9px] text-white/50">{val}</div>
                  <div className={`w-full rounded-t-md ${color} transition-all`} style={{ height: `${height}%` }} />
                  <div className="text-[9px] text-white/40">{MONTHS_TR[monthIdx]}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Puan dagilimi */}
      <div className="p-4 rounded-2xl bg-surface-1 border border-white/[0.07]">
        <div className="text-xs font-bold text-white/70 mb-3">Puan Dagilimi</div>
        <div className="space-y-2">
          {data.ratingDistribution?.map((r: any) => {
            const total = data.ratingDistribution.reduce((a: number, b: any) => a + b.count, 0)
            const pct = total > 0 ? Math.round((r.count / total) * 100) : 0
            return (
              <div key={r.star} className="flex items-center gap-2">
                <div className="flex items-center gap-0.5 w-16 flex-shrink-0">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={9} className={i < r.star ? 'text-amber-400 fill-amber-400' : 'text-white/10'} />
                  ))}
                </div>
                <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full bg-amber-400/70" style={{ width: `${pct}%` }} />
                </div>
                <div className="text-[11px] text-white/40 w-8 text-right">{r.count}</div>
              </div>
            )
          })}
        </div>
      </div>


      {/* Sentiment Analizi */}
      {data.sentiment && (() => {
        const dist = data.sentiment.distribution
        const total = (dist.pozitif || 0) + (dist.notr || 0) + (dist.negatif || 0)
        const poz = total > 0 ? Math.round((dist.pozitif || 0) / total * 100) : 0
        const notr = total > 0 ? Math.round((dist.notr || 0) / total * 100) : 0
        const neg = total > 0 ? Math.round((dist.negatif || 0) / total * 100) : 0
        return (
          <div className="p-4 rounded-2xl bg-surface-1 border border-white/[0.07]">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-bold text-white/70">Duygu Analizi</div>
              <div className="text-[10px] text-white/30">{total} yorum analiz edildi</div>
            </div>
            <div className="h-3 rounded-full overflow-hidden flex mb-4 gap-0.5">
              {poz > 0 && <div className="bg-emerald-500 rounded-full transition-all" style={{width: poz + '%'}} />}
              {notr > 0 && <div className="bg-amber-500/70 rounded-full transition-all" style={{width: notr + '%'}} />}
              {neg > 0 && <div className="bg-red-500/70 rounded-full transition-all" style={{width: neg + '%'}} />}
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                <div>
                  <div className="text-sm font-bold text-white">{poz}%</div>
                  <div className="text-[10px] text-white/30">Pozitif</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500/70 flex-shrink-0" />
                <div>
                  <div className="text-sm font-bold text-white">{notr}%</div>
                  <div className="text-[10px] text-white/30">NÃ¶tr</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500/70 flex-shrink-0" />
                <div>
                  <div className="text-sm font-bold text-white">{neg}%</div>
                  <div className="text-[10px] text-white/30">Negatif</div>
                </div>
              </div>
            </div>
            {data.sentiment.topKeywords?.length > 0 && (
              <div className="pt-3 border-t border-white/[0.05]">
                <div className="text-[10px] font-semibold text-white/40 mb-2 uppercase tracking-wider">Ã–ne Ã‡Ä±kan Kelimeler</div>
                <div className="flex flex-wrap gap-1.5">
                  {data.sentiment.topKeywords.map((k: any) => (
                    <span key={k.word} className="text-[10px] px-2.5 py-1 rounded-full bg-white/[0.05] text-white/60 border border-white/[0.08] hover:bg-white/[0.08] transition-all">
                      {k.word}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })()}

      {/* Rakip karsilastirma */}
      {data.competitors?.length > 1 && (
        <div className="p-4 rounded-2xl bg-surface-1 border border-white/[0.07]">
          <div className="text-xs font-bold text-white/70 mb-3">Kategori Karsilastirmasi</div>
          <div className="space-y-2.5">
            {data.competitors.map((c: any, i: number) => (
              <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl ${c.isSelf ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-white/[0.03] hover:bg-white/[0.06] cursor-pointer'} transition-all`}
                onClick={() => !c.isSelf && c.slug && window.open(`/isletme/${c.slug}`, '_blank')}>
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/50 font-bold flex-shrink-0">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{c.name} {c.isSelf && <span className="text-indigo-400 text-[10px]">(siz)</span>}</div>
                  <div className="text-[10px] text-white/40">{c.totalReviews} yorum Â· {c.totalViews} goruntulenme</div>
                </div>
                <div className="text-sm font-bold text-amber-400">{c.averageRating?.toFixed(1)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hizli yorum yanitla */}
      {recentReviews.length > 0 && (
        <div className="p-4 rounded-2xl bg-surface-1 border border-white/[0.07]">
          <div className="text-xs font-bold text-white/70 mb-3">Son Yorumlar â€” Hizli Yanit</div>
          <div className="space-y-3">
            {recentReviews.map((review: any) => (
              <div key={review.id} className="border-b border-white/[0.05] pb-3 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[11px] font-semibold text-white">{review.user?.username ?? 'Anonim'}</span>
                      <div className="flex gap-0.5">
                        {Array.from({length:5}).map((_,i) => <Star key={i} size={8} className={i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-white/10'} />)}
                      </div>
                    </div>
                    <p className="text-[11px] text-white/60 line-clamp-2">{review.content}</p>
                    {review.ownerReply && (
                      <div className="mt-1.5 pl-2 border-l-2 border-indigo-500/40">
                        <p className="text-[10px] text-indigo-300/70">{review.ownerReply}</p>
                      </div>
                    )}
                  </div>
                  {!review.ownerReply && (
                    <button onClick={() => { setReplyingTo(review.id); setReplyText('') }}
                      className="flex-shrink-0 text-[10px] px-2 py-1 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/25 transition-all">
                      Yanit
                    </button>
                  )}
                </div>
                {replyingTo === review.id && (
                  <div className="mt-2 space-y-2">
                    <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                      className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 resize-none focus:outline-none focus:border-indigo-500/50"
                      rows={2} placeholder="Yanitinizi yazin..." />
                    <div className="flex gap-2">
                      <button onClick={() => saveReply(review.id)} disabled={replySaving || !replyText.trim()}
                        className="flex-1 py-1.5 rounded-lg bg-indigo-500 text-white text-[11px] font-bold disabled:opacity-40 hover:bg-indigo-600 transition-all">
                        {replySaving ? 'Gonderiliyor...' : 'Gonder'}
                      </button>
                      <button onClick={() => setReplyingTo(null)} className="px-3 py-1.5 rounded-lg bg-white/[0.06] text-white/50 text-[11px] hover:bg-white/[0.1] transition-all">
                        Iptal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Yetkinlik Radari - sadece oto servis icin */}
      {business.category?.slug?.includes('oto') && (
        <div className="space-y-3 mt-4">
          <YetkinlikRadari businessId={business.id} businessName={business.name} />
          <AutoServiceManualForm businessId={business.id} />
        </div>
      )}
    </div>
  )
}


function AutoServiceManualForm({ businessId }: { businessId: string }) {
  const [form, setForm] = useState({ ustaSicili: '', liftSayisi: '', garantiSuresiAy: '', scoreEkipman: '', scoreTecrube: '', sertifikalar: '', uzmanlikAlanlari: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api$/, '')
  const getToken = () => localStorage.getItem('token') || ''

  const handleSave = async () => {
    setSaving(true)
    try {
      const body: any = {}
      if (form.ustaSicili) body.ustaSicili = parseInt(form.ustaSicili)
      if (form.liftSayisi) body.liftSayisi = parseInt(form.liftSayisi)
      if (form.garantiSuresiAy) body.garantiSuresiAy = parseInt(form.garantiSuresiAy)
      if (form.scoreEkipman) body.scoreEkipman = parseFloat(form.scoreEkipman)
      if (form.scoreTecrube) body.scoreTecrube = parseFloat(form.scoreTecrube)
      if (form.sertifikalar) body.sertifikalar = form.sertifikalar.split(',').map((s: string) => s.trim()).filter(Boolean)
      if (form.uzmanlikAlanlari) body.uzmanlikAlanlari = form.uzmanlikAlanlari.split(',').map((s: string) => s.trim()).filter(Boolean)
      await fetch(`${API}/api/auto-service/${businessId}/manual`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body)
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally { setSaving(false) }
  }

  return (
    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.07]">
      <div className="text-xs font-bold text-white/70 mb-3">Yetkinlik Bilgilerini Guncelle</div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          { key: 'ustaSicili', label: 'Deneyim (Yil)', placeholder: '12' },
          { key: 'liftSayisi', label: 'Lift Sayisi', placeholder: '3' },
          { key: 'garantiSuresiAy', label: 'Garanti (Ay)', placeholder: '6' },
          { key: 'scoreEkipman', label: 'Ekipman Skoru (0-100)', placeholder: '78' },
          { key: 'scoreTecrube', label: 'Tecrube Skoru (0-100)', placeholder: '85' },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <div className="text-[10px] text-white/40 mb-1">{label}</div>
            <input type="number" placeholder={placeholder} value={(form as any)[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50" />
          </div>
        ))}
      </div>
      <div className="space-y-2 mb-3">
        <div>
          <div className="text-[10px] text-white/40 mb-1">Sertifikalar (virgille ayirin)</div>
          <input type="text" placeholder="Bosch Servis, ASE Sertifikali" value={form.sertifikalar}
            onChange={e => setForm(f => ({ ...f, sertifikalar: e.target.value }))}
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50" />
        </div>
        <div>
          <div className="text-[10px] text-white/40 mb-1">Uzmanlik Alanlari (virgille ayirin)</div>
          <input type="text" placeholder="Motor, Fren, Elektrik" value={form.uzmanlikAlanlari}
            onChange={e => setForm(f => ({ ...f, uzmanlikAlanlari: e.target.value }))}
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50" />
        </div>
      </div>
      <button onClick={handleSave} disabled={saving}
        className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white text-xs font-bold transition-all">
        {saving ? 'Kaydediliyor...' : saved ? 'Kaydedildi!' : 'Kaydet'}
      </button>
    </div>
  )
}

function ReviewsTab({ business }: { business: any }) {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replySaving, setReplySaving] = useState(false)
  const [aiLoading, setAiLoading] = useState<string | null>(null)
  const [aiDraftCount, setAiDraftCount] = useState<Record<string,number>>({})

  useEffect(() => {
    fetch(`${API}/api/businesses/${business.id}/reviews?limit=50`)
      .then(r => r.json())
      .then(d => { setReviews(d.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [business.id])

  const saveReply = async (reviewId: string) => {
    setReplySaving(true)
    const token = getToken()
    const res = await fetch(`${API}/api/reviews/${reviewId}/owner-reply`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer `+token },

      body: JSON.stringify({ ownerReply: replyText })
    })
    if (res.ok) {
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, ownerReply: replyText } : r))
      setReplyingTo(null)
      setReplyText('')
    }
    setReplySaving(false)
  }

  const getAIDraft = async (reviewId: string) => {
    if ((aiDraftCount[reviewId] || 0) >= 3) return
    setAiDraftCount(prev => ({ ...prev, [reviewId]: (prev[reviewId] || 0) + 1 }))
    setAiLoading(reviewId)
    const token = getToken()
    try {
      const res = await fetch(`${API}/api/reviews/${reviewId}/ai-draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: '{}'
      })
      const data = await res.json()
      if (data.draft) setReplyText(data.draft)
    } catch {}
    setAiLoading(null)
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-white/30" /></div>
  if (reviews.length === 0) return (
    <div className="text-center py-12">
      <MessageSquare size={32} className="mx-auto mb-3 text-white/20" />
      <div className="text-white/40 text-sm">HenÃ¼z yorum yok</div>
    </div>
  )

  return (
    <div className="space-y-4">
      {reviews.map(r => (
        <div key={r.id} className="bg-surface-2 border border-white/[0.07] rounded-2xl p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-black text-indigo-300">
                {r.user?.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-bold text-white">@{r.user?.username}</div>
                <div className="text-[10px] text-white/30">{new Date(r.createdAt).toLocaleDateString('tr-TR')}</div>
              </div>
            </div>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => <Star key={s} size={11} className={s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-white/15'} />)}
            </div>
          </div>
          <p className="text-sm text-white/70 leading-relaxed mb-3">{r.content}</p>

          {r.ownerReply && replyingTo !== r.id && (
            <div className="bg-indigo-500/[0.07] border border-indigo-500/20 rounded-xl p-3 mb-2">
              <div className="text-[10px] font-bold text-indigo-400 mb-1">Ä°ÅŸletme YanÄ±tÄ±</div>
              <p className="text-xs text-white/60 leading-relaxed">{r.ownerReply}</p>
            </div>
          )}

          {replyingTo === r.id ? (
            <div>
              <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={3}
                placeholder="MÃ¼ÅŸterinize yanÄ±t yazÄ±n..."
                className="w-full bg-surface-1 border border-indigo-500/30 rounded-xl px-3 py-2 text-sm text-white outline-none resize-none focus:border-indigo-500/60 placeholder-white/20 mb-2" />
              <div className="flex gap-2">
                <button onClick={() => getAIDraft(r.id)} disabled={!!aiLoading} className="px-3 py-1.5 rounded-lg bg-violet-500/15 text-violet-400 border border-violet-500/20 text-xs font-bold disabled:opacity-40 hover:bg-violet-500/25 transition-all flex items-center gap-1">{aiLoading === r.id ? <Loader2 size={11} className="animate-spin" /> : <span>âœ¨</span>} {aiDraftCount[r.id] ? `YanÄ±tÄ± DeÄŸiÅŸtir (${3 - (aiDraftCount[r.id] || 0)} hak)` : 'Asistanla YanÄ±tla'}</button>
                <button onClick={() => saveReply(r.id)} disabled={replySaving || !replyText.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-500 text-white text-xs font-bold disabled:opacity-50">
                  {replySaving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} YanÄ±tla
                </button>
                <button onClick={() => { setReplyingTo(null); setReplyText('') }}
                  className="px-4 py-1.5 rounded-lg bg-white/[0.05] text-white/40 text-xs">Ä°ptal</button>
              </div>
            </div>
          ) : (
            <button onClick={() => { setReplyingTo(r.id); setReplyText(r.ownerReply || '') }}
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              <MessageSquare size={11} />
              {r.ownerReply ? 'YanÄ±tÄ± DÃ¼zenle' : 'YanÄ±tla'}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

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
  const [activeTab, setActiveTab] = useState<'overview'|'edit'|'reviews'|'analytics'|'subscription'>('overview')

  useEffect(() => {
    const token = getToken()
    if (!token) { setLoading(false); return }
    fetch(`${API}/api/users/me/businesses`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : { businesses: [] })
      .then(d => { setMyBusinesses(Array.isArray(d) ? d : d.businesses || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const searchClaim = async () => {
    if (!claimQuery.trim()) return
    setClaimSearching(true)
    setClaimMsg(null)
    const r = await fetch(`${API}/api/businesses?search=${encodeURIComponent(claimQuery)}&limit=10`)
    const d = await r.json()
    const results = Array.isArray(d) ? d : Array.isArray(d.data) ? d.data : Array.isArray(d.businesses) ? d.businesses : []
    setClaimResults(results)
    if (results.length === 0) setClaimMsg('SonuÃ§ bulunamadÄ±.')
    setClaimSearching(false)
  }

  const handleClaim = async (b: any) => {
    const token = getToken()
    if (!token) { setClaimMsg('Sahiplik talebi iÃ§in giriÅŸ yapmanÄ±z gerekiyor.'); return }
    setClaiming(b.id); setClaimMsg(null)
    const res = await fetch(`${API}/api/businesses/${b.id}/claim`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }
    })
    const d = await res.json()
    setClaimMsg(res.ok ? 'âœ“ Talebiniz alÄ±ndÄ±, inceleme sonrasÄ± bildirim alacaksÄ±nÄ±z.' : d.error || 'Hata oluÅŸtu.')
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
      setSaveMsg('âœ“ Kaydedildi!'); setEditing(false)
    } else { setSaveMsg(d.error || 'Kaydetme baÅŸarÄ±sÄ±z.') }
    setSaving(false)
    setTimeout(() => setSaveMsg(null), 3000)
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f || !selected) return
    setPhotoUploading(true)
    const fd = new FormData(); fd.append('file', f)
    const token = getToken()
    const res = await fetch(`${API}/api/upload/business`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd
    })
    if (res.ok) {
      const d = await res.json()
      setSelected((prev: any) => ({ ...prev, coverPhoto: d.url }))
    }
    setPhotoUploading(false)
  }

  const getCover = (b: any) => b.coverPhoto || b.photos?.[0]?.url || (b.attributes?.photos?.[0]) || null

  // â”€â”€ SeÃ§ili iÅŸletme yÃ¶netim ekranÄ± â”€â”€
  if (selected) {
    const cover = getCover(selected)
    const rating = normalizeRating(selected.averageRating ?? 0)
    return (
      <AppLayout>
        <div className="max-w-lg mx-auto pb-8">
          {/* Header */}
          <div className="relative h-44 overflow-hidden">
            {cover ? (
              <img src={cover} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-900/40 to-purple-900/30 flex items-center justify-center">
                <Building2 size={48} className="text-white/10" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <button onClick={() => { setSelected(null); setActiveTab('overview') }}
              className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white">
              <X size={16} />
            </button>
            <label className="absolute top-4 right-4 cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-sm border border-white/15 text-xs text-white font-medium">
                {photoUploading ? <Loader2 size={11} className="animate-spin" /> : <Camera size={11} />} FotoÄŸraf
              </div>
            </label>
            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-xl font-black text-white">{selected.name}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-white/50"><MapPin size={10} />{selected.district || selected.city}</span>
                <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border',
                  selected.claimStatus === 'CLAIMED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                  selected.claimStatus === 'PENDING' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                  'bg-white/[0.07] text-white/40 border-white/10'
                )}>
                  {selected.claimStatus === 'CLAIMED' ? 'âœ“ DoÄŸrulandÄ±' : selected.claimStatus === 'PENDING' ? 'â³ Ä°nceleniyor' : 'DoÄŸrulanmamÄ±ÅŸ'}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.07] px-4 mt-2">
            {([['overview','Genel Bakis'],['edit','Bilgileri Duzenle'],['reviews','Yorumlar'],['analytics','Analitik'],['subscription','Paketim']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={cn('py-3 px-4 text-xs font-bold border-b-2 transition-colors',
                  activeTab === key ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-white/40 hover:text-white/60'
                )}>
                {label}
              </button>
            ))}
          </div>

          <div className="px-4 mt-4">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Star, label: 'Puan', value: rating > 0 ? rating.toFixed(1) : 'â€”', color: 'text-amber-400' },
                    { icon: MessageSquare, label: 'Yorum', value: selected.totalReviews ?? 0, color: 'text-indigo-400' },
                    { icon: Eye, label: 'GÃ¶rÃ¼ntÃ¼lenme', value: selected.totalViews ?? 0, color: 'text-purple-400' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="bg-surface-1 border border-white/[0.07] rounded-2xl p-3 text-center">
                      <Icon size={18} className={cn('mx-auto mb-1', color)} />
                      <div className="text-lg font-black text-white">{value}</div>
                      <div className="text-[10px] text-white/35">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Rating bar */}
                {rating > 0 && (
                  <div className="bg-surface-1 border border-white/[0.07] rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-white">Puan DaÄŸÄ±lÄ±mÄ±</span>
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-white/15'} />)}
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all" style={{ width: `${(rating / 5) * 100}%` }} />
                    </div>
                  </div>
                )}

                {/* Quick links */}
                <div className="space-y-2">
                  <button onClick={() => setActiveTab('edit')}
                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-surface-1 border border-white/[0.07] hover:border-indigo-500/30 transition-all">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center"><Edit3 size={15} className="text-indigo-400" /></div>
                    <div className="flex-1 text-left"><div className="text-sm font-bold text-white">Ä°ÅŸletme Bilgilerini DÃ¼zenle</div><div className="text-xs text-white/35">Adres, telefon, aÃ§Ä±klama</div></div>
                    <ChevronRight size={14} className="text-white/20" />
                  </button>
                  <Link href={`/isletme/${selected.slug}`}
                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-surface-1 border border-white/[0.07] hover:border-indigo-500/30 transition-all">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center"><Eye size={15} className="text-purple-400" /></div>
                    <div className="flex-1 text-left"><div className="text-sm font-bold text-white">Ä°ÅŸletme SayfasÄ±nÄ± GÃ¶rÃ¼ntÃ¼le</div><div className="text-xs text-white/35">MÃ¼ÅŸterilerin gÃ¶rdÃ¼ÄŸÃ¼ sayfa</div></div>
                    <ChevronRight size={14} className="text-white/20" />
                  </Link>
                </div>
              </div>
            )}

            {/* Verification Tab - Overview icinde */}
            {activeTab === 'overview' && selected && (
              <div className="mt-3">
                <VerificationWizard business={selected} />
              </div>
            )}
            {/* Edit Tab */}
            {activeTab === 'edit' && (
              <div>
                {saveMsg && <div className={cn('text-xs mb-3 font-medium p-2.5 rounded-xl', saveMsg.startsWith('âœ“') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')}>{saveMsg}</div>}
                {!editing ? (
                  <div className="space-y-3">
                    {[
                      { key: 'name', label: 'Ä°ÅŸletme AdÄ±' },
                      { key: 'phoneNumber', label: 'Telefon' },
                      { key: 'email', label: 'E-posta' },
                      { key: 'website', label: 'Website' },
                      { key: 'address', label: 'Adres' },
                      { key: 'city', label: 'Åehir' },
                      { key: 'district', label: 'Ä°lÃ§e' },
                      { key: 'description', label: 'AÃ§Ä±klama' },
                    ].map(({ key, label }) => (
                      <div key={key} className="bg-surface-1 border border-white/[0.07] rounded-2xl px-4 py-3">
                        <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{label}</div>
                        <div className="text-sm text-white/70">{(selected as any)[key] || <span className="text-white/20 italic">BelirtilmemiÅŸ</span>}</div>
                      </div>
                    ))}
                    <button onClick={() => { setEditing(true); setForm({ name: selected.name, address: selected.address, city: selected.city, district: selected.district, description: selected.description, phoneNumber: selected.phoneNumber, email: selected.email, website: selected.website }) }}
                      className="w-full py-3 rounded-2xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2">
                      <Edit3 size={14} /> DÃ¼zenle
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[
                      { key: 'name', label: 'Ä°ÅŸletme AdÄ±', type: 'input' },
                      { key: 'phoneNumber', label: 'Telefon', type: 'input' },
                      { key: 'email', label: 'E-posta', type: 'input' },
                      { key: 'website', label: 'Website', type: 'input' },
                      { key: 'address', label: 'Adres', type: 'input' },
                      { key: 'city', label: 'Åehir', type: 'input' },
                      { key: 'district', label: 'Ä°lÃ§e', type: 'input' },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{label}</div>
                        <input value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })}
                          className="w-full bg-surface-2 border border-indigo-500/30 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500/60" />
                      </div>
                    ))}
                    <div>
                      <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">AÃ§Ä±klama</div>
                      <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} rows={4}
                        className="w-full bg-surface-2 border border-indigo-500/30 rounded-xl px-3 py-2.5 text-sm text-white outline-none resize-none focus:border-indigo-500/60" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSave} disabled={saving}
                        className="flex-1 py-3 rounded-2xl bg-indigo-500 text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Kaydet
                      </button>
                      <button onClick={() => setEditing(false)} className="px-5 py-3 rounded-2xl bg-white/[0.05] text-white/50 text-sm font-medium">Ä°ptal</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <ReviewsTab business={selected} />
            )}
            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <AnalyticsTab business={selected} />
            )}
            {activeTab === 'subscription' && (
              <SubscriptionTab business={selected} />
            )}
          </div>
        </div>
      </AppLayout>
    )
  }

  // â”€â”€ Ana liste / sahiplen ekranÄ± â”€â”€
  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-2xl font-black text-white mb-1">Sahip Paneli</h1>
        <p className="text-sm text-white/40 mb-6">Ä°ÅŸletmenizi yÃ¶netin veya sahiplik talep edin</p>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-white/30" /></div>
        ) : myBusinesses.length > 0 ? (
          <div className="mb-8">
            <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Ä°ÅŸletmelerim</div>
            {myBusinesses.map(b => {
              const cover = getCover(b)
              const rating = normalizeRating(b.averageRating ?? 0)
              return (
                <button key={b.id} onClick={() => setSelected(b)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border border-white/[0.07] bg-surface-1 hover:bg-surface-2 hover:border-indigo-500/30 transition-all text-left mb-2">
                  <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden border border-white/[0.06]">
                    {cover ? <img src={cover} alt="" className="w-full h-full object-cover" /> :
                      <div className="w-full h-full bg-indigo-500/20 flex items-center justify-center"><Building2 size={20} className="text-indigo-400" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-white truncate">{b.name}</div>
                    <div className="flex items-center gap-1 text-xs text-white/40 mt-0.5"><MapPin size={9} />{b.district || b.city}</div>
                    {rating > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={10} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs text-white/50">{rating.toFixed(1)}</span>
                        <span className="text-xs text-white/25">({b.totalReviews})</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full',
                      b.claimStatus === 'CLAIMED' ? 'bg-emerald-500/15 text-emerald-400' :
                      b.claimStatus === 'PENDING' ? 'bg-amber-500/15 text-amber-400' : 'bg-white/[0.05] text-white/30'
                    )}>
                      {b.claimStatus === 'CLAIMED' ? 'DoÄŸrulandÄ±' : b.claimStatus === 'PENDING' ? 'Bekliyor' : 'Taslak'}
                    </span>
                    <ChevronRight size={14} className="text-white/20" />
                  </div>
                </button>
              )
            })}
          </div>
        ) : null}

        {/* Claim section */}
        <div className="bg-surface-1 border border-white/[0.07] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={16} className="text-indigo-400" />
            <span className="text-sm font-bold text-white">Ä°ÅŸletmenizi Sahiplenin</span>
          </div>
          <p className="text-xs text-white/40 mb-4">Listede iÅŸletmenizi arayÄ±n ve sahiplik talep edin.</p>
          <div className="flex gap-2 mb-3">
            <input value={claimQuery} onChange={e => setClaimQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchClaim()}
              placeholder="Ä°ÅŸletme adÄ±..."
              className="flex-1 bg-surface-2 border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-indigo-500/40" />
            <button onClick={searchClaim} disabled={claimSearching}
              className="px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 transition-colors disabled:opacity-50">
              {claimSearching ? <Loader2 size={14} className="animate-spin" /> : 'Ara'}
            </button>
          </div>
          {claimMsg && (
            <div className={cn('text-xs font-medium mb-3 p-2.5 rounded-xl', claimMsg.startsWith('âœ“') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')}>
              {claimMsg}
            </div>
          )}
          <div className="space-y-2">
            {claimResults.map(b => {
              const cover = getCover(b)
              const rating = normalizeRating(b.averageRating ?? 0)
              return (
                <div key={b.id} className="flex items-center gap-3 p-3 rounded-2xl border border-white/[0.08] bg-surface-2 hover:border-indigo-500/20 transition-all">
                  <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden border border-white/[0.06]">
                    {cover ? <img src={cover} alt="" className="w-full h-full object-cover" /> :
                      <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,rgba(99,102,241,.2),rgba(168,85,247,.15))' }}>
                        <Building2 size={18} className="text-indigo-400/70" />
                      </div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate">{b.name}</div>
                    <div className="flex items-center gap-1 text-xs text-white/35 mt-0.5">
                      <MapPin size={9} /><span>{b.district ? `${b.district}, ${b.city}` : b.city}</span>
                      {b.category && <><span className="text-white/15">Â·</span><span>{b.category.name}</span></>}
                    </div>
                    {rating > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => <div key={s} className={cn('w-1.5 h-1.5 rounded-full', s <= Math.round(rating) ? 'bg-amber-400' : 'bg-white/10')} />)}
                        </div>
                        <span className="text-[10px] text-white/30">{b.totalReviews} yorum</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {b.claimStatus === 'CLAIMED' ? (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-white/[0.05] text-white/25 border border-white/[0.06]">SahiplenilmiÅŸ</span>
                    ) : b.claimStatus === 'PENDING' ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Clock size={9} /> Bekliyor
                      </span>
                    ) : (
                      <button onClick={() => handleClaim(b)} disabled={claiming === b.id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20">
                        {claiming === b.id ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Talep Et
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
