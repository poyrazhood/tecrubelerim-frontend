'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#0C0C0F] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
        <span className="text-2xl font-black text-white">T</span>
      </div>
      <h1 className="text-xl font-black text-white mb-2">Baglanti Yok</h1>
      <p className="text-sm text-white/40 mb-6 max-w-xs">
        Internetiniz yok gibi gorunuyor. Baglantinizi kontrol edip tekrar deneyin.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 transition-all"
      >
        Tekrar Dene
      </button>
    </div>
  )
}