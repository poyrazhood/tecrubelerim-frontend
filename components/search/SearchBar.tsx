'use client'
import { Search, Sparkles, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

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
  const [dropdownStyle, setDropdownStyle] = useState({})
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (focused && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect()
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      })
    }
  }, [focused])

  const handleClear = () => setQuery('')
  const handleSearch = (q: string) => {
    setQuery(q)
    onSearch?.(q)
    setFocused(false)
    router.push(`/arama?q=${encodeURIComponent(q)}`)
  }

  return (
    <>
      <div className="relative" ref={wrapperRef}>
        <div className={cn(
          'flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-300',
          'bg-surface-2',
          focused
            ? 'border-primary-soft shadow-[0_0_0_3px_var(--primary-bg)]'
            : 'border-white/[0.08] hover:border-white/15'
        )}>
          <Search size={17} className={cn('flex-shrink-0 transition-colors', focused ? 'text-primary' : 'text-white/30')} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
            placeholder="Kadıköy'de sakin kafe..."
            className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
          />
          {query && (
            <button onClick={handleClear} className="text-white/30 hover:text-white/60 transition-colors">
              <X size={15} />
            </button>
          )}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg border flex-shrink-0">
            <Sparkles size={11} className="text-primary" />
            <span className="text-[10px] font-bold text-primary">AI</span>
          </div>
        </div>
      </div>

      {focused && query.length > 2 && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:9998}} onClick={() => setFocused(false)} />
      )}
      {focused && query.length > 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-white/[0.08] bg-surface-2 shadow-2xl overflow-hidden z-[9999] p-3">
          <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2 px-2">Arama Sonucu</div>
          <button onClick={() => { setFocused(false); window.location.href='/arama?q='+encodeURIComponent(query) }}
            className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:bg-white/5 hover:text-white transition-all mb-1">
            <Search size={13} className="text-white/20 flex-shrink-0" />
            <span>"{'{query}'}" ara</span>
          </button>
          <div className="border-t border-white/[0.06] my-2" />
          <a href={'/isletme-ekle?name='+encodeURIComponent(query)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all border border-dashed border-white/10 hover:border-white/20"
            style={{color:'var(--primary)'}}>
            <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:'var(--primary-bg)'}}>+</span>
            <div>
              <div>"{'{query}'}" işletmesini ekle</div>
              <div className="text-[10px] text-white/30 font-normal">Aradığınızı bulamadınız mı? Siz ekleyin!</div>
            </div>
          </a>
        </div>
      )}
      {focused && !query && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-white/[0.08] bg-surface-2 shadow-2xl overflow-hidden z-[999]">
          <div className="p-3">
            <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2 px-2">
              Popüler Aramalar
            </div>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSearch(s)}
                className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:bg-white/5 hover:text-white transition-all"
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