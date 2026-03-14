'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Search, Star, Camera, X, Check, ChevronRight, Sparkles, Building2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '')

const CATEGORY_ASPECTS: Record<string, {label:string, key:string}[]> = {
  'Oto Servis': [
    {label:'Fiyat ÅeffaflÄ±ÄŸÄ±', key:'price_transparency'},
    {label:'ArÄ±za TeÅŸhis DoÄŸruluÄŸu', key:'diagnosis_accuracy'},
    {label:'Yedek ParÃ§a OrijinalliÄŸi', key:'parts_quality'},
    {label:'Ä°ÅŸÃ§ilik Kalitesi', key:'workmanship'},
    {label:'DÃ¼rÃ¼stlÃ¼k', key:'honesty'},
  ],
  'Kafe': [
    {label:'Kahve Kalitesi', key:'coffee_quality'},
    {label:'Atmosfer', key:'atmosphere'},
    {label:'Servis HÄ±zÄ±', key:'service_speed'},
    {label:'Fiyat/Performans', key:'value'},
    {label:'WiFi & Priz', key:'wifi'},
  ],
  'Restoran': [
    {label:'Yemek Kalitesi', key:'food_quality'},
    {label:'Servis', key:'service'},
    {label:'Temizlik', key:'cleanliness'},
    {label:'Atmosfer', key:'atmosphere'},
    {label:'Fiyat/Performans', key:'value'},
  ],
  'EÄŸitim': [
    {label:'Ã–ÄŸretmen Ä°lgisi', key:'teacher_attention'},
    {label:'MÃ¼fredat Kalitesi', key:'curriculum'},
    {label:'Veli Ä°letiÅŸimi', key:'parent_communication'},
    {label:'Fiyat/Performans', key:'value'},
    {label:'SonuÃ§lar', key:'results'},
  ],
  'Hukuk': [
    {label:'UlaÅŸÄ±labilirlik', key:'accessibility'},
    {label:'Dosya Takibi', key:'case_tracking'},
    {label:'AÃ§Ä±klama NetliÄŸi', key:'clarity'},
    {label:'Ãœcret ÅeffaflÄ±ÄŸÄ±', key:'fee_transparency'},
    {label:'BaÅŸarÄ±', key:'success_rate'},
  ],
  'SaÄŸlÄ±k': [
    {label:'Doktor Ä°lgisi', key:'doctor_care'},
    {label:'Bekleme SÃ¼resi', key:'wait_time'},
    {label:'Temizlik', key:'cleanliness'},
    {label:'Fiyat ÅeffaflÄ±ÄŸÄ±', key:'price_transparency'},
    {label:'TeÅŸhis DoÄŸruluÄŸu', key:'diagnosis'},
  ],
}

const QUICK_ATTRIBUTES = [
  {label:'WiFi var', key:'has_wifi'},
  {label:'Priz eriÅŸimi', key:'has_outlet'},
  {label:'Ã‡ocuk dostu', key:'kid_friendly'},
  {label:'Engelli eriÅŸimi', key:'accessible'},
  {label:'Park yeri', key:'parking'},
  {label:'Rezervasyon', key:'reservation'},
  {label:'Paket servis', key:'takeaway'},
  {label:'Kredi kartÄ±', key:'card_payment'},
]


function YorumYazInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const preId = searchParams.get('businessId')
  const preName = searchParams.get('businessName')

  const [mode, setMode] = useState<'quick'|'detail'|'done-quick'|null>('quick')
  const [selectedAttrs, setSelectedAttrs] = useState<string[]>([])
  const [bizCategory, setBizCategory] = useState('')
  const [step, setStep] = useState(1)

  // Ä°ÅŸletme arama
  const [bizSearch, setBizSearch] = useState(preName || '')
  const [bizResults, setBizResults] = useState<any[]>([])
  const [selectedBiz, setSelectedBiz] = useState<any>(preId ? { id: preId, name: preName } : null)
  const [searching, setSearching] = useState(false)

  // Form
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [content, setContent] = useState('')
  const [photo, setPhoto] = useState<File|null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  // DetaylÄ± mod ekstra
  const [title, setTitle] = useState('')
  const [aspects, setAspects] = useState<Record<string,number>>({})
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!bizSearch || bizSearch.length < 2) { setBizResults([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const r = await fetch(`${API}/api/businesses?search=${encodeURIComponent(bizSearch)}&limit=5`)
        const d = await r.json()
        setBizResults(d.data || d.businesses || [])
      } catch {}
      setSearching(false)
    }, 350)
    return () => clearTimeout(t)
  }, [bizSearch])

  async function submit() {
    const token = localStorage.getItem('auth_token')
    if (!token) { router.push('/giris'); return }
    if (!selectedBiz) { setError('Ä°ÅŸletme seÃ§in'); return }
    if (!rating) { setError('Puan verin'); return }
    if (content.length < 10) { setError('En az 10 karakter yorum yazÄ±n'); return }
    setLoading(true); setError('')
    try {
      const r = await fetch(`${API}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ businessId: selectedBiz.id, rating, content, title }),
      })
      if (!r.ok) { const e = await r.json(); throw new Error(e.error || 'Hata') }
      if (mode === 'quick') { setMode('done-quick') } else { setDone(true) }
    } catch(e: any) { setError(e.message) }
    setLoading(false)
  }

  const LABELS = ['', 'KÃ¶tÃ¼', 'Orta', 'Ä°yi', 'Ã‡ok Ä°yi', 'MÃ¼kemmel']
  const COLORS = ['', 'text-red-400', 'text-orange-400', 'text-yellow-400', 'text-lime-400', 'text-emerald-400']


  if (mode === 'done-quick') return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-8 space-y-4">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{background:'var(--primary-bg)'}}>
            <Check size={24} style={{color:'var(--primary)'}} />
          </div>
          <h2 className="text-lg font-black text-white">Yorum YayÄ±nlandÄ±!</h2>
          <p className="text-sm text-white/40 mt-1">TecrÃ¼beniz kaydedildi.</p>
        </div>

        <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/[0.05]">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-amber-400" />
            <span className="font-bold text-white text-sm">TecrÃ¼beni daha deÄŸerli kÄ±l!</span>
          </div>
          <p className="text-xs text-white/50 mb-4 leading-relaxed">
            DetaylÄ± yorum yazarak mahalle muhtarÄ± rozetine daha hÄ±zlÄ± ulaÅŸ. SektÃ¶rel sorular, diÄŸer kullanÄ±cÄ±lara gerÃ§ek karar vermelerinde yardÄ±mcÄ± olur.
          </p>
          <button onClick={() => { setMode('detail'); setRating(0); setContent(''); }}
            className="w-full py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
            style={{background:'var(--primary)'}}>
            <Sparkles size={14} /> DetaylÄ± Anlat (+TrustScore)
          </button>
        </div>

        <button onClick={() => router.push('/')}
          className="w-full py-3 rounded-xl border border-white/[0.08] text-sm text-white/50 hover:text-white transition-colors">
          Ana Sayfaya DÃ¶n
        </button>
      </div>
    </AppLayout>
  )

  if (done) return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{background:'var(--primary-bg)'}}>
          <Check size={28} style={{color:'var(--primary)'}} />
        </div>
        <h2 className="text-xl font-black text-white mb-2">Yorum YayÄ±nlandÄ±!</h2>
        <p className="text-sm text-white/40 mb-6">TecrÃ¼benizi paylaÅŸtÄ±ÄŸÄ±nÄ±z iÃ§in teÅŸekkÃ¼rler.</p>
        <div className="flex gap-3">
          <button onClick={() => { setDone(false); setRating(0); setContent(''); setSelectedBiz(null); setBizSearch(''); setMode(null) }}
            className="flex-1 py-3 rounded-xl border border-white/[0.08] text-sm text-white/60 hover:text-white transition-colors">
            Yeni Yorum
          </button>
          <Link href="/" className="flex-1 py-3 rounded-xl text-sm text-white font-bold text-center"
            style={{background:'var(--primary)'}}>
            Ana Sayfa
          </Link>
        </div>
      </div>
    </AppLayout>
  )

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => mode ? setMode(null) : router.back()}
            className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center text-white/50 hover:text-white transition-colors">
            â†
          </button>
          <div>
            <h1 className="font-black text-lg text-white">Yorum Yaz</h1>
            <p className="text-xs text-white/40">{selectedBiz ? selectedBiz.name : 'Ä°ÅŸletme seÃ§'}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <X size={14} /> {error}
          </div>
        )}

        {/* Mod seÃ§imi */}
        {!mode && (
          <div className="space-y-3">
            <button onClick={() => setMode('quick')}
              className="w-full p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] transition-all text-left group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'var(--primary-bg)'}}>
                  <Star size={16} style={{color:'var(--primary)'}} />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">HÄ±zlÄ± Yorum</div>
                  <div className="text-xs text-white/40">~1 dakika</div>
                </div>
                <ChevronRight size={16} className="ml-auto text-white/20 group-hover:text-white/50 transition-colors" />
              </div>
              <p className="text-xs text-white/40 ml-12">Ä°ÅŸletme seÃ§, puan ver, yorumunu yaz ve gÃ¶nder.</p>
            </button>

            <button onClick={() => setMode('detail')}
              className="w-full p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] transition-all text-left group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500/10">
                  <Sparkles size={16} className="text-amber-400" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">DetaylÄ± Yorum</div>
                  <div className="text-xs text-white/40">~3 dakika Â· Daha fazla puan</div>
                </div>
                <ChevronRight size={16} className="ml-auto text-white/20 group-hover:text-white/50 transition-colors" />
              </div>
              <p className="text-xs text-white/40 ml-12">Kategori kriterleri, fotoÄŸraf, baÅŸlÄ±k ile kapsamlÄ± yorum.</p>
            </button>

            <div className="relative flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-white/[0.05]" />
              <span className="text-xs text-white/20">veya</span>
              <div className="flex-1 h-px bg-white/[0.05]" />
            </div>

            <Link href="/isletme-ekle"
              className="w-full p-4 rounded-2xl border border-dashed border-white/[0.08] flex items-center gap-3 hover:bg-white/[0.03] transition-all">
              <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center">
                <Plus size={16} className="text-white/40" />
              </div>
              <div>
                <div className="text-sm font-medium text-white/60">Ä°ÅŸletme yok mu?</div>
                <div className="text-xs text-white/30">Yeni iÅŸletme ekle ve ilk yorumu yaz</div>
              </div>
            </Link>
          </div>
        )}

        {/* HÄ±zlÄ± yorum formu */}
        {mode === 'quick' && (
          <div className="space-y-4">
            {/* Ä°ÅŸletme arama */}
            {!selectedBiz ? (
              <div>
                <label className="text-xs font-semibold text-white/50 mb-1.5 block">Ä°ÅŸletme *</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input value={bizSearch} onChange={e => setBizSearch(e.target.value)}
                    placeholder="Ä°ÅŸletme adÄ± ara..."
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/20" />
                </div>
                {bizResults.length > 0 && (
                  <div className="mt-2 rounded-xl border border-white/[0.07] bg-surface-2 overflow-hidden">
                    {bizResults.map(b => (
                      <button key={b.id} onClick={() => { setSelectedBiz(b); setBizSearch(b.name); setBizResults([]) }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.05] transition-colors text-left border-b border-white/[0.05] last:border-0">
                        <Building2 size={14} className="text-white/30 flex-shrink-0" />
                        <div>
                          <div className="text-sm text-white font-medium">{b.name}</div>
                          <div className="text-xs text-white/30">{b.city} {b.district && `Â· ${b.district}`}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {bizSearch.length > 2 && !searching && bizResults.length === 0 && (
                  <div className="mt-2 p-3 rounded-xl border border-dashed border-white/[0.08] text-center">
                    <p className="text-xs text-white/30 mb-2">"{bizSearch}" bulunamadÄ±</p>
                    <Link href={`/isletme-ekle?name=${encodeURIComponent(bizSearch)}`}
                      className="text-xs font-medium" style={{color:'var(--primary)'}}>
                      + Bu iÅŸletmeyi ekle
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.08] bg-white/[0.03]">
                <Building2 size={16} style={{color:'var(--primary)'}} />
                <span className="text-sm text-white font-medium flex-1">{selectedBiz.name}</span>
                <button onClick={() => { setSelectedBiz(null); setBizSearch('') }} className="text-white/30 hover:text-white/60">
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Puan */}
            <div>
              <label className="text-xs font-semibold text-white/50 mb-2 block">PuanÄ±nÄ±z *</label>
              <div className="flex items-center gap-2">
                {[1,2,3,4,5].map(i => (
                  <button key={i} onMouseEnter={() => setHoverRating(i)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(i)}
                    className="text-3xl transition-all hover:scale-110 active:scale-95">
                    <span style={{color: i <= (hoverRating||rating) ? '#FBBF24' : 'rgba(255,255,255,0.1)'}}>â˜…</span>
                  </button>
                ))}
                {(hoverRating||rating) > 0 && (
                  <span className={`ml-1 text-sm font-bold ${COLORS[hoverRating||rating]}`}>
                    {LABELS[hoverRating||rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Yorum */}
            <div>
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">Yorumunuz *</label>
              <textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder="Deneyiminizi paylaÅŸÄ±n..."
                rows={4}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none resize-none focus:border-white/20 transition-colors" />
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-white/20">{content.length} karakter</span>
                {content.length >= 10 && <span className="text-[10px] text-emerald-400">âœ“ Yeterli</span>}
              </div>
            </div>

            <button onClick={submit} disabled={loading || !selectedBiz || !rating || content.length < 10}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              style={{background:'var(--primary)'}}>
              {loading ? 'GÃ¶nderiliyor...' : <><Check size={14} /> Yorumu PaylaÅŸ</>}
            </button>
          </div>
        )}

        {/* DetaylÄ± mod */}
        {mode === 'detail' && (
          <div className="space-y-4">
            {/* Ä°ÅŸletme arama â€” aynÄ± */}
            {!selectedBiz ? (
              <div>
                <label className="text-xs font-semibold text-white/50 mb-1.5 block">Ä°ÅŸletme *</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input value={bizSearch} onChange={e => setBizSearch(e.target.value)}
                    placeholder="Ä°ÅŸletme adÄ± ara..."
                    className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/20" />
                </div>
                {bizResults.length > 0 && (
                  <div className="mt-2 rounded-xl border border-white/[0.07] bg-surface-2 overflow-hidden">
                    {bizResults.map(b => (
                      <button key={b.id} onClick={() => { setSelectedBiz(b); setBizSearch(b.name); setBizResults([]) }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.05] transition-colors text-left border-b border-white/[0.05] last:border-0">
                        <Building2 size={14} className="text-white/30 flex-shrink-0" />
                        <div>
                          <div className="text-sm text-white font-medium">{b.name}</div>
                          <div className="text-xs text-white/30">{b.city}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.08] bg-white/[0.03]">
                <Building2 size={16} style={{color:'var(--primary)'}} />
                <span className="text-sm text-white font-medium flex-1">{selectedBiz.name}</span>
                <button onClick={() => { setSelectedBiz(null); setBizSearch('') }} className="text-white/30 hover:text-white/60">
                  <X size={14} />
                </button>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">BaÅŸlÄ±k</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Yorumunuza baÅŸlÄ±k verin..."
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/20" />
            </div>

            <div>
              <label className="text-xs font-semibold text-white/50 mb-2 block">PuanÄ±nÄ±z *</label>
              <div className="flex items-center gap-2">
                {[1,2,3,4,5].map(i => (
                  <button key={i} onMouseEnter={() => setHoverRating(i)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(i)}
                    className="text-3xl transition-all hover:scale-110">
                    <span style={{color: i <= (hoverRating||rating) ? '#FBBF24' : 'rgba(255,255,255,0.1)'}}>â˜…</span>
                  </button>
                ))}
                {(hoverRating||rating) > 0 && <span className="ml-1 text-sm font-bold text-amber-400">{LABELS[hoverRating||rating]}</span>}
              </div>
            </div>


            {/* SektÃ¶rel Nitelik SorularÄ± */}
            {selectedBiz && (() => {
              const cat = bizCategory || selectedBiz?.category?.name || ''
              const aspects = Object.entries(CATEGORY_ASPECTS).find(([k]) => cat.includes(k))?.[1] || []
              if (!aspects.length) return null
              return (
                <div>
                  <label className="text-xs font-semibold text-white/50 mb-3 block">
                    SektÃ¶rel DeÄŸerlendirme
                  </label>
                  <div className="space-y-3">
                    {aspects.map(a => (
                      <div key={a.key} className="flex items-center justify-between">
                        <span className="text-sm text-white/70">{a.label}</span>
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(i => (
                            <button key={i} onClick={() => setAspects(prev => ({...prev, [a.key]: i}))}
                              className="text-lg transition-all hover:scale-110">
                              <span style={{color: i <= ((aspects as any)[a.key] || 0) ? '#FBBF24' : 'rgba(255,255,255,0.1)'}}>â˜…</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* HÄ±zlÄ± Nitelikler */}
            <div>
              <label className="text-xs font-semibold text-white/50 mb-2 block">Ã–zellikler</label>
              <div className="flex flex-wrap gap-2">
                {QUICK_ATTRIBUTES.map(a => (
                  <button key={a.key}
                    onClick={() => setSelectedAttrs(prev => prev.includes(a.key) ? prev.filter(x=>x!==a.key) : [...prev, a.key])}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      selectedAttrs.includes(a.key)
                        ? 'text-white border-white/20'
                        : 'text-white/40 bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]'
                    }`}
                    style={selectedAttrs.includes(a.key) ? {background:'var(--primary-bg)',borderColor:'var(--primary-border)',color:'var(--primary)'} : {}}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">DetaylÄ± Yorum *</label>
              <textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder="Deneyiminizi detaylÄ±ca anlatÄ±n..."
                rows={6}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none resize-none focus:border-white/20" />
            </div>

            <div>
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">FotoÄŸraf (Ã¶nerilen)</label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if(f){setPhoto(f);setPhotoPreview(URL.createObjectURL(f))} }} />
              {photoPreview ? (
                <div className="relative w-full h-40 rounded-xl overflow-hidden">
                  <img src={photoPreview} className="w-full h-full object-cover" />
                  <button onClick={() => {setPhoto(null);setPhotoPreview('')}}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()}
                  className="w-full h-28 rounded-xl border-2 border-dashed border-white/[0.08] flex flex-col items-center justify-center gap-2 text-white/25 hover:text-white/40 hover:border-white/15 transition-all">
                  <Camera size={20} />
                  <span className="text-xs">FotoÄŸraf ekle Â· +0.05 gÃ¼venilirlik</span>
                </button>
              )}
            </div>

            <button onClick={submit} disabled={loading || !selectedBiz || !rating || content.length < 10}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              style={{background:'var(--primary)'}}>
              {loading ? 'GÃ¶nderiliyor...' : <><Sparkles size={14} /> DetaylÄ± Yorumu PaylaÅŸ</>}
            </button>
          </div>
        )}

      </div>
    </AppLayout>
  )
}

export default function YorumYazPage() {
  return (
    <Suspense>
      <YorumYazInner />
    </Suspense>
  )
}
