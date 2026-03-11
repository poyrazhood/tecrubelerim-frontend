'use client'

import { useState, useEffect } from 'react'
import { usePWA } from '@/hooks/usePWA'
import { X, Download, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PWAInstallBanner() {
  const { installPrompt, isInstalled, isInstalling, install } = usePWA()
  const [dismissed, setDismissed] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Check if previously dismissed
    const wasDismissed = localStorage.getItem('pwa-banner-dismissed')
    if (wasDismissed) setDismissed(true)

    // Delay show for better UX (don't immediately interrupt)
    if (installPrompt && !wasDismissed) {
      const t = setTimeout(() => setVisible(true), 3000)
      return () => clearTimeout(t)
    }
  }, [installPrompt])

  const handleDismiss = () => {
    setVisible(false)
    setDismissed(true)
    localStorage.setItem('pwa-banner-dismissed', '1')
  }

  const handleInstall = async () => {
    const success = await install()
    if (success) setVisible(false)
  }

  if (!installPrompt || isInstalled || dismissed || !visible) return null

  return (
    <div className={cn(
      'fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-[440px] px-4',
      'animate-slide-up'
    )}>
      <div className="rounded-2xl border border-indigo-500/30 bg-surface-2 shadow-2xl shadow-black/50 overflow-hidden">
        {/* Top accent line */}
        <div className="h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500" />

        <div className="p-4 flex items-center gap-3">
          {/* App icon */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
            <span className="text-xl font-black text-white">T</span>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-white">Uygulamayı Yükle</div>
            <div className="text-xs text-white/50 mt-0.5">
              Ana ekrana ekle, daha hızlı aç
            </div>
          </div>

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/10 transition-all flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>

        {/* Features */}
        <div className="px-4 pb-3 flex gap-3">
          {[
            { icon: '⚡', label: 'Anında aç' },
            { icon: '📴', label: 'Çevrimdışı' },
            { icon: '🔔', label: 'Bildirimler' },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-1.5 text-[11px] text-white/40">
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>

        {/* Install button */}
        <div className="px-4 pb-4">
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="w-full py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-sm hover:bg-indigo-400 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isInstalling ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Yükleniyor...
              </>
            ) : (
              <>
                <Download size={14} />
                Ana Ekrana Ekle
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// iOS Safari install guide (since iOS doesn't support beforeinstallprompt)
export function IOSInstallGuide() {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
    const wasDismissed = localStorage.getItem('ios-guide-dismissed')

    if (isIOS && !isInStandaloneMode && !wasDismissed) {
      const t = setTimeout(() => setShow(true), 4000)
      return () => clearTimeout(t)
    }
  }, [])

  if (!show || dismissed) return null

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-[440px] px-4 animate-slide-up">
      <div className="rounded-2xl border border-white/[0.12] bg-surface-2 shadow-2xl p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Smartphone size={16} className="text-indigo-400" />
            <span className="font-bold text-sm text-white">Ana Ekrana Ekle</span>
          </div>
          <button
            onClick={() => { setDismissed(true); localStorage.setItem('ios-guide-dismissed', '1') }}
            className="text-white/30 hover:text-white/60 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="space-y-2.5">
          {[
            { step: '1', text: 'Alt menüdeki Paylaş butonuna tap', icon: '⬆️' },
            { step: '2', text: '"Ana Ekrana Ekle" seçeneğine tap', icon: '➕' },
            { step: '3', text: '"Ekle" butonuna tap', icon: '✓' },
          ].map(s => (
            <div key={s.step} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0">
                {s.step}
              </div>
              <span className="text-xs text-white/60">{s.icon} {s.text}</span>
            </div>
          ))}
        </div>

        {/* Arrow pointing down to Safari share */}
        <div className="mt-3 text-center">
          <div className="text-xs text-white/30">Safari'de aşağıdaki ↓ ikonuna tap</div>
        </div>
      </div>
    </div>
  )
}
