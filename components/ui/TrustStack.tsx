'use client'

import { Smartphone, CreditCard, Camera } from 'lucide-react'
import type { TrustStack as TrustStackType } from '@/types'
import { cn } from '@/lib/utils'

interface TrustStackProps {
  stack: TrustStackType
  compact?: boolean
}

const STEPS = [
  { key: 'sms' as const, label: 'SMS', Icon: Smartphone, desc: 'Telefon doğrulaması' },
  { key: 'transaction' as const, label: 'İşlem', Icon: CreditCard, desc: 'Ödeme eşleştirme' },
  { key: 'photo' as const, label: 'Fotoğraf', Icon: Camera, desc: 'Görsel kanıt' },
]

export function TrustStack({ stack, compact = false }: TrustStackProps) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, idx) => {
        const active = stack[step.key]
        return (
          <div key={step.key} className="flex items-center gap-2">
            <div
              className={cn(
                'flex flex-col items-center gap-1 transition-all',
                !active && 'opacity-30'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center rounded-full border-2 transition-all',
                  compact ? 'w-7 h-7' : 'w-9 h-9',
                  active
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400'
                    : 'bg-white/5 border-white/10 text-white/30'
                )}
              >
                <step.Icon size={compact ? 12 : 14} />
              </div>
              {!compact && (
                <span className={cn('text-[10px] font-medium', active ? 'text-emerald-400' : 'text-white/30')}>
                  {step.label}
                </span>
              )}
            </div>

            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  'h-px flex-1 transition-all',
                  compact ? 'w-3' : 'w-6',
                  active && stack[STEPS[idx + 1].key]
                    ? 'bg-emerald-500/50'
                    : 'bg-white/10'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
