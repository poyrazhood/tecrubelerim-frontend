'use client'

import Link from 'next/link'
import { WifiOff, RefreshCw, Home } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="text-center max-w-xs">
        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-6">
          <WifiOff size={32} className="text-white/30" />
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-[10px] font-black text-white">T</span>
          </div>
          <span className="font-black text-base text-white">Tecrübelerim</span>
        </div>

        <h1 className="text-xl font-black text-white mb-2">
          Çevrimdışısınız
        </h1>
        <p className="text-sm text-white/50 leading-relaxed mb-8">
          İnternet bağlantınız yok. Önbelleğe alınan sayfaları görüntüleyebilir veya bağlantı kurulduğunda devam edebilirsiniz.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-indigo-500 text-white font-bold text-sm hover:bg-indigo-400 transition-all"
          >
            <RefreshCw size={15} />
            Yeniden Dene
          </button>
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-white/[0.08] text-white/60 font-semibold text-sm hover:bg-white/5 hover:text-white transition-all"
          >
            <Home size={15} />
            Ana Sayfaya Git
          </Link>
        </div>

        <p className="text-xs text-white/25 mt-6">
          Önbelleğe alınan yorumlar ve işletmeler çevrimdışıyken de görüntülenebilir
        </p>
      </div>
    </div>
  )
}
