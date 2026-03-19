'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Search, Building2, ChevronRight, CheckCircle, Loader2, AlertCircle, ArrowLeft, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '')
const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

export default function IsletmeTalepPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [claimed, setClaimed] = useState<string[]>([])

  useEffect(() => {
    const token = getToken()
    if (!token) router.push('/giris')
  }, [])

  const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    setMsg(null)
    try {
      const r = await fetch(`${API}/api/businesses?search=${encodeURIComponent(query)}&limit=15`)
      const d = await r.json()
      const list = Array.isArray(d) ? d : (d.data ?? d.businesses ?? [])
      setResults(list)
      if (list.length === 0) setMsg({ type: 'error', text: `"${query}" için işletme bulunamadı. Farklı bir arama terimi deneyin.` })
    } catch {
      setMsg({ type: 'error', text: 'Arama sırasında bir hata oluştu. Lütfen tekrar deneyin.' })
    } finally {
      setSearching(false)
    }
  }

  const handleClaim = async (business: any) => {
    const token = getToken()
    if (!token) { router.push('/giris'); return }
    setClaiming(business.id)
    setMsg(null)
    try {
      const res = await fetch(`${API}/api/businesses/${business.id}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
      const d = await res.json()
      if (res.ok) {
        setClaimed(prev => [...prev, business.id])
        setMsg({ type: 'success', text: `"${business.name}" için sahiplik talebiniz alındı! İnceleme sonrasında bildirim alacaksınız.` })
      } else {
        setMsg({ type: 'error', text: d.error || d.message || 'Sahiplik talebi gönderilemedi.' })
      }
    } catch {
      setMsg({ type: 'error', text: 'Bağlantı hatası. Lütfen tekrar deneyin.' })
    } finally {
      setClaiming(null)
    }
  }

  return (
    <AppLayout>
      <div className="px-4 pt-4 pb-8 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-lg font-black text-white">İşletme Talep Et</h1>
            <p className="text-xs text-white/40">İşletmenizin sahipliğini alın</p>
          </div>
        </div>

        {/* Info card */}
        <div className="rounded-2xl bg-indigo-500/[0.07] border border-indigo-500/20 p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Building2 size={15} className="text-indigo-400" />
            </div>
            <div>
              <div className="font-bold text-sm text-white mb-1">Sahiplik Talebi Nedir?</div>
              <p className="text-xs text-white/50 leading-relaxed">
                Platformumuzdaki işletmenizin sahibi olduğunuzu doğrulayarak bilgilerinizi güncelleyin,
                yorumlara yanıt verin ve işletme analitiğinize erişin.
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <label className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 block">
            İşletmenizi Arayın
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="İşletme adı veya adres..."
                className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || !query.trim()}
              className="px-4 py-3 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-400 disabled:opacity-40 transition-all flex items-center gap-2"
            >
              {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              Ara
            </button>
          </div>
        </div>

        {/* Status message */}
        {msg && (
          <div className={cn(
            'rounded-xl p-3.5 mb-4 flex items-start gap-3',
            msg.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20'
              : 'bg-red-500/10 border border-red-500/20'
          )}>
            {msg.type === 'success'
              ? <CheckCircle size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              : <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            }
            <p className={cn('text-xs leading-relaxed', msg.type === 'success' ? 'text-emerald-300' : 'text-red-300')}>
              {msg.text}
            </p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-white/30 font-bold uppercase tracking-wider mb-3">
              {results.length} işletme bulundu
            </div>
            {results.map(biz => {
              const isClaimed = claimed.includes(biz.id)
              const alreadyClaimed = biz.claimStatus === 'CLAIMED'
              const isPending = biz.claimStatus === 'PENDING'

              return (
                <div key={biz.id} className={cn(
                  'rounded-2xl border p-4 transition-all',
                  alreadyClaimed || isPending
                    ? 'bg-white/[0.02] border-white/[0.06] opacity-60'
                    : isClaimed
                    ? 'bg-emerald-500/[0.05] border-emerald-500/20'
                    : 'bg-white/[0.03] border-white/[0.07] hover:border-white/[0.12]'
                )}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-white mb-1 truncate">{biz.name}</div>
                      <div className="flex items-center gap-1 text-xs text-white/40">
                        <MapPin size={10} />
                        <span className="truncate">{[biz.district, biz.city].filter(Boolean).join(', ')}</span>
                      </div>
                      {biz.category?.name && (
                        <div className="mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {biz.category.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {alreadyClaimed ? (
                        <span className="text-[10px] font-bold px-2.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          ✓ Sahiplenildi
                        </span>
                      ) : isPending ? (
                        <span className="text-[10px] font-bold px-2.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          ⏳ İnceleniyor
                        </span>
                      ) : isClaimed ? (
                        <span className="text-[10px] font-bold px-2.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          ✓ Talep Gönderildi
                        </span>
                      ) : (
                        <button
                          onClick={() => handleClaim(biz)}
                          disabled={claiming === biz.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 text-xs font-bold hover:bg-indigo-500/25 disabled:opacity-50 transition-all"
                        >
                          {claiming === biz.id ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : (
                            <Building2 size={11} />
                          )}
                          Talep Et
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* İşletmemi bulamıyorum */}
        {results.length > 0 && (
          <div className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 text-center">
            <p className="text-xs text-white/40 mb-3">İşletmenizi listede göremiyorsanız yeni ekleyebilirsiniz.</p>
            <Link href="/isletme-ekle"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold hover:bg-indigo-500/30 transition-all">
              <Building2 size={13} />
              Yeni İşletme Ekle
            </Link>
          </div>
        )}

        {/* Empty state */}
        {results.length === 0 && !searching && !msg && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🏪</div>
            <p className="text-white/40 text-sm">İşletme adı yazarak arama yapın</p>
            <p className="text-white/25 text-xs mt-1">Adres, şehir veya kategori ile de arayabilirsiniz</p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
