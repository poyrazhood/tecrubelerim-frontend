'use client'
import { Search, Sparkles, X, ArrowRight } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const ROTATING_PLACEHOLDERS = [
  "Kadıköy'de sakin kafe...",
  "Romantik akşam yemeği...",
  "Şeffaf fiyatlı oto servis...",
  "Çocuklu aile restoranı...",
  "Laptop ile çalışılacak yer...",
  "En iyi börek nerede...",
]

const SUGGESTIONS = [
  "Kadıköy'de sakin kafe",
  'Bostancı oto servis şeffaf fiyat',
  'Öğrenci dostu restoran',
  'Hukuk bürosu İstanbul',
  'Matematik kursu Kadıköy',
]

interface SearchBarProps {
  onSearch?: (query: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [placeholderVisible, setPlaceholderVisible] = useState(true)
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Rotate placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderVisible(false)
      setTimeout(() => {
        setPlaceholderIdx(i => (i + 1) % ROTATING_PLACEHOLDERS.length)
        setPlaceholderVisible(true)
      }, 400)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = (q: string) => {
    setQuery(q)
    onSearch?.(q)
    setFocused(false)
    router.push(`/arama?q=${encodeURIComponent(q)}`)
  }

  return (
    <>
      <div className="relative" ref={wrapperRef}>
        {/* Glow effect */}
        <div className={cn(
          'absolute inset-0 rounded-2xl transition-opacity duration-500 pointer-events-none',
          'bg-gradient-to-r from-indigo-500/20 via-purple-500/10 to-pink-500/20 blur-xl',
          focused ? 'opacity-100' : 'opacity-0'
        )} />

        <div className={cn(
          'relative flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-300',
          'bg-surface-2',
          focused
            ? 'border-indigo-500/40 shadow-[0_0_0_3px_rgba(99,102,241,0.1)]'
            : 'border-white/[0.08] hover:border-white/15'
        )}>
          {/* Animated search icon */}
          <div className={cn(
            'flex-shrink-0 transition-all duration-300',
            focused ? 'text-indigo-400 scale-110' : 'text-white/30'
          )}>
            <Search size={17} />
          </div>

          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 200)}
              onKeyDown={(e) => e.key === 'Enter' && query.trim() && handleSearch(query)}
              placeholder=""
              className="w-full bg-transparent text-sm text-white outline-none"
            />
            {/* Animated placeholder */}
            {!query && (
              <span className={cn(
                'absolute inset-0 flex items-center text-sm pointer-events-none transition-all duration-400',
                placeholderVisible ? 'opacity-40 translate-y-0' : 'opacity-0 -translate-y-1',
                focused ? 'text-white/50' : 'text-white/25'
              )}>
                {ROTATING_PLACEHOLDERS[placeholderIdx]}
              </span>
            )}
          </div>

          {query && (
            <button onClick={() => setQuery('')} className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0">
              <X size={15} />
            </button>
          )}

          {/* AI badge */}
          <button
            onClick={() => query.trim() && handleSearch(query)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border flex-shrink-0 transition-all duration-300',
              query.trim()
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30 cursor-pointer'
                : 'border-white/[0.08] text-white/30'
            )}
          >
            <Sparkles size={11} className={query.trim() ? 'text-indigo-400' : 'text-white/30'} />
            <span className="text-[10px] font-bold">AI</span>
            {query.trim() && <ArrowRight size={10} />}
          </button>
        </div>
      </div>

      {/* Overlay */}
      {focused && query.length > 2 && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:9998}} onClick={() => setFocused(false)} />
      )}

      {/* Dropdown — query */}
      {focused && query.length > 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-white/[0.08] bg-surface-2 shadow-2xl overflow-hidden z-[9999] p-3">
          <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2 px-2">Arama</div>
          <button
            onClick={() => handleSearch(query)}
            className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:bg-indigo-500/10 hover:text-white transition-all mb-1 group"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/25 transition-colors">
              <Sparkles size={12} className="text-indigo-400" />
            </div>
            <div>
              <span className="font-medium">"{query}"</span>
              <span className="text-white/40"> için AI arama</span>
            </div>
            <ArrowRight size={13} className="ml-auto text-white/20 group-hover:text-indigo-400 transition-colors" />
          </button>
          <div className="border-t border-white/[0.06] my-2" />
          <a
            href={'/isletme-ekle?name='+encodeURIComponent(query)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all border border-dashed border-white/10 hover:border-white/20"
            style={{color:'var(--primary)'}}
          >
            <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-sm" style={{background:'var(--primary-bg)'}}>+</span>
            <div>
              <div>"{query}" işletmesini ekle</div>
              <div className="text-[10px] text-white/30 font-normal">Aradığınızı bulamadınız mı? Siz ekleyin!</div>
            </div>
          </a>
        </div>
      )}

      {/* Dropdown — empty */}
      {focused && !query && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-white/[0.08] bg-surface-2 shadow-2xl overflow-hidden z-[999]">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-3 px-2">
              <Sparkles size={11} className="text-indigo-400" />
              <span className="text-[10px] font-bold text-indigo-400/70 uppercase tracking-wider">AI ile ara</span>
            </div>
            <p className="text-xs text-white/30 px-2 mb-3 leading-relaxed">
              Doğal dille yaz — "romantik akşam yemeği" veya "çocuklu aile için sessiz kafe" gibi sorgular yapabilirsin.
            </p>
            <div className="border-t border-white/[0.06] mb-2 mt-1" />
            <div className="text-[10px] font-bold text-white/20 uppercase tracking-wider mb-2 px-2">Örnek aramalar</div>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSearch(s)}
                className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:bg-white/5 hover:text-white transition-all"
              >
                <Search size={13} className="text-white/20 flex-shrink-0" />
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

