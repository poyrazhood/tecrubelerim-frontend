'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, ChevronLeft, Sparkles, ShieldCheck, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])

  const handleSubmit = () => {
    if (step === 'credentials') {
      setLoading(true)
      setTimeout(() => { setLoading(false); setStep('otp') }, 1000)
    } else {
      setLoading(true)
      setTimeout(() => { setLoading(false); window.location.href = '/' }, 1000)
    }
  }

  const handleOtpChange = (i: number, val: string) => {
    if (val.length > 1) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    if (val && i < 5) {
      document.getElementById(`otp-${i + 1}`)?.focus()
    }
  }

  return (
    <div className="min-h-screen bg-surface flex justify-center">
      <div className="w-full max-w-[480px] min-h-screen relative border-x border-white/[0.04] flex flex-col">
        {/* Gradient top */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="relative p-4 flex items-center gap-3">
          <Link href="/" className="w-9 h-9 rounded-full bg-white/[0.05] flex items-center justify-center border border-white/[0.08] text-white/70 hover:text-white transition-colors">
            <ChevronLeft size={18} />
          </Link>
        </div>

        <div className="relative flex-1 flex flex-col px-6 pt-4 pb-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30 mb-4">
              <span className="text-2xl font-black text-white">T</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Tecrübelerim</h1>
            <p className="text-sm text-white/40 mt-1">Güvenilir mahalle deneyimleri</p>
          </div>

          {step === 'credentials' ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">Giriş Yap</h2>
                <p className="text-sm text-white/40">Hesabınıza erişin</p>
              </div>

              <div className="space-y-3 mb-6">
                {/* Phone input */}
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">
                    Telefon Numarası
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-surface-2 px-4 py-3 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all">
                    <Phone size={15} className="text-white/30" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+90 5XX XXX XX XX"
                      className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
                    />
                  </div>
                </div>

                {/* Password input */}
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">
                    Şifre
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-surface-2 px-4 py-3 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
                    />
                    <button onClick={() => setShowPassword(!showPassword)} className="text-white/30 hover:text-white/60 transition-colors">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <Link href="/sifremi-unuttum" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                    Şifremi Unuttum
                  </Link>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !phone}
                className={cn(
                  'w-full py-3.5 rounded-xl font-bold text-sm transition-all',
                  loading || !phone
                    ? 'bg-white/[0.07] text-white/30 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:opacity-90'
                )}
              >
                {loading ? 'Gönderiliyor...' : 'SMS Kodu Gönder'}
              </button>

              {/* Trust badge */}
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-white/30">
                <ShieldCheck size={13} className="text-emerald-400/60" />
                <span>SMS ile güvenli doğrulama</span>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.06]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-surface px-3 text-xs text-white/30">veya</span>
                </div>
              </div>

              {/* Google */}
              <button className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm font-medium hover:bg-white/[0.08] transition-all mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google ile devam et
              </button>

              <p className="text-center text-sm text-white/40 mt-6">
                Hesabınız yok mu?{' '}
                <Link href="/kayit" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
                  Kayıt Ol
                </Link>
              </p>
            </>
          ) : (
            /* OTP Step */
            <>
              <div className="mb-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                  <Phone size={24} className="text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">SMS Kodu</h2>
                <p className="text-sm text-white/50">
                  <span className="text-white font-medium">{phone || '+90 5XX XXX XX XX'}</span> numarasına gönderildi
                </p>
              </div>

              <div className="flex justify-center gap-2 mb-8">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    className={cn(
                      'w-12 h-14 rounded-xl text-center text-xl font-bold border bg-surface-2 text-white outline-none transition-all',
                      digit
                        ? 'border-indigo-500/60 shadow-[0_0_0_2px_rgba(99,102,241,0.15)]'
                        : 'border-white/[0.1] focus:border-indigo-500/50'
                    )}
                  />
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || otp.some((d) => !d)}
                className={cn(
                  'w-full py-3.5 rounded-xl font-bold text-sm transition-all mb-4',
                  loading || otp.some((d) => !d)
                    ? 'bg-white/[0.07] text-white/30 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:opacity-90'
                )}
              >
                {loading ? 'Doğrulanıyor...' : 'Giriş Yap'}
              </button>

              <div className="flex items-center justify-center gap-4 text-xs">
                <span className="text-white/30">Kod gelmedi mi?</span>
                <button className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
                  Tekrar Gönder
                </button>
              </div>

              <button
                onClick={() => setStep('credentials')}
                className="mt-4 w-full text-center text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                ← Geri Dön
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
