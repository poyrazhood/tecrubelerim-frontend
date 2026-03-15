'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, User, Mail, Lock, Eye, EyeOff, ShieldCheck, Check, MapPin, Navigation, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/AuthContext'
import { ApiError } from '@/lib/api'

const ILLER = [
  'Adana','Adıyaman','Afyonkarahisar','Ağrı','Amasya','Ankara','Antalya','Artvin','Aydın','Balıkesir',
  'Bilecik','Bingöl','Bitlis','Bolu','Burdur','Bursa','Çanakkale','Çankırı','Çorum','Denizli',
  'Diyarbakır','Edirne','Elazığ','Erzincan','Erzurum','Eskişehir','Gaziantep','Giresun','Gümüşhane','Hakkari',
  'Hatay','Isparta','Mersin','İstanbul','İzmir','Kars','Kastamonu','Kayseri','Kırklareli','Kırşehir',
  'Kocaeli','Konya','Kütahya','Malatya','Manisa','Kahramanmaraş','Mardin','Muğla','Muş','Nevşehir',
  'Niğde','Ordu','Rize','Sakarya','Samsun','Siirt','Sinop','Sivas','Tekirdağ','Tokat',
  'Trabzon','Tunceli','Şanlıurfa','Uşak','Van','Yozgat','Zonguldak','Aksaray','Bayburt','Karaman',
  'Kırıkkale','Batman','Şırnak','Bartın','Ardahan','Iğdır','Yalova','Karabük','Kilis','Osmaniye','Düzce'
]

const STEPS = ['Bilgiler', 'Konum', 'Tamamlandı']

export default function KayitPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [locLoading, setLocLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showIlDropdown, setShowIlDropdown] = useState(false)
  const [ilSearch, setIlSearch] = useState('')
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    city: '',
    lat: null as number | null,
    lng: null as number | null,
    locationName: '',
  })

  const update = (field: string, val: any) => setForm(f => ({ ...f, [field]: val }))

  const filteredIller = ILLER.filter(il => il.toLowerCase().includes(ilSearch.toLowerCase()))

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Tarayıcınız konum desteklemiyor.')
      return
    }
    setLocLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=tr`)
          const d = await res.json()
          const city = d.address?.province ?? d.address?.city ?? d.address?.county ?? ''
          const district = d.address?.suburb ?? d.address?.town ?? d.address?.district ?? ''
          setForm(f => ({
            ...f,
            lat: latitude,
            lng: longitude,
            city: city.replace(' ili', '').replace(' İli', ''),
            locationName: [district, city].filter(Boolean).join(', '),
          }))
        } catch {
          setForm(f => ({ ...f, lat: latitude, lng: longitude, locationName: `${latitude.toFixed(3)}, ${longitude.toFixed(3)}` }))
        } finally {
          setLocLoading(false)
        }
      },
      () => {
        setLocLoading(false)
        setError('Konum alınamadı. Lütfen manuel seçin.')
      },
      { timeout: 8000 }
    )
  }

  const handleNext = async () => {
    setError('')
    if (step === 0) {
      if (!form.fullName || !form.email || !form.username || !form.password) {
        setError('Tüm alanları doldurun.')
        return
      }
      if (form.password.length < 6) {
        setError('Şifre en az 6 karakter olmalıdır.')
        return
      }
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(form.username)) {
        setError('Kullanıcı adı 3-30 karakter, sadece harf/rakam/_ içerebilir.')
        return
      }
      setStep(1)
      return
    }

    if (step === 1) {
      if (!form.city && !form.lat) {
        setError('Lütfen şehrinizi seçin veya konumunuzu paylaşın.')
        return
      }
      setLoading(true)
      try {
        await register({
          email: form.email,
          username: form.username,
          password: form.password,
          fullName: form.fullName,
        })
        // Konum bilgisini localStorage'a kaydet
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_city', form.city)
          if (form.lat && form.lng) {
            localStorage.setItem('user_lat', String(form.lat))
            localStorage.setItem('user_lng', String(form.lng))
          }
        }
        setStep(2)
      } catch (err) {
        if (err instanceof ApiError) setError(err.message)
        else setError('Kayıt sırasında bir hata oluştu.')
      } finally {
        setLoading(false)
      }
    }
  }

  const passwordStrength = () => {
    const len = form.password.length
    if (len === 0) return { level: 0, label: '', color: '' }
    if (len < 6)  return { level: 1, label: 'Zayıf şifre', color: 'bg-red-500' }
    if (len < 10) return { level: 2, label: 'Orta güçlü şifre', color: 'bg-amber-500' }
    return { level: 3, label: 'Güçlü şifre ✓', color: 'bg-emerald-500' }
  }
  const strength = passwordStrength()

  return (
    <div className="min-h-screen bg-surface flex justify-center">
      <div className="w-full max-w-[480px] min-h-screen relative border-x border-white/[0.04] flex flex-col">
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="relative p-4 flex items-center gap-3">
          {step > 0 && step < 2 ? (
            <button onClick={() => { setStep(s => s - 1); setError('') }}
              className="w-9 h-9 rounded-full bg-white/[0.05] flex items-center justify-center border border-white/[0.08] text-white/70 hover:text-white transition-colors">
              <ChevronLeft size={18} />
            </button>
          ) : step === 0 ? (
            <Link href="/giris" className="w-9 h-9 rounded-full bg-white/[0.05] flex items-center justify-center border border-white/[0.08] text-white/70 hover:text-white transition-colors">
              <ChevronLeft size={18} />
            </Link>
          ) : <div className="w-9" />}

          {step < 2 && (
            <div className="flex items-center gap-2 flex-1 justify-center">
              {STEPS.slice(0, 2).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={cn(
                    'w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center transition-all',
                    i < step  ? 'bg-emerald-500 text-white' :
                    i === step ? 'bg-indigo-500 text-white' :
                                 'bg-white/[0.08] text-white/30'
                  )}>
                    {i < step ? <Check size={12} /> : i + 1}
                  </div>
                  <span className={cn('text-xs font-medium', i === step ? 'text-white' : 'text-white/30')}>{s}</span>
                  {i < 1 && <div className="w-6 h-px bg-white/[0.10]" />}
                </div>
              ))}
            </div>
          )}
          <div className="w-9" />
        </div>

        <div className="relative flex-1 px-5 pb-8">

          {/* STEP 0 — Bilgiler */}
          {step === 0 && (
            <div className="animate-fade-in">
              <div className="mb-7 mt-2">
                <h1 className="text-2xl font-black text-white mb-1">Hesap Oluştur</h1>
                <p className="text-sm text-white/40">Tecrübelerini paylaş, güven kazan.</p>
              </div>

              <div className="space-y-3">
                {[
                  { field: 'fullName', label: 'Ad Soyad', icon: User, type: 'text', placeholder: 'Adınız Soyadınız' },
                  { field: 'email',    label: 'E-posta',  icon: Mail, type: 'email', placeholder: 'ornek@mail.com' },
                  { field: 'username', label: 'Kullanıcı Adı', icon: User, type: 'text', placeholder: 'kullanici_adi' },
                ].map(({ field, label, icon: Icon, type, placeholder }) => (
                  <div key={field}>
                    <label className="text-xs font-bold text-white/50 mb-1.5 block">{label}</label>
                    <div className="relative">
                      <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                      <input type={type} placeholder={placeholder} value={(form as any)[field]}
                        onChange={e => update(field, e.target.value)}
                        className="w-full bg-surface-2 border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-surface-1 transition-all" />
                    </div>
                  </div>
                ))}

                <div>
                  <label className="text-xs font-bold text-white/50 mb-1.5 block">Şifre</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                    <input type={showPassword ? 'text' : 'password'} placeholder="En az 6 karakter"
                      value={form.password} onChange={e => update('password', e.target.value)}
                      className="w-full bg-surface-2 border border-white/[0.08] rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {strength.level > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1,2,3].map(l => (
                          <div key={l} className={cn('h-1 flex-1 rounded-full transition-all', l <= strength.level ? strength.color : 'bg-white/[0.06]')} />
                        ))}
                      </div>
                      <p className="text-[11px] text-white/40">{strength.label}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 1 — Konum */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="mb-7 mt-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center mb-4">
                  <MapPin size={22} className="text-indigo-400" />
                </div>
                <h1 className="text-2xl font-black text-white mb-1">Konumun Nerede?</h1>
                <p className="text-sm text-white/40">Yakınındaki işletmeleri görmek için şehrini seçmemiz gerekiyor.</p>
              </div>

              {/* Konum algıla butonu */}
              <button onClick={detectLocation} disabled={locLoading}
                className={cn(
                  'w-full flex items-center gap-3 p-4 rounded-2xl border transition-all mb-4',
                  form.lat
                    ? 'border-emerald-500/30 bg-emerald-500/[0.08]'
                    : 'border-indigo-500/25 bg-indigo-500/[0.07] hover:bg-indigo-500/[0.12] hover:border-indigo-500/40',
                  locLoading && 'opacity-60 cursor-wait'
                )}>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  form.lat ? 'bg-emerald-500/20' : 'bg-indigo-500/20')}>
                  {locLoading ? (
                    <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  ) : form.lat ? (
                    <Check size={18} className="text-emerald-400" />
                  ) : (
                    <Navigation size={18} className="text-indigo-400" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className={cn('text-sm font-bold', form.lat ? 'text-emerald-400' : 'text-white')}>
                    {form.lat ? 'Konum Alındı ✓' : 'Konumumu Algıla'}
                  </div>
                  <div className="text-xs text-white/35 mt-0.5">
                    {form.lat ? form.locationName : 'GPS ile otomatik tespit et'}
                  </div>
                </div>
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs text-white/25 font-medium">veya</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              {/* Şehir dropdown */}
              <div>
                <label className="text-xs font-bold text-white/50 mb-1.5 block">Şehir Seç</label>
                <div className="relative">
                  <button onClick={() => setShowIlDropdown(!showIlDropdown)}
                    className={cn(
                      'w-full flex items-center gap-3 bg-surface-2 border rounded-xl px-4 py-3 text-sm transition-all',
                      showIlDropdown ? 'border-indigo-500/50' : 'border-white/[0.08]',
                      form.city ? 'text-white' : 'text-white/25'
                    )}>
                    <MapPin size={15} className="text-white/25 flex-shrink-0" />
                    <span className="flex-1 text-left">{form.city || 'Şehir seçin...'}</span>
                    <ChevronDown size={14} className={cn('text-white/25 transition-transform', showIlDropdown && 'rotate-180')} />
                  </button>

                  {showIlDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a2e] border border-white/[0.10] rounded-xl overflow-hidden z-50 shadow-2xl">
                      <div className="p-2 border-b border-white/[0.07]">
                        <input autoFocus placeholder="Şehir ara..." value={ilSearch}
                          onChange={e => setIlSearch(e.target.value)}
                          className="w-full bg-white/[0.05] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none" />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredIller.map(il => (
                          <button key={il} onClick={() => { update('city', il); setShowIlDropdown(false); setIlSearch('') }}
                            className={cn(
                              'w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/[0.05]',
                              form.city === il ? 'text-indigo-400 font-bold bg-indigo-500/[0.08]' : 'text-white/70'
                            )}>
                            {il}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {form.city && !form.lat && (
                <div className="mt-3 flex items-center gap-2 text-xs text-white/35">
                  <Check size={11} className="text-emerald-400" />
                  <span><span className="text-white font-semibold">{form.city}</span> seçildi</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 2 — Tamamlandı */}
          {step === 2 && (
            <div className="animate-fade-in flex flex-col items-center justify-center min-h-[50vh] text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mb-5">
                <ShieldCheck size={30} className="text-emerald-400" />
              </div>
              <h1 className="text-2xl font-black text-white mb-2">Hoş Geldin! 🎉</h1>
              <p className="text-sm text-white/45 mb-2">Hesabın oluşturuldu.</p>
              {form.city && (
                <p className="text-xs text-indigo-400 mb-7">
                  <MapPin size={10} className="inline mr-1" />
                  {form.city} bölgesindeki işletmeleri keşfediyorsun
                </p>
              )}
              <button onClick={() => router.push('/')}
                className="px-8 py-3 rounded-2xl bg-indigo-500 text-white font-bold text-sm hover:bg-indigo-400 transition-all">
                Feed'e Git
              </button>
            </div>
          )}

          {/* Hata */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* İleri butonu */}
          {step < 2 && (
            <button onClick={handleNext} disabled={loading || locLoading}
              className="w-full mt-6 py-3.5 rounded-2xl bg-indigo-500 text-white font-bold text-sm hover:bg-indigo-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Yükleniyor…</>
              ) : step === 0 ? 'Devam Et →' : 'Hesap Oluştur'}
            </button>
          )}

          {step === 0 && (
            <p className="text-center text-xs text-white/30 mt-5">
              Zaten hesabın var mı?{' '}
              <Link href="/giris" className="text-indigo-400 hover:text-indigo-300 font-semibold">Giriş Yap</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
