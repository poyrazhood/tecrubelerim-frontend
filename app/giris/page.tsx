'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ChevronLeft, ShieldCheck, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/AuthContext'
import { ApiError } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!identifier || !password) return
    setError('')
    setLoading(true)
    try {
      await login(identifier, password)
      router.push('/')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Bir hata oluştu, lütfen tekrar deneyin.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
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

          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1">Giriş Yap</h2>
            <p className="text-sm text-white/40">Hesabınıza erişin</p>
          </div>

          {/* Hata mesajı */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3 mb-6">
            {/* Identifier input */}
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">
                E-posta veya Kullanıcı Adı
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-surface-2 px-4 py-3 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all">
                <Mail size={15} className="text-white/30 shrink-0" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="ornek@mail.com veya kullanici_adi"
                  className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
                  autoComplete="username"
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
                  onKeyDown={handleKeyDown}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
                  autoComplete="current-password"
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
            disabled={loading || !identifier || !password}
            className={cn(
              'w-full py-3.5 rounded-xl font-bold text-sm transition-all',
              loading || !identifier || !password
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
                Giriş yapılıyor...
              </span>
            ) : 'Giriş Yap'}
          </button>

          {/* Trust badge */}
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-white/30">
            <ShieldCheck size={13} className="text-emerald-400/60" />
            <span>Verileriniz güvende</span>
          </div>

          <p className="text-center text-sm text-white/40 mt-8">
            Hesabınız yok mu?{' '}
            <Link href="/kayit" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}