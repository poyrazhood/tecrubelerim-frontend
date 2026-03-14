'use client'

import { Award } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MuhtarUser } from '@/types'
import Link from 'next/link'

interface MuhtarLeaderboardProps {
  muhtarlar: MuhtarUser[]
}

const RANK_STYLES = {
  1: { bg: 'from-amber-400 to-yellow-600', text: 'text-black', label: 'ğŸ¥‡' },
  2: { bg: 'from-slate-300 to-slate-400', text: 'text-black', label: 'ğŸ¥ˆ' },
  3: { bg: 'from-amber-700 to-amber-800', text: 'text-white', label: 'ğŸ¥‰' },
}

export function MuhtarLeaderboard({ muhtarlar }: MuhtarLeaderboardProps) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-surface-1 p-4 mb-4">
      <div className="flex items-center gap-2 mb-1">
        <Award size={15} className="text-amber-400" />
        <span className="font-bold text-sm text-white">Mahalle MuhtarlarÄ±</span>
        <span className="ml-auto text-xs text-white/30 hover:text-white/60 cursor-pointer transition-colors">
            <Link href="/muhtarlar" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              TÃ¼mÃ¼ â†’
            </Link>
          </span>
      </div>
      <p className="text-xs text-white/40 mb-4">En gÃ¼venilir ve faydalÄ± yorumcular</p>

      <div className="space-y-2">
        {muhtarlar.map((muhtar) => {
          const rankStyle = RANK_STYLES[muhtar.rank as 1 | 2 | 3]
          const handle = muhtar.handle?.replace('@', '') || muhtar.id
          return (
            <Link href={`/kullanici/${handle}`} key={muhtar.id}>
            <div
              className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.06] transition-all cursor-pointer group"
            >
              {/* Rank */}
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-black bg-gradient-to-br flex-shrink-0',
                  rankStyle.bg, rankStyle.text
                )}
              >
                {muhtar.rank}
              </div>

              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {muhtar.image ? (
                  <img src={muhtar.image} alt={muhtar.name} className="w-9 h-9 rounded-full object-cover border-2 border-amber-500/30" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300 border-2 border-amber-500/30">
                    {(muhtar.name ?? "").slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-white truncate">{muhtar.name}</div>
                <div className="text-xs text-white/40 truncate">
                  {muhtar.neighborhood} Â· {(muhtar.expertise ?? [])[0]}
                </div>
              </div>

              {/* Stats */}
              <div className="text-right flex-shrink-0">
                <div className="font-bold text-sm text-emerald-400">
                  {(muhtar.helpfulCount ?? 0).toLocaleString('tr-TR')}
                </div>
                <div className="text-[10px] text-white/30">faydalÄ±</div>
              </div>
            </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
