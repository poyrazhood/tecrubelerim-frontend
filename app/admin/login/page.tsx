'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    if (password === 'Tecrube@Admin2026!') {
      document.cookie = `admin_auth=${password}; path=/; max-age=86400; SameSite=Strict`
      router.push('/admin')
    } else {
      setError('Yanlış şifre')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Admin Paneli</h1>
          <p className="text-white/40 text-sm">Tecrübelerim.com</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Admin şifresi"
              className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-indigo-500/50 transition-colors"
              autoFocus
            />
          </div>
          
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
          
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-colors"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  )
}
