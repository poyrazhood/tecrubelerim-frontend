'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Eye, EyeOff, ArrowRight, Star, X, Check,
  Camera, AtSign, Mail, Lock, User, Gift,
  Loader2, AlertCircle, CheckCircle2
} from 'lucide-react'

/* ─── Tip tanımları ─── */
type AuthMode = 'login' | 'register'
type AvatarOption = { id: string; emoji: string; bg: string }

/* ─── Sabit avatar seçenekleri ─── */
const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'a1', emoji: '🦊', bg: '#f97316' },
  { id: 'a2', emoji: '🐺', bg: '#6366f1' },
  { id: 'a3', emoji: '🦁', bg: '#eab308' },
  { id: 'a4', emoji: '🐻', bg: '#8b5cf6' },
  { id: 'a5', emoji: '🐼', bg: '#64748b' },
  { id: 'a6', emoji: '🦋', bg: '#ec4899' },
  { id: 'a7', emoji: '🦅', bg: '#0ea5e9' },
  { id: 'a8', emoji: '🐉', bg: '#22c55e' },
]

/* ─── Parçacık animasyonu (canvas) ─── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number
    const W = canvas.width = window.innerWidth
    const H = canvas.height = window.innerHeight
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.1,
    }))
    function draw() {
      ctx.clearRect(0, 0, W, H)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(129,140,248,${p.alpha})`
        ctx.fill()
      })
      // Bağlantı çizgileri
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(99,102,241,${0.12 * (1 - dist / 100)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animId)
  }, [])
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}

/* ─── Input sarmalayıcı ─── */
function Field({
  icon: Icon, label, type, value, onChange, placeholder, required = true,
  rightSlot, hint, hintColor
}: {
  icon: any; label: string; type: string; value: string
  onChange: (v: string) => void; placeholder: string; required?: boolean
  rightSlot?: React.ReactNode; hint?: string; hintColor?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-widest mb-1.5"
        style={{ color: focused ? '#818cf8' : 'rgba(255,255,255,0.4)' }}>
        {label}
      </label>
      <div className="relative flex items-center rounded-xl transition-all duration-200"
        style={{
          background: focused ? 'rgba(99,102,241,0.07)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${focused ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.09)'}`,
          boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.08)' : 'none',
        }}>
        <Icon size={14} className="absolute left-3.5 flex-shrink-0"
          style={{ color: focused ? '#818cf8' : 'rgba(255,255,255,0.25)' }} />
        <input
          type={type} value={value} required={required}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full pl-9 pr-4 py-3 bg-transparent text-sm text-white placeholder-white/20 outline-none"
          style={{ paddingRight: rightSlot ? '2.5rem' : undefined }}
        />
        {rightSlot && (
          <div className="absolute right-3">{rightSlot}</div>
        )}
      </div>
      {hint && (
        <p className="text-[11px] mt-1.5 flex items-center gap-1" style={{ color: hintColor }}>
          {hint}
        </p>
      )}
    </div>
  )
}

/* ─── Ana bileşen ─── */
interface AuthModalProps {
  initialMode?: AuthMode
  onClose?: () => void
  isPage?: boolean  // true ise tam sayfa, false ise modal overlay
}

export default function AuthModal({ initialMode = 'login', onClose, isPage = false }: AuthModalProps) {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /* Giriş formu */
  const [loginForm, setLoginForm] = useState({ email: '', password: '', remember: false })

  /* Kayıt formu */
  const [regForm, setRegForm] = useState({
    fullName: '', email: '', username: '', password: '', referral: ''
  })
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarOption>(AVATAR_OPTIONS[0])
  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  /* Username kontrolü */
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'taken' | 'available'>('idle')
  const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!regForm.username || regForm.username.length < 3) {
      setUsernameStatus('idle')
      return
    }
    setUsernameStatus('checking')
    if (usernameTimer.current) clearTimeout(usernameTimer.current)
    usernameTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/check-username?username=${regForm.username}`
        )
        const data = await res.json()
        setUsernameStatus(data.available ? 'available' : 'taken')
      } catch {
        setUsernameStatus('idle')
      }
    }, 600)
  }, [regForm.username])

  /* Avatar yükleme */
  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setUploadedAvatar(ev.target?.result as string)
    reader.readAsDataURL(file)
    setShowAvatarPicker(false)
  }

  /* Şifre gücü */
  const pwStrength = (() => {
    const p = mode === 'login' ? loginForm.password : regForm.password
    if (!p) return 0
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })()
  const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e']
  const strengthLabels = ['', 'Zayıf', 'Orta', 'İyi', 'Güçlü']

  /* Form submit */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (mode === 'register' && usernameStatus === 'taken') return
    setLoading(true); setError('')
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const body = mode === 'login'
        ? { identifier: loginForm.email, password: loginForm.password }
        : { ...regForm, avatarEmoji: uploadedAvatar ? null : selectedAvatar.emoji, avatarUrl: uploadedAvatar }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Bir hata oluştu')
      const token = data.token || data.accessToken
      if (token) {
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('auth_token', token)
      }
      if (onClose) onClose()
      else window.location.href = '/'
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const usernameHint = usernameStatus === 'checking' ? '...'
    : usernameStatus === 'available' ? `@${regForm.username} müsait ✓`
    : usernameStatus === 'taken' ? `@${regForm.username} kullanımda`
    : ''
  const usernameHintColor = usernameStatus === 'available' ? '#22c55e'
    : usernameStatus === 'taken' ? '#ef4444'
    : 'rgba(255,255,255,0.3)'

  /* ── UI ── */
  const inner = (
    <div
      className="relative w-full max-w-[440px] rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(14,14,20,0.97)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.08)',
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* Üst ışıma şeridi */}
      <div className="h-px w-full"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)' }} />

      {/* Kapatma */}
      {onClose && (
        <button onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/[0.07] transition-all z-10">
          <X size={15} />
        </button>
      )}

      <div className="p-8">
        {/* Logo + başlık */}
        <div className="flex items-center gap-3 mb-7">
          <a href="/"><div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Star size={17} className="text-white fill-white" />
          </div></a>
          <div>
            <h1 className="text-base font-bold text-white leading-none mb-0.5">
              {mode === 'login' ? 'Tekrar hoş geldiniz' : 'Hesap oluştur'}
            </h1>
            <p className="text-[11px] text-white/70">
              {mode === 'login' ? 'Tecrübelerim\'e giriş yapın' : 'Ücretsiz, birkaç dakika sürer'}
            </p>
          </div>
        </div>

        {/* Tab geçişi */}
        <div className="flex rounded-xl mb-6 p-1"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {(['login', 'register'] as AuthMode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); setError('') }}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
              style={{
                background: mode === m ? 'rgba(99,102,241,0.25)' : 'transparent',
                color: mode === m ? '#a5b4fc' : 'rgba(255,255,255,0.35)',
                border: mode === m ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
              }}>
              {m === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
            </button>
          ))}
        </div>

        {/* Hata */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl flex items-center gap-2.5 text-sm"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
            <span className="text-red-400 text-xs">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ─── GİRİŞ FORMU ─── */}
          {mode === 'login' && (
            <>
              <Field icon={Mail} label="E-posta" type="email" placeholder="ornek@email.com"
                value={loginForm.email} onChange={v => setLoginForm(p => ({ ...p, email: v }))} />
              <Field icon={Lock} label="Şifre" type={showPassword ? 'text' : 'password'}
                placeholder="Şifreniz" value={loginForm.password}
                onChange={v => setLoginForm(p => ({ ...p, password: v }))}
                rightSlot={
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="text-white/30 hover:text-white/60 transition-colors">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                }
              />
              {/* Şifre gücü çubuğu */}
              {loginForm.password && (
                <div className="flex gap-1.5 -mt-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-0.5 flex-1 rounded-full transition-all duration-300"
                      style={{ background: i <= pwStrength ? strengthColors[pwStrength] : 'rgba(255,255,255,0.06)' }} />
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div
                    onClick={() => setLoginForm(p => ({ ...p, remember: !p.remember }))}
                    className="w-4 h-4 rounded flex items-center justify-center transition-all cursor-pointer"
                    style={{
                      background: loginForm.remember ? 'rgba(99,102,241,0.8)' : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${loginForm.remember ? '#6366f1' : 'rgba(255,255,255,0.15)'}`,
                    }}>
                    {loginForm.remember && <Check size={10} className="text-white" />}
                  </div>
                  <span className="text-xs text-white/45 group-hover:text-white/65 transition-colors">Beni hatırla</span>
                </label>
                <Link href="/sifremi-unuttum" className="text-xs text-indigo-400/80 hover:text-indigo-300 transition-colors">
                  Şifremi unuttum
                </Link>
              </div>
            </>
          )}

          {/* ─── KAYIT FORMU ─── */}
          {mode === 'register' && (
            <>
              {/* Avatar seçici */}
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <button type="button" onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                    className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center text-2xl transition-transform hover:scale-105 active:scale-95"
                    style={{
                      background: uploadedAvatar ? 'transparent' : selectedAvatar.bg + '33',
                      border: `2px solid ${selectedAvatar.bg}55`,
                    }}>
                    {uploadedAvatar
                      ? <img src={uploadedAvatar} alt="avatar" className="w-full h-full object-cover" />
                      : <span>{selectedAvatar.emoji}</span>
                    }
                  </button>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: '#6366f1', border: '2px solid rgba(14,14,20,0.97)' }}>
                    <Camera size={9} className="text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-white/60 mb-2">Profil Görseli</p>
                  {showAvatarPicker && (
                    <div className="flex flex-wrap gap-2">
                      {AVATAR_OPTIONS.map(av => (
                        <button key={av.id} type="button"
                          onClick={() => { setSelectedAvatar(av); setUploadedAvatar(null); setShowAvatarPicker(false) }}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-base transition-all hover:scale-110"
                          style={{
                            background: av.bg + '33',
                            border: `1.5px solid ${selectedAvatar.id === av.id ? av.bg : 'transparent'}`,
                          }}>
                          {av.emoji}
                        </button>
                      ))}
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px dashed rgba(255,255,255,0.2)' }}>
                        <Camera size={12} className="text-white/50" />
                      </button>
                    </div>
                  )}
                  {!showAvatarPicker && (
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowAvatarPicker(true)}
                        className="text-[11px] px-2.5 py-1 rounded-lg text-indigo-400 transition-all hover:bg-indigo-500/10"
                        style={{ border: '1px solid rgba(99,102,241,0.25)' }}>
                        Emoji seç
                      </button>
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="text-[11px] px-2.5 py-1 rounded-lg text-white/40 transition-all hover:bg-white/[0.05]"
                        style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                        Fotoğraf yükle
                      </button>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>

              <Field icon={User} label="Ad Soyad" type="text" placeholder="Ahmet Yılmaz"
                value={regForm.fullName} onChange={v => setRegForm(p => ({ ...p, fullName: v }))} />

              <Field icon={AtSign} label="Kullanıcı Adı" type="text" placeholder="kullanici_adi"
                value={regForm.username}
                onChange={v => setRegForm(p => ({ ...p, username: v.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                hint={usernameHint} hintColor={usernameHintColor}
                rightSlot={
                  usernameStatus === 'checking' ? <Loader2 size={13} className="text-white/30 animate-spin" />
                  : usernameStatus === 'available' ? <CheckCircle2 size={13} className="text-emerald-400" />
                  : usernameStatus === 'taken' ? <AlertCircle size={13} className="text-red-400" />
                  : null
                }
              />

              <Field icon={Mail} label="E-posta" type="email" placeholder="ornek@email.com"
                value={regForm.email} onChange={v => setRegForm(p => ({ ...p, email: v }))} />

              <Field icon={Lock} label="Şifre" type={showPassword ? 'text' : 'password'}
                placeholder="En az 8 karakter" value={regForm.password}
                onChange={v => setRegForm(p => ({ ...p, password: v }))}
                rightSlot={
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="text-white/30 hover:text-white/60 transition-colors">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                }
              />
              {regForm.password && (
                <div className="-mt-1 space-y-1">
                  <div className="flex gap-1.5">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-0.5 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= pwStrength ? strengthColors[pwStrength] : 'rgba(255,255,255,0.06)' }} />
                    ))}
                  </div>
                  <p className="text-[11px]" style={{ color: strengthColors[pwStrength] }}>
                    {strengthLabels[pwStrength]}
                  </p>
                </div>
              )}

              {/* Referral kodu — opsiyonel */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest mb-1.5 text-white/30">
                  Referans Kodu <span className="normal-case font-normal not-italic">(isteğe bağlı)</span>
                </label>
                <div className="relative">
                  <Gift size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
                  <input type="text" value={regForm.referral}
                    onChange={e => setRegForm(p => ({ ...p, referral: e.target.value.toUpperCase() }))}
                    placeholder="ÖRNEK123"
                    maxLength={12}
                    className="w-full pl-9 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/15 outline-none transition-all tracking-widest"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      fontFamily: 'monospace',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.4)'; e.target.style.background = 'rgba(99,102,241,0.05)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.background = 'rgba(255,255,255,0.03)' }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit butonu */}
          <button type="submit" disabled={loading || (mode === 'register' && usernameStatus === 'taken')}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] mt-2"
            style={{
              background: loading || (mode === 'register' && usernameStatus === 'taken')
                ? 'rgba(99,102,241,0.35)'
                : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(99,102,241,0.3)',
            }}>
            {loading
              ? <><Loader2 size={15} className="animate-spin" /> {mode === 'login' ? 'Giriş yapılıyor...' : 'Hesap oluşturuluyor...'}</>
              : <>{mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'} <ArrowRight size={15} /></>
            }
          </button>

          {/* Google */}
          <button type="button"
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-xs text-white/55 hover:text-white/80 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.16)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)')}>
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google ile devam et
          </button>
        </form>

        {mode === 'register' && (
          <p className="text-center text-[10px] text-white/20 mt-4 leading-relaxed">
            Kayıt olarak{' '}
            <Link href="/kullanim-kosullari" className="text-white/35 underline hover:text-white/50 transition-colors">
              Kullanım Koşulları
            </Link>
            {' '}ve{' '}
            <Link href="/gizlilik" className="text-white/35 underline hover:text-white/50 transition-colors">
              Gizlilik Politikası
            </Link>
            'nı kabul etmiş olursunuz.
          </p>
        )}
      </div>
    </div>
  )

  /* Modal overlay modu */
  if (!isPage) {
    return (
      <>
        <ParticleCanvas />
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)', zIndex: 50 }}
          onClick={onClose}
        >
          <div className="animate-in fade-in zoom-in-95 duration-200">
            {inner}
          </div>
        </div>
      </>
    )
  }

  /* Tam sayfa modu (eski giris/kayit sayfaları için) */
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative" style={{ background: '#0C0C0F' }}>
      <ParticleCanvas />
      <div className="relative z-10 w-full flex flex-col items-center">
        <div>{inner}</div>
        <div className="mt-8 text-center">
        <p className="text-[11px] leading-relaxed" style={{color: "rgba(255,255,255,0.5)"}}>
          <a href="/sozlesme/privacy_policy" className="hover:text-white/60 transition-colors">Gizlilik</a>
          {' · '}
          <a href="/sozlesme/terms_of_service" className="hover:text-white/60 transition-colors">Kullanım Koşulları</a>
          {' · '}
          <a href="/sozlesme/help" className="hover:text-white/60 transition-colors">Yardım</a>
          {' · '}
          <a href="/iletisim" className="hover:text-white/60 transition-colors">İletişim</a>
        </p>
        <p className="text-[11px] mt-1" style={{color: "rgba(255,255,255,0.35)"}}>© 2026 Tecrübelerim</p>
        </div>
      </div>
    </div>
  )
}
