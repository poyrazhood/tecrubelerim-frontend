'use client'

import { Search, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const SUGGESTIONS = [
  'Kadıköy\'de sakin kafe',
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

  const handleClear = () => setQuery('')
  const handleSearch = (q: string) => {
    setQuery(q)
    onSearch?.(q)
    setFocused(false)
  }

  return (
    <div className="relative">
      <div
        className={cn(
          'flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-300',
          'bg-surface-2',
          focused
            ? 'border-indigo-500/50 shadow-[0_0_0_3px_rgba(99,102,241,0.1)]'
            : 'border-white/[0.08] hover:border-white/15'
        )}
      >
        <Search size={17} className={cn('flex-shrink-0 transition-colors', focused ? 'text-indigo-400' : 'text-white/30')} />

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

        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex-shrink-0">
          <Sparkles size={11} className="text-indigo-400" />
          <span className="text-[10px] font-bold text-indigo-400">AI</span>
        </div>
      </div>

      {/* Suggestions dropdown */}
      {focused && !query && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-white/[0.08] bg-surface-2 shadow-2xl z-50 overflow-hidden">
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
    </div>
  )
}
