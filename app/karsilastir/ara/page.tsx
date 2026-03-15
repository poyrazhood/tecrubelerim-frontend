'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Search, ArrowLeftRight, X, ChevronRight, AlertCircle, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '')

interface Business {
  id: string
  name: string
  slug: string
  city?: string
  district?: string
  totalReviews?: number
  averageRating?: number
  category?: { id: string; name: string; slug?: string; icon?: string }
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

// Kategori benzerlik kontrolü — slug veya isim bazlı
function sameCategory(a: Business, b: Business): boolean {
  if (!a.category || !b.category) return true // biri yoksa geçir
  if (a.category.id === b.category.id) return true
  // Slug benzerliği: "restoranlar" ↔ "restoran", "kafe" ↔ "kafeler" vb.
  const slugA = (a.category.slug || a.category.name || '').toLowerCase().replace(/lar$|ler$|s$/g, '')
  const slugB = (b.category.slug || b.category.name || '').toLowerCase().replace(/lar$|ler$|s$/g, '')
  return slugA === slugB || slugA.includes(slugB) || slugB.includes(slugA)
}

export default function KarsilastirAra() {
  const router = useRouter()
  const [biz1, setBiz1] = useState<Business | null>(null)
  const [biz2, setBiz2] = useState<Business | null>(null)
  const [q1, setQ1] = useState('')
  const [q2, setQ2] = useState('')
  const [r1, setR1] = useState<Business[]>([])
  const [r2, setR2] = useState<Business[]>([])
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)
  const [suggestions, setSuggestions] = useState<Business[]>([]) // biz1 seçilince öneriler
  const [catError, setCatError] = useState(false)

  const cache = useRef<Record<string, Business[]>>({})
  const dq1 = useDebounce(q1, 280)
  const dq2 = useDebounce(q2, 280)

  // Genel arama fonksiyonu
  const doSearch = useCallback(async (
    q: string,
    setR: (v: Business[]) => void,
    setLoading: (v: boolean) => void,
  ) => {
    if (q.length < 2) { setR([]); return }
    if (cache.current[q]) { setR(cache.current[q]); return }

    setLoading(true)
    try {
      const res = await fetch(
        `${API}/api/businesses?search=${encodeURIComponent(q)}&limit=12`,
        { signal: AbortSignal.timeout(6000) }
      )
      const d = await res.json()
      const arr: Business[] = d.data || d.businesses || []
      cache.current[q] = arr
      setR(arr)
    } catch {
      setR([])
    } finally {
      setLoading(false)
    }
  }, [])

  // biz1 seçilince aynı şehirden popüler işletmeleri öner
  const loadSuggestions = useCallback(async (biz: Business) => {
    setSuggestions([])
    try {
      // Aynı şehir + benzer kategori slug ile ara
      const catSlug = biz.category?.slug || ''
      const city = biz.city || ''
      const params = new URLSearchParams({
        ...(catSlug ? { categorySlug: catSlug } : {}),
        ...(city ? { city } : {}),
        sort: 'totalReviews',
        limit: '8',
      })
      const res = await fetch(`${API}/api/businesses?${params}`, { signal: AbortSignal.timeout(6000) })
      const d = await res.json()
      let arr: Business[] = d.data || d.businesses || []
      // biz1'in kendisini çıkar
      arr = arr.filter(b => b.id !== biz.id)
      setSuggestions(arr.slice(0, 6))
    } catch {}
  }, [])

  useEffect(() => { doSearch(dq1, setR1, setLoading1) }, [dq1, doSearch])
  useEffect(() => { doSearch(dq2, setR2, setLoading2) }, [dq2, doSearch])

  const selectBiz1 = (b: Business) => {
    setBiz1(b); setBiz2(null); setQ1(''); setR1([])
    loadSuggestions(b)
  }

  const selectBiz2 = (b: Business) => {
    if (biz1 && !sameCategory(biz1, b)) {
      setCatError(true)
      setTimeout(() => setCatError(false), 3000)
      return
    }
    setBiz2(b); setQ2(''); setR2([]); setCatError(false)
  }

  const go = () => {
    if (biz1 && biz2) router.push(`/karsilastir/${biz1.slug}-vs-${biz2.slug}`)
  }

  // Ortak sonuç listesi bileşeni
  const ResultList = ({ items, onSelect }: { items: Business[]; onSelect: (b: Business) => void }) => (
    <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-white/[0.08] bg-[#0f0f14] shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
      {items.map((b) => (
        <button key={b.id} onClick={() => onSelect(b)}
          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.05] text-left transition-colors border-b border-white/[0.04] last:border-0">
          <span className="text-base shrink-0">{b.category?.icon || '🏢'}</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{b.name}</div>
            <div className="text-[10px] text-white/40">
              {b.category?.name}{b.district ? ` · ${b.district}` : ''}{b.city ? `, ${b.city}` : ''}
            </div>
          </div>
          {b.totalReviews ? (
            <div className="text-[10px] text-white/30 shrink-0">{b.totalReviews} yorum</div>
          ) : (
            <ChevronRight size={12} className="text-white/20 shrink-0" />
          )}
        </button>
      ))}
    </div>
  )

  const BizCard = ({ biz, color, onClear }: { biz: Business; color: 'indigo' | 'amber'; onClear: () => void }) => (
    <div className={cn('flex items-center gap-3 p-3 rounded-xl border',
      color === 'indigo' ? 'border-indigo-500/40 bg-indigo-500/10' : 'border-amber-500/40 bg-amber-500/10')}>
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0',
        color === 'indigo' ? 'bg-indigo-500/20' : 'bg-amber-500/20')}>
        {biz.category?.icon || '🏢'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-white truncate">{biz.name}</div>
        <div className="text-[10px] text-white/40">
          {biz.category?.name}{biz.district ? ` · ${biz.district}` : ''}{biz.city ? `, ${biz.city}` : ''}
        </div>
      </div>
      <button onClick={onClear} className="text-white/30 hover:text-white/70 p-1 transition-colors">
        <X size={14} />
      </button>
    </div>
  )

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto pb-24 pt-4 px-4">
        <div className="flex items-center gap-2 mb-6">
          <ArrowLeftRight size={16} className="text-indigo-400" />
          <h1 className="text-lg font-black text-white">İşletme Karşılaştır</h1>
        </div>

        <div className="space-y-5 mb-6">
          {/* ── 1. İşletme ── */}
          <div>
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1.5">1. İŞLETME</div>
            {biz1 ? (
              <BizCard biz={biz1} color="indigo" onClear={() => { setBiz1(null); setBiz2(null); setSuggestions([]) }} />
            ) : (
              <div className="relative">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 focus-within:border-indigo-500/50 transition-all">
                  {loading1
                    ? <div className="w-3 h-3 rounded-full border border-white/20 border-t-white/60 animate-spin shrink-0" />
                    : <Search size={13} className="text-white/30 shrink-0" />}
                  <input value={q1} onChange={e => setQ1(e.target.value)}
                    placeholder="İşletme adı ara..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none" />
                  {q1 && <button onClick={() => { setQ1(''); setR1([]) }} className="text-white/20 hover:text-white/50"><X size={12} /></button>}
                </div>
                {r1.length > 0 && <ResultList items={r1} onSelect={selectBiz1} />}
                {!loading1 && q1.length >= 2 && r1.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-white/[0.08] bg-[#0f0f14] px-4 py-3 z-50 text-center text-sm text-white/30">
                    Sonuç bulunamadı
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── 2. İşletme ── */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider">2. İŞLETME</div>
              {biz1 && (
                <div className="text-[10px] text-amber-400/60">
                  {biz1.category?.name} · {biz1.city}
                </div>
              )}
            </div>

            {biz2 ? (
              <BizCard biz={biz2} color="amber" onClear={() => setBiz2(null)} />
            ) : (
              <div className="relative">
                <div className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 focus-within:border-amber-500/50 transition-all',
                  !biz1 && 'opacity-35 pointer-events-none'
                )}>
                  {loading2
                    ? <div className="w-3 h-3 rounded-full border border-white/20 border-t-white/60 animate-spin shrink-0" />
                    : <Search size={13} className="text-white/30 shrink-0" />}
                  <input value={q2} onChange={e => setQ2(e.target.value)} disabled={!biz1}
                    placeholder={biz1 ? `${biz1.city || 'şehirde'} benzer işletme ara...` : 'Önce 1. işletmeyi seçin'}
                    className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none" />
                  {q2 && <button onClick={() => { setQ2(''); setR2([]) }} className="text-white/20 hover:text-white/50"><X size={12} /></button>}
                </div>

                {/* Arama sonuçları */}
                {q2.length >= 2 && r2.length > 0 && (
                  <ResultList items={r2} onSelect={selectBiz2} />
                )}
                {!loading2 && q2.length >= 2 && r2.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-white/[0.08] bg-[#0f0f14] px-4 py-3 z-50 text-center text-sm text-white/30">
                    Sonuç bulunamadı
                  </div>
                )}

                {/* Öneri listesi — arama yokken göster */}
                {biz1 && q2.length < 2 && suggestions.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <TrendingUp size={11} className="text-amber-400/70" />
                      <span className="text-[10px] text-white/35">
                        {biz1.city} — en popüler {biz1.category?.name}
                      </span>
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                      {suggestions.map((b) => (
                        <button key={b.id} onClick={() => selectBiz2(b)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.05] text-left transition-colors border-b border-white/[0.04] last:border-0">
                          <span className="text-base shrink-0">{b.category?.icon || '🏢'}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white truncate">{b.name}</div>
                            <div className="text-[10px] text-white/40">
                              {b.district}{b.city ? `, ${b.city}` : ''}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-[10px] text-amber-400/80 font-medium">{b.totalReviews || 0} yorum</div>
                            {b.averageRating ? (
                              <div className="text-[9px] text-white/30">★ {Number(b.averageRating).toFixed(1)}</div>
                            ) : null}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Öneri yükleniyor */}
                {biz1 && q2.length < 2 && suggestions.length === 0 && (
                  <div className="mt-3 space-y-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] animate-pulse">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.06]" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 bg-white/[0.06] rounded w-2/3" />
                          <div className="h-2 bg-white/[0.04] rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Kategori uyumsuzluk uyarısı */}
        {catError && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 mb-4 text-sm text-red-300">
            <AlertCircle size={14} className="shrink-0" />
            Farklı kategorideki işletmeler karşılaştırılamaz.
          </div>
        )}

        <button onClick={go} disabled={!biz1 || !biz2}
          className="w-full py-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-sm font-bold text-indigo-300 hover:bg-indigo-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          <ArrowLeftRight size={15} /> Karşılaştır
        </button>

        {biz1 && !biz2 && suggestions.length === 0 && (
          <p className="text-center text-[11px] text-white/25 mt-3">
            {biz1.category?.name} kategorisinden bir işletme daha seçin
          </p>
        )}
      </div>
    </AppLayout>
  )
}
