'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { MapPin, Building2, ChevronRight, ChevronLeft, Star, Camera, Check, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '')

export default function IsletmeEklePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const submittingRef = useRef(false)
  const [error, setError] = useState('')
  const [locating, setLocating] = useState(false)

  // Adım 1 — İşletme bilgileri
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categoryName, setCategoryName] = useState('')
  const [catSearch, setCatSearch] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [lat, setLat] = useState<number|null>(null)
  const [lng, setLng] = useState<number|null>(null)

  // Adım 2 — Yorum
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [content, setContent] = useState('')
  const [photo, setPhoto] = useState<File|null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch(`${API}/api/categories`)
      .then(r => r.json())
      .then(d => setCategories(Array.isArray(d) ? d : (d.data || [])))
      .catch(() => {})
  }, [])

  function getLocation() {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLat(pos.coords.latitude)
        setLng(pos.coords.longitude)
        setLocating(false)
      },
      () => setLocating(false)
    )
  }

  async function handleSubmit() {
    if (submittingRef.current) return
    submittingRef.current = true
    const token = localStorage.getItem('auth_token')
    if (!token) { router.push('/giris'); return }
    if (!rating || !content || content.length < 20) { setError(rating ? 'Yorum en az 20 karakter olmalı' : 'Lütfen puan verin'); return }
    if (content.length < 20) { setError('Yorum en az 20 karakter olmalı'); return }
    setLoading(true)
    setError('')
    try {
      // 1) İşletme oluştur
      const bizRes = await fetch(`${API}/api/businesses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, categoryId, address, city, district, phoneNumber: phone, website,
          isActive: false, isVerified: false,
          attributes: lat && lng ? { latitude: lat, longitude: lng } : {} }),
      })
      if (!bizRes.ok) { const e = await bizRes.json(); throw new Error(e.error || 'İşletme eklenemedi') }
      const { business } = await bizRes.json()

      // 2) Yorum ekle
      const revRes = await fetch(`${API}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ businessId: business.id, rating, content }),
      })
      if (!revRes.ok) { const e = await revRes.json(); throw new Error(e.error || 'Yorum eklenemedi') }

      setStep(3)
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    } finally {
      submittingRef.current = false
    }
  }

  const filteredCats = categories.filter(c =>
    c.name.toLowerCase().includes(catSearch.toLowerCase())
  )

  return (
    <AppLayout hideBottomNav>
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => step > 1 ? setStep(step-1) : router.back()}
            className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center text-white/50 hover:text-white transition-colors">
            <ChevronLeft size={16} />
          </button>
          <div>
            <h1 className="font-black text-lg text-white">İşletme Ekle</h1>
            <p className="text-xs text-white/40">Adım {step} / 2</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1,2].map(i => (
            <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-white/[0.07]">
              <div className="h-full rounded-full transition-all duration-500"
                style={{width: step >= i ? '100%' : '0%', background:'var(--primary)'}} />
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <X size={14} /> {error}
          </div>
        )}

        {/* ── ADIM 1 ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">İşletme Adı *</label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="örn. Kadıköy Kahvesi"
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/20 transition-colors" />
            </div>

            <div>
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">Kategori *</label>
              <div className="relative mb-2">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input value={catSearch} onChange={e => setCatSearch(e.target.value)}
                  placeholder="Kategori ara..."
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20" />
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {filteredCats.map(cat => (
                  <button key={cat.id} onClick={() => { setCategoryId(cat.id); setCategoryName(cat.name) }}
                    className={cn('flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-all border',
                      categoryId === cat.id ? 'text-white border-white/20' : 'text-white/50 bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]'
                    )}
                    style={categoryId === cat.id ? {background:'var(--primary-bg)',borderColor:'var(--primary-border)',color:'var(--primary)'} : {}}>
                    {cat.icon && <span>{cat.icon}</span>}
                    <span className="truncate">{cat.name}</span>
                    {categoryId === cat.id && <Check size={10} className="ml-auto flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-white/50 mb-1.5 block">Şehir *</label>
                <input value={city} onChange={e => setCity(e.target.value)}
                  placeholder="İstanbul"
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/20" />
              </div>
              <div>
                <label className="text-xs font-semibold text-white/50 mb-1.5 block">İlçe</label>
                <input value={district} onChange={e => setDistrict(e.target.value)}
                  placeholder="Kadıköy"
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/20" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">Adres *</label>
              <input value={address} onChange={e => setAddress(e.target.value)}
                placeholder="Sokak, Mahalle..."
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/20" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-white/50 mb-1.5 block">Telefon</label>
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="0212 000 00 00"
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/20" />
              </div>
              <div>
                <label className="text-xs font-semibold text-white/50 mb-1.5 block">Website</label>
                <input value={website} onChange={e => setWebsite(e.target.value)}
                  placeholder="www.örnek.com"
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-white/20" />
              </div>
            </div>

            {/* Konum */}
            <button onClick={getLocation} disabled={locating}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-all">
              <MapPin size={16} style={{color:'var(--primary)'}} />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-white">
                  {lat ? `${lat.toFixed(4)}, ${lng?.toFixed(4)}` : 'Konumumu Kullan'}
                </div>
                <div className="text-xs text-white/30">{locating ? 'Konum alınıyor...' : lat ? 'Konum alındı ✓' : 'GPS ile otomatik doldur'}</div>
              </div>
              {lat && <Check size={14} className="text-emerald-400" />}
            </button>

            <button
              onClick={() => {
                if (!name) { setError('İşletme adı zorunlu'); return }
                if (!categoryId) { setError('Kategori seçin'); return }
                if (!city) { setError('Şehir zorunlu'); return }
                if (!address) { setError('Adres zorunlu'); return }
                setError('')
                setStep(2)
              }}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all"
              style={{background:'var(--primary)'}}>
              Devam Et <ChevronRight size={14} className="inline" />
            </button>
          </div>
        )}

        {/* ── ADIM 3 — Onay Bekleniyor ── */}
        {step === 3 && (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{background:'var(--primary-bg)'}}>
              <Check size={28} style={{color:'var(--primary)'}} />
            </div>
            <h2 className="text-xl font-black text-white">İşletme Eklendi!</h2>
            <p className="text-sm text-white/50 leading-relaxed">
              İşletmeniz ve yorumunuz alındı. Admin onayından sonra herkes görebilecek.<br/>
              <span className="text-white/30">Bu süreçte sadece siz görebilirsiniz.</span>
            </p>
            <div className="flex flex-col gap-3 mt-6">
              <button onClick={() => router.push('/')}
                className="w-full py-3 rounded-xl font-bold text-sm text-white" style={{background:'var(--primary)'}}>
                Ana Sayfaya Dön
              </button>
            </div>
          </div>
        )}

        {/* ── ADIM 2 ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'var(--primary-bg)'}}>
                  <Building2 size={18} style={{color:'var(--primary)'}} />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{name}</div>
                  <div className="text-xs text-white/40">{categoryName} · {city}</div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-white/50 mb-3 block">Puanınız *</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(i => (
                  <button key={i}
                    onMouseEnter={() => setHoverRating(i)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(i)}
                    className="text-3xl transition-transform hover:scale-110">
                    <span style={{color: i <= (hoverRating || rating) ? '#FBBF24' : 'rgba(255,255,255,0.12)'}}>★</span>
                  </button>
                ))}
                {rating > 0 && <span className="ml-2 text-sm text-white/50 self-center">
                  {['','Kötü','Orta','İyi','Çok İyi','Mükemmel'][rating]}
                </span>}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">Tecrübenizi paylaşın *</label>
              <textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder="Bu işletmeyle ilgili deneyiminizi anlatın..."
                rows={5}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none resize-none focus:border-white/20 transition-colors" />
              <div className="text-right text-[10px] text-white/25 mt-1">{content.length} / min 20</div>
            </div>

            <div>
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">Fotoğraf Ekle (önerilen)</label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) { setPhoto(f); setPhotoPreview(URL.createObjectURL(f)) }
                }} />
              {photoPreview ? (
                <div className="relative w-full h-40 rounded-xl overflow-hidden">
                  <img src={photoPreview} className="w-full h-full object-cover" />
                  <button onClick={() => { setPhoto(null); setPhotoPreview('') }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()}
                  className="w-full h-32 rounded-xl border-2 border-dashed border-white/[0.10] flex flex-col items-center justify-center gap-2 text-white/30 hover:text-white/50 hover:border-white/20 transition-all">
                  <Camera size={24} />
                  <span className="text-xs">Fotoğraf seç veya çek</span>
                  <span className="text-[10px] text-white/20">+0.05 güvenilirlik bonusu</span>
                </button>
              )}
            </div>

            <button onClick={handleSubmit} disabled={loading || submittingRef.current}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{background:'var(--primary)'}}>
              {loading ? 'Kaydediliyor...' : <>İşletmeyi Ekle & Yorumu Paylaş <Check size={14} /></>}
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
