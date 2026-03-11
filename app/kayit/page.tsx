'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, User, Phone, Lock, Eye, EyeOff, ShieldCheck, Check, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

const NEIGHBORHOODS = ['Moda', 'Bostancı', 'Kadıköy', 'Beşiktaş', 'Üsküdar', 'Şişli', 'Beyoğlu', 'Diğer']

const STEPS = ['Bilgiler', 'Mahalle', 'Doğrulama']

export default function KayitPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    name: '', phone: '', password: '', neighborhood: '', isMuhtar: false,
  })
  const [otp, setOtp] = useState(['', '', '', '', '', ''])

  const update = (field: string, val: string | boolean) =>
    setForm((f) => ({ ...f, [field]: val }))

  const next = () => {
    setLoading(true)
    setTimeout(() => { setLoading(false); setStep((s) => s + 1) }, 800)
  }

  const handleOtp = (i: number, val: string) => {
    if (val.length > 1) return
    const next = [...otp]; next[i] = val; setOtp(next)
    if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus()
  }

  return (
    <div className="min-h-screen bg-surface flex justify-center">
      <div className="w-full max-w-[480px] min-h-screen relative border-x border-white/[0.04] flex flex-col">
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="relative p-4 flex items-center gap-3">
          {step > 0 ? (
            <button onClick={() => setStep((s) => s - 1)} className="w-9 h-9 rounded-full bg-white/[0.05] flex items-center justify-center border border-white/[0.08] text-white/70">
              <ChevronLeft size={18} />
            </button>
          ) : (
            <Link href="/giris" className="w-9 h-9 rounded-full bg-white/[0.05] flex items-center justify-center border border-white/[0.08] text-white/70">
              <ChevronLeft size={18} />
            </Link>
          )}

          {/* Step indicator */}
          <div className="flex items-center gap-2 flex-1 justify-center">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn(
                  'w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center transition-all',
                  i < step ? 'bg-emerald-500 text-white' :
                  i === step ? 'bg-indigo-500 text-white' :
                  'bg-white/[0.08] text-white/30'
                )}>
                  {i < step ? <Check size={12} /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn('w-8 h-px transition-all', i < step ? 'bg-emerald-500' : 'bg-white/[0.1]')} />
                )}
              </div>
            ))}
          </div>

          <div className="w-9" />
        </div>

        <div className="relative flex-1 px-6 pt-2 pb-8">
          {/* Step 0: Basic Info */}
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
                    <User size={15} className="text-white/30" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      placeholder="Adınız Soyadınız"
                      className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Telefon</label>
                  <div className="flex items-center gap-3 rounded-xl border border-white/[0.1] bg-surface-2 px-4 py-3 focus-within:border-indigo-500/50 transition-all">
                    <Phone size={15} className="text-white/30" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      placeholder="+90 5XX XXX XX XX"
                      className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Şifre</label>
                  <div className="flex items-center gap-3 rounded-xl border border-white/[0.1] bg-surface-2 px-4 py-3 focus-within:border-indigo-500/50 transition-all">
                    <Lock size={15} className="text-white/30" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => update('password', e.target.value)}
                      placeholder="En az 8 karakter"
                      className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
                    />
                    <button onClick={() => setShowPassword(!showPassword)} className="text-white/30 hover:text-white/60">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password strength */}
              {form.password && (
                <div className="mb-5">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={cn('h-1 flex-1 rounded-full transition-all', {
                        'bg-red-500': form.password.length < 6 && i <= 1,
                        'bg-amber-500': form.password.length >= 6 && form.password.length < 10 && i <= 2,
                        'bg-emerald-500': form.password.length >= 10 && i <= 3,
                        'bg-white/[0.08]': true,
                      })} />
                    ))}
                  </div>
                  <p className="text-[10px] text-white/30">
                    {form.password.length < 6 ? 'Zayıf şifre' : form.password.length < 10 ? 'Orta güçlü şifre' : 'Güçlü şifre ✓'}
                  </p>
                </div>
              )}

              <button
                onClick={next}
                disabled={loading || !form.name || !form.phone || !form.password}
                className={cn(
                  'w-full py-3.5 rounded-xl font-bold text-sm transition-all',
                  loading || !form.name || !form.phone || !form.password
                    ? 'bg-white/[0.07] text-white/30 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:opacity-90'
                )}
              >
                {loading ? 'Devam Ediyor...' : 'Devam Et →'}
              </button>

              <p className="text-center text-sm text-white/40 mt-6">
                Zaten hesabınız var mı?{' '}
                <Link href="/giris" className="text-indigo-400 font-semibold hover:text-indigo-300">Giriş Yap</Link>
              </p>
            </>
          )}

          {/* Step 1: Neighborhood */}
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
                onClick={next}
                disabled={loading || !form.neighborhood}
                className={cn(
                  'w-full py-3.5 rounded-xl font-bold text-sm transition-all',
                  loading || !form.neighborhood
                    ? 'bg-white/[0.07] text-white/30 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:opacity-90'
                )}
              >
                {loading ? 'Devam Ediyor...' : 'Devam Et →'}
              </button>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <>
              <div className="mb-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={28} className="text-emerald-400" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Doğrulama</h2>
                <p className="text-sm text-white/50">
                  <span className="text-white font-medium">{form.phone}</span> numarasına SMS gönderildi
                </p>
              </div>

              <div className="flex justify-center gap-2 mb-4">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtp(i, e.target.value)}
                    className={cn(
                      'w-12 h-14 rounded-xl text-center text-xl font-bold border bg-surface-2 text-white outline-none transition-all',
                      digit
                        ? 'border-indigo-500/60 shadow-[0_0_0_2px_rgba(99,102,241,0.15)]'
                        : 'border-white/[0.1] focus:border-indigo-500/40'
                    )}
                  />
                ))}
              </div>

              <p className="text-center text-xs text-white/30 mb-8">
                Kod gelmedi mi?{' '}
                <button className="text-indigo-400 hover:text-indigo-300">Tekrar Gönder</button>
              </p>

              <button
                onClick={() => { setLoading(true); setTimeout(() => { window.location.href = '/' }, 1000) }}
                disabled={loading || otp.some((d) => !d)}
                className={cn(
                  'w-full py-3.5 rounded-xl font-bold text-sm transition-all',
                  loading || otp.some((d) => !d)
                    ? 'bg-white/[0.07] text-white/30 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 hover:opacity-90'
                )}
              >
                {loading ? 'Hesap Oluşturuluyor...' : '🎉 Hesabımı Oluştur'}
              </button>

              <p className="text-center text-[11px] text-white/25 mt-6 leading-relaxed">
                Kayıt olarak{' '}
                <Link href="/kullanim-kosullari" className="text-white/40 underline">Kullanım Koşulları</Link>
                {' '}ve{' '}
                <Link href="/gizlilik" className="text-white/40 underline">Gizlilik Politikası</Link>
                'nı kabul etmiş olursunuz.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
