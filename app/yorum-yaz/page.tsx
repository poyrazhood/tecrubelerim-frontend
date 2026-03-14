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
    {label:'Fiyat Şeffaflığı', key:'price_transparency'},
    {label:'Arıza Teşhis Doğruluğu', key:'diagnosis_accuracy'},
    {label:'Yedek Parça Orijinalliği', key:'parts_quality'},
    {label:'İşçilik Kalitesi', key:'workmanship'},
    {label:'Dürüstlük', key:'honesty'},
  ],
  'Kafe': [
    {label:'Kahve Kalitesi', key:'coffee_quality'},
    {label:'Atmosfer', key:'atmosphere'},
    {label:'Servis Hızı', key:'service_speed'},
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
  'Eğitim': [
    {label:'Öğretmen İlgisi', key:'teacher_attention'},
    {label:'Müfredat Kalitesi', key:'curriculum'},
    {label:'Veli İletişimi', key:'parent_communication'},
    {label:'Fiyat/Performans', key:'value'},
    {label:'Sonuçlar', key:'results'},
  ],
  'Hukuk': [
    {label:'Ulaşılabilirlik', key:'accessibility'},
    {label:'Dosya Takibi', key:'case_tracking'},
    {label:'Açıklama Netliği', key:'clarity'},
    {label:'Ücret Şeffaflığı', key:'fee_transparency'},
    {label:'Başarı', key:'success_rate'},
  ],
  'Sağlık': [
    {label:'Doktor İlgisi', key:'doctor_care'},
    {label:'Bekleme Süresi', key:'wait_time'},
    {label:'Temizlik', key:'cleanliness'},
    {label:'Fiyat Şeffaflığı', key:'price_transparency'},
    {label:'Teşhis Doğruluğu', key:'diagnosis'},
  ],
}

const QUICK_ATTRIBUTES = [
  {label:'WiFi var', key:'has_wifi'},
  {label:'Priz erişimi', key:'has_outlet'},
  {label:'Çocuk dostu', key:'kid_friendly'},
  {label:'Engelli erişimi', key:'accessible'},
  {label:'Park yeri', key:'parking'},
  {label:'Rezervasyon', key:'reservation'},
  {label:'Paket servis', key:'takeaway'},
  {label:'Kredi kartı', key:'card_payment'},
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

  // İşletme arama
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

  // Detaylı mod ekstra
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
    if (!selectedBiz) { setError('İşletme seçin'); return }
    if (!rating) { setError('Puan verin'); return }
    if (content.length < 10) { setError('En az 10 karakter yorum yazın'); return }
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

  const LABELS = ['', 'Kötü', 'Orta', 'İyi', 'Çok İyi', 'Mükemmel']
  const COLORS = ['', 'text-red-400', 'text-orange-400', 'text-yellow-400', 'text-lime-400', 'text-emerald-400']


  if (mode === 'done-quick') return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-8 space-y-4">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{background:'var(--primary-bg)'}}>
            <Check size={24} style={{color:'var(--primary)'}} />
          </div>
          <h2 className="text-lg font-black text-white">Yorum Yayınlandı!</h2>
          <p className="text-sm text-white/40 mt-1">Tecrübeniz kaydedildi.</p>
        </div>

        <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/[0.05]">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-amber-400" />
            <span className="font-bold text-white text-sm">Tecrübeni daha değerli kıl!</span>
          </div>
          <p className="text-xs text-white/50 mb-4 leading-relaxed">
            Detaylı yorum yazarak mahalle muhtarı rozetine daha hızlı ulaş. Sektörel sorular, diğer kullanıcılara gerçek karar vermelerinde yardımcı olur.
          </p>
          <button onClick={() => { setMode('detail'); setRating(0); setContent(''); }}
            className="w-full py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
            style={{background:'var(--primary)'}}>
            <Sparkles size={14} /> Detaylı Anlat (+TrustScore)
          </button>
        </div>

        <button onClick={() => router.push('/')}
          className="w-full py-3 rounded-xl border border-white/[0.08] text-sm text-white/50 hover:text-white transition-colors">
          Ana Sayfaya Dön
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
        <h2 className="text-xl font-black text-white mb-2">Yorum Yayınlandı!</h2>
        <p className="text-sm text-white/40 mb-6">Tecrübenizi paylaştığınız için teşekkürler.</p>
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
            ←
          </button>
          <div>
            <h1 className="font-black text-lg text-white">Yorum Yaz</h1>
            <p className="text-xs text-white/40">{selectedBiz ? selectedBiz.name : 'İşletme seç'}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <X size={14} /> {error}
          </div>
        )}

        {/* Mod seçimi */}
        {!mode && (
          <div className="space-y-3">
            <button onClick={() => setMode('quick')}
              className="w-full p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] transition-all text-left group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'var(--primary-bg)'}}>
                  <Star size={16} style={{color:'var(--primary)'}} />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Hızlı Yorum</div>
                  <div className="text-xs text-white/40">~1 dakika</div>
                </div>
                <ChevronRight size={16} className="ml-auto text-white/20 group-hover:text-white/50 transition-colors" />
              </div>
              <p className="text-xs text-white/40 ml-12">İşletme seç, puan ver, yorumunu yaz ve gönder.</p>
            </button>

            <button onClick={() => setMode('detail')}
              className="w-full p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] transition-all text-left group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500/10">
                  <Sparkles size={16} className="text-amber-400" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Detaylı Yorum</div>
                  <div className="text-xs text-white/40">~3 dakika · Daha fazla puan</div>
                </div>
                <ChevronRight size={16} className="ml-auto text-white/20 group-hover:text-white/50 transition-colors" />
              </div>
              <p className="text-xs text-white/40 ml-12">Kategori kriterleri, fotoğraf, başlık ile kapsamlı yorum.</p>
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
                <div className="text-sm font-medium text-white/60">İşletme yok mu?</div>
                <div className="text-xs text-white/30">Yeni işletme ekle ve ilk yorumu yaz</div>
              </div>
            </Link>
          </div>
        )}

        {/* Hızlı yorum formu */}
        {mode === 'quick' && (
          <div className="space-y-4">
            {/* İşletme arama */}
            {!selectedBiz ? (
              <div>
                <label className="text-xs font-semibold text-white/50 mb-1.5 block">İşletme *</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input value={bizSearch} onChange={e => setBizSearch(e.target.value)}
                    placeholder="İşletme adı ara..."
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
                          <div className="text-xs text-white/30">{b.city} {b.district && `· ${b.district}`}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {bizSearch.length > 2 && !searching && bizResults.length === 0 && (
                  <div className="mt-2 p-3 rounded-xl border border-dashed border-white/[0.08] text-center">
                    <p className="text-xs text-white/30 mb-2">"{bizSearch}" bulunamadı</p>
                    <Link href={`/isletme-ekle?name=${encodeURIComponent(bizSearch)}`}
                      className="text-xs font-medium" style={{color:'var(--primary)'}}>
                      + Bu işletmeyi ekle
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
              <label className="text-xs font-semibold text-white/50 mb-2 block">Puanınız *</label>
              <div className="flex items-center gap-2">
                {[1,2,3,4,5].map(i => (
                  <button key={i} onMouseEnter={() => setHoverRating(i)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(i)}
                    className="text-3xl transition-all hover:scale-110 active:scale-95">
                    <span style={{color: i <= (hoverRating||rating) ? '#FBBF24' : 'rgba(255,255,255,0.1)'}}>★</span>
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
                placeholder="Deneyiminizi paylaşın..."
                rows={4}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none resize-none focus:border-white/20 transition-colors" />
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-white/20">{content.length} karakter</span>
                {content.length >= 10 && <span className="text-[10px] text-emerald-400">✓ Yeterli</span>}
              </div>
            </div>

            <button onClick={submit} disabled={loading || !selectedBiz || !rating || content.length < 10}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              style={{background:'var(--primary)'}}>
              {loading ? 'Gönderiliyor...' : <><Check size={14} /> Yorumu Paylaş</>}
            </button>
          </div>
        )}

        {/* Detaylı mod */}
        {mode === 'detail' && (
          <div className="space-y-4">
            {/* İşletme arama — aynı */}
            {!selectedBiz ? (
              <div>
                <label className="text-xs font-semibold text-white/50 mb-1.5 block">İşletme *</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input value={bizSearch} onChange={e => setBizSearch(e.target.value)}
                    placeholder="İşletme adı ara..."
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
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">Başlık</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Yorumunuza başlık verin..."
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/20" />
            </div>

            <div>
              <label className="text-xs font-semibold text-white/50 mb-2 block">Puanınız *</label>
              <div className="flex items-center gap-2">
                {[1,2,3,4,5].map(i => (
                  <button key={i} onMouseEnter={() => setHoverRating(i)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(i)}
                    className="text-3xl transition-all hover:scale-110">
                    <span style={{color: i <= (hoverRating||rating) ? '#FBBF24' : 'rgba(255,255,255,0.1)'}}>★</span>
                  </button>
                ))}
                {(hoverRating||rating) > 0 && <span className="ml-1 text-sm font-bold text-amber-400">{LABELS[hoverRating||rating]}</span>}
              </div>
            </div>


            {/* Sektörel Nitelik Soruları */}
            {selectedBiz && (() => {
              const cat = bizCategory || selectedBiz?.category?.name || ''
              const aspects = Object.entries(CATEGORY_ASPECTS).find(([k]) => cat.includes(k))?.[1] || []
              if (!aspects.length) return null
              return (
                <div>
                  <label className="text-xs font-semibold text-white/50 mb-3 block">
                    Sektörel Değerlendirme
                  </label>
                  <div className="space-y-3">
                    {aspects.map(a => (
                      <div key={a.key} className="flex items-center justify-between">
                        <span className="text-sm text-white/70">{a.label}</span>
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(i => (
                            <button key={i} onClick={() => setAspects(prev => ({...prev, [a.key]: i}))}
                              className="text-lg transition-all hover:scale-110">
                              <span style={{color: i <= (aspects_state?.[a.key] || 0) ? '#FBBF24' : 'rgba(255,255,255,0.1)'}}>★</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* Hızlı Nitelikler */}
            <div>
              <label className="text-xs font-semibold text-white/50 mb-2 block">Özellikler</label>
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
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">Detaylı Yorum *</label>
              <textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder="Deneyiminizi detaylıca anlatın..."
                rows={6}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none resize-none focus:border-white/20" />
            </div>

            <div>
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">Fotoğraf (önerilen)</label>
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
                  <span className="text-xs">Fotoğraf ekle · +0.05 güvenilirlik</span>
                </button>
              )}
            </div>

            <button onClick={submit} disabled={loading || !selectedBiz || !rating || content.length < 10}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              style={{background:'var(--primary)'}}>
              {loading ? 'Gönderiliyor...' : <><Sparkles size={14} /> Detaylı Yorumu Paylaş</>}
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
