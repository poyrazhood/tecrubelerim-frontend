'use client'

import { useState, useRef } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import {
  ChevronLeft, ChevronRight, Search, Star, Camera,
  X, Check, MapPin, Sparkles, Shield, Upload,
  ThumbsUp, AlertTriangle, Smile, Meh, Frown,
  Plus
} from 'lucide-react'
import { cn, getTrustColor } from '@/lib/utils'
import { MOCK_BUSINESSES } from '@/lib/mock-data'
import Link from 'next/link'
import type { Business } from '@/types'

const STEPS = ['İşletme Seç', 'Puanla', 'Anlat', 'Kanıtla', 'Yayınla']

const CATEGORY_ASPECTS: Record<string, string[]> = {
  Kafe: ['Kahve Kalitesi', 'Atmosfer', 'Servis Hızı', 'Fiyat/Performans', 'WiFi & Priz'],
  'Oto Servis': ['Fiyat Şeffaflığı', 'İşçilik Kalitesi', 'Dürüstlük', 'Hız', 'Garanti'],
  Eğitim: ['Öğretmen İlgisi', 'Veli İletişimi', 'Müfredat', 'Fiyat/Performans', 'Sonuçlar'],
  Hukuk: ['Ulaşılabilirlik', 'Dosya Takibi', 'Açıklama Netliği', 'Fiyat Şeffaflığı', 'Başarı'],
  Restoran: ['Lezzet', 'Porsiyon', 'Servis', 'Temizlik', 'Fiyat'],
}

const AI_SUGGESTIONS = [
  'Çalışma ortamı olarak çok uygun, WiFi hızlı ve bol priz var.',
  'Servis güleryüzlü, siparişler hızlı geliyor.',
  'Fiyatlar piyasaya göre uygun, porsiyon doyurucu.',
  'Hafta sonu kalabalık oluyor, hafta içi daha sakin.',
]

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 flex-1 justify-center">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-1.5">
          <div className={cn(
            'flex items-center justify-center rounded-full text-[10px] font-black transition-all',
            i < current ? 'w-5 h-5 bg-emerald-500 text-white' :
              i === current ? 'w-6 h-6 bg-indigo-500 text-white ring-2 ring-indigo-500/30' :
                'w-5 h-5 bg-white/[0.08] text-white/30'
          )}>
            {i < current ? <Check size={10} /> : i + 1}
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn('w-5 h-px transition-all', i < current ? 'bg-emerald-500' : 'bg-white/10')} />
          )}
        </div>
      ))}
    </div>
  )
}

// Step 1: Business picker
function Step1BusinessPicker({ onSelect }: { onSelect: (b: Business) => void }) {
  const [query, setQuery] = useState('')
  const filtered = MOCK_BUSINESSES.filter((b) =>
    !query || b.name.toLowerCase().includes(query.toLowerCase()) || b.district.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="px-4 pt-2">
      <h2 className="text-xl font-black text-white mb-1">Hangi işletme?</h2>
      <p className="text-sm text-white/40 mb-5">Deneyiminizi paylaşmak istediğiniz yeri seçin</p>

      <div className="flex items-center gap-3 rounded-2xl border border-white/[0.1] bg-surface-2 px-4 py-3 mb-4 focus-within:border-indigo-500/50 transition-all">
        <Search size={16} className="text-white/30" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="İşletme adı veya mahalle..."
          className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((b) => (
          <button
            key={b.id}
            onClick={() => onSelect(b)}
            className="w-full flex items-center gap-3 p-3 rounded-2xl border border-white/[0.06] bg-surface-1 hover:bg-surface-2 hover:border-indigo-500/30 transition-all text-left group"
          >
            <img src={b.image} alt={b.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-white truncate">{b.name}</div>
              <div className="flex items-center gap-1.5 text-xs text-white/40 mt-0.5">
                <MapPin size={10} />
                <span>{b.district}</span>
                <span className="text-white/20">·</span>
                <span>{b.category}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-sm font-black" style={{ color: getTrustColor(b.trustScore.grade) }}>
                {b.trustScore.grade}
              </span>
              <ChevronRight size={14} className="text-white/20 group-hover:text-indigo-400 transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// Step 2: Rating
function Step2Rating({
  business, rating, setRating, aspects, setAspects
}: {
  business: Business
  rating: number
  setRating: (n: number) => void
  aspects: Record<string, number>
  setAspects: (a: Record<string, number>) => void
}) {
  const [hovered, setHovered] = useState(0)
  const categoryAspects = CATEGORY_ASPECTS[business.category] || ['Genel Deneyim', 'Servis', 'Fiyat', 'Temizlik', 'Tekrar Gelir misiniz?']

  const labels = ['', 'Kötü', 'Fena Değil', 'İyi', 'Çok İyi', 'Mükemmel']
  const display = hovered || rating

  return (
    <div className="px-4 pt-2">
      <div className="flex items-center gap-3 mb-6 p-3 rounded-2xl bg-surface-2 border border-white/[0.06]">
        <img src={business.image} alt={business.name} className="w-12 h-12 rounded-xl object-cover" />
        <div>
          <div className="font-bold text-sm text-white">{business.name}</div>
          <div className="text-xs text-white/40">{business.district} · {business.category}</div>
        </div>
      </div>

      <h2 className="text-xl font-black text-white mb-1">Genel Puan</h2>
      <p className="text-sm text-white/40 mb-6">Bu işletmeyi nasıl değerlendirirsiniz?</p>

      {/* Star rating */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex gap-3 mb-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(i)}
              className="transition-all duration-150"
              style={{ transform: (hovered || rating) >= i ? 'scale(1.2)' : 'scale(1)' }}
            >
              <Star
                size={40}
                className={cn('transition-colors', (hovered || rating) >= i ? 'text-amber-400 fill-amber-400' : 'text-white/15')}
              />
            </button>
          ))}
        </div>
        {display > 0 && (
          <span className="text-lg font-bold text-amber-400 animate-fade-in">{labels[display]}</span>
        )}
      </div>

      {/* Aspect ratings */}
      <div className="mb-4">
        <div className="text-sm font-bold text-white mb-3">Detaylı Değerlendirme</div>
        <div className="space-y-3">
          {categoryAspects.map((aspect) => (
            <div key={aspect} className="flex items-center gap-3">
              <span className="text-xs text-white/60 w-36 flex-shrink-0">{aspect}</span>
              <div className="flex gap-1.5 flex-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    onClick={() => setAspects({ ...aspects, [aspect]: i })}
                    className={cn(
                      'flex-1 h-7 rounded-lg transition-all',
                      (aspects[aspect] || 0) >= i
                        ? 'bg-indigo-500/50 border border-indigo-500/70'
                        : 'bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1]'
                    )}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-indigo-400 w-4 text-right">
                {aspects[aspect] || '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Step 3: Write review
function Step3Write({
  content, setContent, business
}: {
  content: string; setContent: (s: string) => void; business: Business
}) {
  const [sentiment, setSentiment] = useState<'positive' | 'neutral' | 'negative' | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length

  const sentiments = [
    { key: 'positive' as const, Icon: Smile, label: 'Olumlu', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/40' },
    { key: 'neutral' as const, Icon: Meh, label: 'Karışık', color: 'text-amber-400 bg-amber-500/15 border-amber-500/40' },
    { key: 'negative' as const, Icon: Frown, label: 'Olumsuz', color: 'text-red-400 bg-red-500/15 border-red-500/40' },
  ]

  return (
    <div className="px-4 pt-2">
      <h2 className="text-xl font-black text-white mb-1">Deneyiminizi Anlatın</h2>
      <p className="text-sm text-white/40 mb-5">En az 50 kelime yazmanız TrustScore'unuzu artırır</p>

      {/* Sentiment selector */}
      <div className="flex gap-2 mb-4">
        {sentiments.map(({ key, Icon, label, color }) => (
          <button
            key={key}
            onClick={() => setSentiment(key)}
            className={cn(
              'flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition-all',
              sentiment === key ? color : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:bg-white/[0.06]'
            )}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <div className="relative mb-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={7}
          placeholder={`${business.name} hakkındaki deneyiminizi paylaşın...\n\nNasıldı? Tekrar gelir misiniz? Özellikle ne beğendiniz?`}
          className="w-full bg-surface-2 border border-white/[0.1] rounded-2xl p-4 text-sm text-white placeholder-white/20 outline-none resize-none focus:border-indigo-500/50 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.08)] transition-all leading-relaxed"
        />
        <div className={cn(
          'absolute bottom-3 right-3 text-xs font-medium transition-colors',
          wordCount >= 50 ? 'text-emerald-400' : wordCount >= 25 ? 'text-amber-400' : 'text-white/25'
        )}>
          {wordCount} kelime {wordCount >= 50 && '✓'}
        </div>
      </div>

      {/* AI suggestions */}
      <button
        onClick={() => setShowSuggestions(!showSuggestions)}
        className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 mb-3 transition-colors"
      >
        <Sparkles size={13} />
        AI yazma önerileri {showSuggestions ? '↑' : '↓'}
      </button>

      {showSuggestions && (
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.06] p-3 mb-4 space-y-2">
          <div className="text-[10px] font-bold text-indigo-400/70 uppercase tracking-wider mb-2">
            Sıkça bahsedilen konular
          </div>
          {AI_SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setContent(content + (content ? ' ' : '') + s)}
              className="w-full text-left text-xs text-white/60 hover:text-white p-2 rounded-xl hover:bg-white/[0.05] transition-all flex items-start gap-2"
            >
              <Plus size={12} className="text-indigo-400 mt-0.5 flex-shrink-0" />
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', wordCount >= 50 ? 'bg-emerald-500' : wordCount >= 25 ? 'bg-amber-500' : 'bg-indigo-500')}
            style={{ width: `${Math.min((wordCount / 50) * 100, 100)}%` }}
          />
        </div>
        <span className="text-xs text-white/30">{Math.min(Math.round((wordCount / 50) * 100), 100)}%</span>
      </div>
    </div>
  )
}

// Step 4: Photos
function Step4Photos({ photos, setPhotos }: { photos: string[]; setPhotos: (p: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)

  const DEMO_PHOTOS = [
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&h=300&fit=crop',
  ]

  const addDemo = () => {
    const next = DEMO_PHOTOS.find((p) => !photos.includes(p))
    if (next) setPhotos([...photos, next])
  }

  const remove = (p: string) => setPhotos(photos.filter((x) => x !== p))

  return (
    <div className="px-4 pt-2">
      <h2 className="text-xl font-black text-white mb-1">Fotoğraf Ekleyin</h2>
      <p className="text-sm text-white/40 mb-2">Fotoğraflı yorumlar 3x daha fazla faydalı bulunuyor</p>

      {/* Trust boost info */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 mb-5">
        <Shield size={14} className="text-emerald-400 flex-shrink-0" />
        <p className="text-xs text-emerald-400/80">
          Fotoğraf eklemek TrustStack doğrulamanızı tamamlar ve yorumunuzun güvenilirliğini artırır
        </p>
      </div>

      {/* Upload area */}
      <button
        onClick={addDemo}
        className="w-full h-32 rounded-2xl border-2 border-dashed border-white/[0.12] bg-white/[0.02] flex flex-col items-center justify-center gap-2 hover:border-indigo-500/40 hover:bg-indigo-500/[0.04] transition-all mb-4 group"
      >
        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Camera size={18} className="text-indigo-400" />
        </div>
        <span className="text-sm text-white/50 font-medium">Fotoğraf ekle</span>
        <span className="text-xs text-white/25">JPG, PNG · Max 10MB</span>
      </button>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {photos.map((p) => (
            <div key={p} className="relative aspect-square rounded-xl overflow-hidden">
              <img src={p} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => remove(p)}
                className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
              >
                <X size={10} />
              </button>
            </div>
          ))}
          {photos.length < 6 && (
            <button
              onClick={addDemo}
              className="aspect-square rounded-xl border-2 border-dashed border-white/[0.1] flex items-center justify-center text-white/20 hover:border-white/25 hover:text-white/40 transition-all"
            >
              <Plus size={20} />
            </button>
          )}
        </div>
      )}

      {/* Verification info */}
      <div className="rounded-2xl border border-white/[0.07] bg-surface-2 p-4 space-y-3">
        <div className="text-xs font-bold text-white/50 uppercase tracking-wider">Doğrulama Seçenekleri</div>
        {[
          { icon: Camera, label: 'Fotoğraf Kanıtı', sub: 'Mekan veya ürün fotoğrafı', active: photos.length > 0 },
          { icon: Shield, label: 'Ödeme Kaydı', sub: 'İşlem geçmişi ile eşleştir', active: false },
        ].map(({ icon: Icon, label, sub, active }) => (
          <div key={label} className="flex items-center gap-3">
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
              active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.05] text-white/25'
            )}>
              {active ? <Check size={14} /> : <Icon size={14} />}
            </div>
            <div className="flex-1">
              <div className={cn('text-xs font-semibold', active ? 'text-white' : 'text-white/50')}>{label}</div>
              <div className="text-[10px] text-white/30">{sub}</div>
            </div>
            {active && <span className="text-[10px] font-bold text-emerald-400">✓ Tamamlandı</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

// Step 5: Preview & publish
function Step5Publish({
  business, rating, content, photos, onPublish, publishing
}: {
  business: Business
  rating: number
  content: string
  photos: string[]
  onPublish: () => void
  publishing: boolean
}) {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length
  const trustBoost = Math.min(wordCount >= 50 ? 15 : wordCount >= 25 ? 8 : 3) + (photos.length > 0 ? 10 : 0)

  return (
    <div className="px-4 pt-2">
      <h2 className="text-xl font-black text-white mb-1">Yorum Önizleme</h2>
      <p className="text-sm text-white/40 mb-5">Yayınlamadan önce kontrol edin</p>

      {/* Preview card */}
      <div className="rounded-2xl border border-white/[0.08] bg-surface-2 p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-300">
            AY
          </div>
          <div>
            <div className="font-semibold text-sm text-white">Ayşe Yılmaz</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">@ayseyilmaz</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Moda Muhtarı
              </span>
            </div>
          </div>
          <div className="ml-auto flex">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={13} className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-white/15'} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-indigo-400 mb-3 font-medium">
          <MapPin size={11} />
          {business.name}
        </div>

        <p className="text-sm text-white/75 leading-relaxed mb-3 line-clamp-4">
          {content || 'Yorum içeriği...'}
        </p>

        {photos.length > 0 && (
          <div className="flex gap-2">
            {photos.slice(0, 3).map((p) => (
              <img key={p} src={p} alt="" className="w-16 h-16 rounded-lg object-cover" />
            ))}
          </div>
        )}
      </div>

      {/* Trust score impact */}
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.07] p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-indigo-400" />
          <span className="text-sm font-bold text-white">TrustScore Etkisi</span>
        </div>
        <div className="space-y-2">
          {[
            { label: 'Kelime sayısı', ok: wordCount >= 50, note: `${wordCount}/50 kelime` },
            { label: 'Fotoğraf kanıtı', ok: photos.length > 0, note: `${photos.length} fotoğraf` },
            { label: 'Puanlama', ok: rating > 0, note: `${rating}/5 yıldız` },
          ].map(({ label, ok, note }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={cn('w-4 h-4 rounded-full flex items-center justify-center', ok ? 'bg-emerald-500' : 'bg-white/[0.1]')}>
                {ok ? <Check size={9} className="text-white" /> : <div className="w-1.5 h-1.5 rounded-full bg-white/30" />}
              </div>
              <span className={cn('text-xs flex-1', ok ? 'text-white/70' : 'text-white/30')}>{label}</span>
              <span className={cn('text-xs font-medium', ok ? 'text-emerald-400' : 'text-white/25')}>{note}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between">
          <span className="text-xs text-white/50">Tahmini TrustScore katkısı</span>
          <span className="text-sm font-black text-emerald-400">+{trustBoost} puan</span>
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 mb-5">
        <AlertTriangle size={13} className="text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-400/80 leading-relaxed">
          Yorumunuz AI tarafından ironi ve spam kontrolünden geçirilecektir. Gerçek dışı içerikler kaldırılır.
        </p>
      </div>

      <button
        onClick={onPublish}
        disabled={publishing || !content || rating === 0}
        className={cn(
          'w-full py-4 rounded-2xl font-black text-base transition-all',
          publishing || !content || rating === 0
            ? 'bg-white/[0.07] text-white/30 cursor-not-allowed'
            : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/30 hover:opacity-90 active:scale-[0.98]'
        )}
      >
        {publishing ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Yayınlanıyor...
          </span>
        ) : '🚀 Yorumu Yayınla'}
      </button>
    </div>
  )
}

// Success screen
function SuccessScreen({ business }: { business: Business }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30 mb-6">
        <Check size={44} className="text-white" strokeWidth={3} />
      </div>
      <h2 className="text-2xl font-black text-white mb-2">Yorum Yayınlandı!</h2>
      <p className="text-white/50 text-sm mb-2">
        <span className="text-white font-semibold">{business.name}</span> için yorumunuz başarıyla paylaşıldı.
      </p>
      <p className="text-white/30 text-xs mb-8">AI spam kontrolünden geçtikten sonra aktif olacak.</p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href={`/isletme/${business.slug}`}
          className="py-3.5 rounded-2xl bg-white/[0.07] border border-white/[0.1] text-white text-sm font-semibold text-center hover:bg-white/[0.12] transition-all"
        >
          İşletmeye Git →
        </Link>
        <Link
          href="/"
          className="py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold text-center hover:opacity-90 transition-all shadow-lg shadow-indigo-500/25"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  )
}

export default function YorumYazPage() {
  const [step, setStep] = useState(0)
  const [business, setBusiness] = useState<Business | null>(null)
  const [rating, setRating] = useState(0)
  const [aspects, setAspects] = useState<Record<string, number>>({})
  const [content, setContent] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)

  const canNext = () => {
    if (step === 0) return !!business
    if (step === 1) return rating > 0
    if (step === 2) return content.length > 20
    return true
  }

  const handleNext = () => {
    if (step === 0 && !business) return
    setStep((s) => s + 1)
  }

  const handlePublish = () => {
    setPublishing(true)
    setTimeout(() => { setPublishing(false); setPublished(true) }, 2000)
  }

  if (published && business) {
    return (
      <AppLayout hideBottomNav>
        <SuccessScreen business={business} />
      </AppLayout>
    )
  }

  return (
    <AppLayout hideBottomNav>
      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-white/[0.06] px-4 py-3 flex items-center gap-3">
        {step === 0 ? (
          <Link href="/" className="w-9 h-9 rounded-full bg-white/[0.05] flex items-center justify-center border border-white/[0.08] text-white/70">
            <ChevronLeft size={18} />
          </Link>
        ) : (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="w-9 h-9 rounded-full bg-white/[0.05] flex items-center justify-center border border-white/[0.08] text-white/70"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        <StepIndicator current={step} total={STEPS.length} />

        <div className="w-9 text-right">
          <span className="text-xs text-white/30">{step + 1}/{STEPS.length}</span>
        </div>
      </div>

      <div className="pt-4 pb-32">
        {step === 0 && (
          <Step1BusinessPicker onSelect={(b) => { setBusiness(b); setStep(1) }} />
        )}
        {step === 1 && business && (
          <Step2Rating business={business} rating={rating} setRating={setRating} aspects={aspects} setAspects={setAspects} />
        )}
        {step === 2 && business && (
          <Step3Write content={content} setContent={setContent} business={business} />
        )}
        {step === 3 && (
          <Step4Photos photos={photos} setPhotos={setPhotos} />
        )}
        {step === 4 && business && (
          <Step5Publish
            business={business}
            rating={rating}
            content={content}
            photos={photos}
            onPublish={handlePublish}
            publishing={publishing}
          />
        )}
      </div>

      {/* Bottom nav */}
      {step < 4 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] p-4 bg-surface/90 backdrop-blur-xl border-t border-white/[0.06]">
          <div className="flex items-center gap-3">
            {step === 3 && (
              <button
                onClick={() => setStep(4)}
                className="flex-1 py-3.5 rounded-2xl border border-white/[0.1] text-white/50 text-sm font-semibold hover:bg-white/[0.05] transition-all"
              >
                Fotoğrafsız Devam
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canNext()}
              className={cn(
                'flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all',
                canNext()
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:opacity-90'
                  : 'bg-white/[0.07] text-white/25 cursor-not-allowed'
              )}
            >
              {step === STEPS.length - 2 ? 'Önizle' : 'Devam Et'}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
