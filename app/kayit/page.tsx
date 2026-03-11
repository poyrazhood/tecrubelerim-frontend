'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, User, Mail, Lock, Eye, EyeOff, ShieldCheck, Check, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/AuthContext'
import { ApiError } from '@/lib/api'

const NEIGHBORHOODS = ['Moda', 'Bostancı', 'Kadıköy', 'Beşiktaş', 'Üsküdar', 'Şişli', 'Beyoğlu', 'Diğer']
const STEPS = ['Bilgiler', 'Mahalle', 'Tamamlandı']

export default function KayitPage() {
  const router = useRouter()
  const { register } = useAuth()

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    neighborhood: '',
    isMuhtar: false,
  })

  const update = (field: string, val: string | boolean) =>
    setForm((f) => ({ ...f, [field]: val }))

  const handleNext = async () => {
    setError('')

    if (step === 0) {
      // Validasyon
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
      if (!form.neighborhood) {
        setError('Bir mahalle seçin.')
        return
      }
      // Gerçek API çağrısı
      setLoading(true)
      try {
        await register({
          email: form.email,
          username: form.username,
          password: form.password,
          fullName: form.fullName,
        })
        setStep(2)
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message)
        } else {
          setError('Kayıt sırasında bir hata oluştu.')
        }
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
            <button
              onClick={() => { setStep((s) => s - 1); setError('') }}
              className="w-9 h-9 rounded-full bg-white/[0.05] flex items-center justify-center border border-white/[0.08] text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
          ) : step === 0 ? (
            <Link href="/giris" className="w-9 h-9 rounded-full bg-white/[0.05] flex items-center justify-center border border-white/[0.08] text-white/70 hover:text-white transition-colors">
              <ChevronLeft size={18} />
            </Link>
          ) : <div className="w-9" />}

          {/* Step indicator */}
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
                  {i < 1 && (
                    <div className={cn('w-8 h-px transition-all', i < step ? 'bg-emerald-500' : 'bg-white/[0.1]')} />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="w-9" />
        </div>

        <div className="relative flex-1 px-6 pt-2 pb-8">

          {/* Hata mesajı */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* ─── Step 0: Bilgiler ───────────────────────────────────────────── */}
          {step === 0 && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-black text-white mb-1">Hesap Oluştur</h2>
                <p className="text-sm text-white/40">Tecrübelerini mahallende paylaş</p>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Ad Soyad</label>
                  <div className="flex items-center gap-3 rounded-xl border border-white/[0.1] bg-surface-2 px-4 py-3 focus-within:border-indigo-500/50 transition-all">
                    <User size={15} className="text-white/30 shrink-0" />
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => update('fullName', e.target.value)}
                      placeholder="Adınız Soyadınız"
                      className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">E-posta</label>
                  <div className="flex items-center gap-3 rounded-xl border border-white/[0.1] bg-surface-2 px-4 py-3 focus-within:border-indigo-500/50 transition-all">
                    <Mail size={15} className="text-white/30 shrink-0" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      placeholder="ornek@mail.com"
                      className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Kullanıcı Adı</label>
                  <div className="flex items-center gap-3 rounded-xl border border-white/[0.1] bg-surface-2 px-4 py-3 focus-within:border-indigo-500/50 transition-all">
                    <span className="text-white/30 text-sm font-medium shrink-0">@</span>
                    <input
                      type="text"
                      value={form.username}
                      onChange={(e) => update('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="kullanici_adi"
                      className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Şifre</label>
                  <div className="flex items-center gap-3 rounded-xl border border-white/[0.1] bg-surface-2 px-4 py-3 focus-within:border-indigo-500/50 transition-all">
                    <Lock size={15} className="text-white/30 shrink-0" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => update('password', e.target.value)}
                      placeholder="En az 6 karakter"
                      className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
                      autoComplete="new-password"
                    />
                    <button onClick={() => setShowPassword(!showPassword)} className="text-white/30 hover:text-white/60 transition-colors">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password strength */}
              {form.password && (
                <div className="mb-5">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={cn(
                        'h-1 flex-1 rounded-full transition-all',
                        i <= strength.level ? strength.color : 'bg-white/[0.08]'
                      )} />
                    ))}
                  </div>
                  <p className="text-[10px] text-white/30">{strength.label}</p>
                </div>
              )}

              <button
                onClick={handleNext}
                disabled={loading || !form.fullName || !form.email || !form.username || !form.password}
                className={cn(
                  'w-full py-3.5 rounded-xl font-bold text-sm transition-all',
                  !form.fullName || !form.email || !form.username || !form.password
                    ? 'bg-white/[0.07] text-white/30 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:opacity-90 active:scale-[0.98]'
                )}
              >
                Devam Et →
              </button>

              <p className="text-center text-sm text-white/40 mt-6">
                Zaten hesabınız var mı?{' '}
                <Link href="/giris" className="text-indigo-400 font-semibold hover:text-indigo-300">Giriş Yap</Link>
              </p>
            </>
          )}

          {/* ─── Step 1: Mahalle ────────────────────────────────────────────── */}
          {step === 1 && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-black text-white mb-1">Mahalleniz</h2>
                <p className="text-sm text-white/40">Hangi mahallede yaşıyorsunuz?</p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-6">
                {NEIGHBORHOODS.map((n) => (
                  <button
                    key={n}
                    onClick={() => update('neighborhood', n)}
                    className={cn(
                      'p-3 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all',
                      form.neighborhood === n
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                        : 'bg-white/[0.03] border-white/[0.08] text-white/60 hover:bg-white/[0.06]'
                    )}
                  >
                    <MapPin size={13} className={form.neighborhood === n ? 'text-indigo-400' : 'text-white/20'} />
                    {n}
                    {form.neighborhood === n && <Check size={12} className="ml-auto text-indigo-400" />}
                  </button>
                ))}
              </div>

              {/* Muhtar option */}
              <button
                onClick={() => update('isMuhtar', !form.isMuhtar)}
                className={cn(
                  'w-full p-4 rounded-2xl border text-left transition-all mb-6',
                  form.isMuhtar
                    ? 'bg-amber-500/15 border-amber-500/40'
                    : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05]'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black',
                    form.isMuhtar ? 'bg-amber-500/25 text-amber-400' : 'bg-white/[0.06] text-white/30'
                  )}>
                    M
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">Mahalle Muhtarı Ol</div>
                    <div className="text-xs text-white/40 mt-0.5">Mahallenin uzman yorumcusu olarak tanın</div>
                  </div>
                  <div className={cn(
                    'ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                    form.isMuhtar ? 'bg-amber-500 border-amber-500' : 'border-white/20'
                  )}>
                    {form.isMuhtar && <Check size={11} className="text-black" />}
                  </div>
                </div>
              </button>

              <button
                onClick={handleNext}
                disabled={loading || !form.neighborhood}
                className={cn(
                  'w-full py-3.5 rounded-xl font-bold text-sm transition-all',
                  loading || !form.neighborhood
                    ? 'bg-white/[0.07] text-white/30 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:opacity-90 active:scale-[0.98]'
                )}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Hesap oluşturuluyor...
                  </span>
                ) : 'Hesabımı Oluştur →'}
              </button>
            </>
          )}

          {/* ─── Step 2: Tamamlandı ─────────────────────────────────────────── */}
          {step === 2 && (
            <div className="flex flex-col items-center justify-center flex-1 text-center py-12">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={36} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Hoş Geldin! 🎉</h2>
              <p className="text-sm text-white/50 mb-2">
                <span className="text-white font-semibold">@{form.username}</span> hesabın oluşturuldu.
              </p>
              <p className="text-xs text-white/30 mb-10">
                İlk yorumunu yazarak TrustScore kazanmaya başla.
              </p>

              <button
                onClick={() => router.push('/')}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Ana Sayfaya Git →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}