'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronRight, ChevronLeft, Check, MapPin, Sparkles,
  Shield, Award, Star, Coffee, Wrench, BookOpen,
  Utensils, Heart, Scale, Stethoscope, ShoppingBag,
  Wifi, Users, Zap, Bell, ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────
type Step = 0 | 1 | 2 | 3 | 4 | 5

interface OnboardingState {
  neighborhood: string
  city: string
  interests: string[]
  role: 'user' | 'muhtar' | null
  notifications: boolean
}

// ─── Data ────────────────────────────────────────────────
const ISTANBUL_DISTRICTS = [
  'Kadıköy', 'Beşiktaş', 'Şişli', 'Üsküdar', 'Fatih',
  'Beyoğlu', 'Ataşehir', 'Maltepe', 'Bağcılar', 'Pendik',
  'Ümraniye', 'Bakırköy', 'Kartal', 'Eyüpsultan', 'Sarıyer',
]

const NEIGHBORHOODS: Record<string, string[]> = {
  'Kadıköy': ['Moda', 'Fenerbahçe', 'Bağlarbaşı', 'Caferağa', 'Caddebostan', 'Fikirtepe', 'Hasanpaşa', 'Koşuyolu', 'Moda', 'Osmanağa'],
  'Beşiktaş': ['Abbasağa', 'Arnavutköy', 'Bebek', 'Balmumcu', 'Etiler', 'Gayrettepe', 'Levazım', 'Ortaköy', 'Sinanpaşa', 'Ulus'],
  'Şişli': ['Bozkurt', 'Cumhuriyet', 'Esentepe', 'Fulya', 'Gülbahar', 'Halaskargazi', 'Mecidiyeköy', 'Merkez', 'Nişantaşı', 'Teşvikiye'],
  'Üsküdar': ['Altunizade', 'Bağlarbaşı', 'Beylerbeyi', 'Çengelköy', 'Kuzguncuk', 'Mimar Sinan', 'Selimiye', 'Ünalan'],
}

const INTEREST_CATEGORIES = [
  { id: 'kafe',     label: 'Kafe',       icon: Coffee,      color: 'from-amber-500/20 to-amber-600/5  border-amber-500/20' },
  { id: 'restoran', label: 'Restoran',   icon: Utensils,    color: 'from-red-500/20    to-red-600/5    border-red-500/20' },
  { id: 'oto',      label: 'Oto Servis', icon: Wrench,      color: 'from-blue-500/20   to-blue-600/5   border-blue-500/20' },
  { id: 'egitim',   label: 'Eğitim',     icon: BookOpen,    color: 'from-purple-500/20 to-purple-600/5 border-purple-500/20' },
  { id: 'saglik',   label: 'Sağlık',     icon: Stethoscope, color: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20' },
  { id: 'hukuk',    label: 'Hukuk',      icon: Scale,       color: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/20' },
  { id: 'alisveris',label: 'Alışveriş',  icon: ShoppingBag, color: 'from-pink-500/20   to-pink-600/5   border-pink-500/20' },
  { id: 'gonul',    label: 'Gönül Alma', icon: Heart,       color: 'from-rose-500/20   to-rose-600/5   border-rose-500/20' },
]

// ─── Step components ──────────────────────────────────────

function StepWelcome({ onNext }: { onNext: () => void }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  const features = [
    { icon: Shield,   color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'AI kalkan sistemi',      desc: 'Sahte yorumlar otomatik tespit edilir' },
    { icon: Award,    color: 'text-amber-400',   bg: 'bg-amber-500/10',   label: 'Mahalle Muhtarları',     desc: 'Gerçek insanların güvenilir önerileri' },
    { icon: Sparkles, color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  label: 'Semantik AI arama',      desc: 'Anlam bazlı, doğal dil araması' },
    { icon: Star,     color: 'text-sky-400',     bg: 'bg-sky-500/10',     label: 'TrustScore sistemi',     desc: 'Şeffaf güven skoru hesaplama' },
  ]

  return (
    <div className={cn('flex flex-col items-center text-center px-6 py-8 transition-all duration-700', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
      {/* Logo animation */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40 mb-2">
          <span className="text-4xl font-black text-white">T</span>
        </div>
        {/* Orbiting dots */}
        <div className="absolute inset-0 rounded-full animate-spin" style={{ animationDuration: '8s' }}>
          <div className="absolute -top-1 left-1/2 w-3 h-3 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50" />
        </div>
        <div className="absolute inset-0 rounded-full animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }}>
          <div className="absolute top-1/2 -right-1 w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
        </div>
      </div>

      <h1 className="text-3xl font-black text-white mb-2 leading-tight">
        Tecrübelerim'e<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
          Hoş Geldiniz
        </span>
      </h1>
      <p className="text-white/50 text-sm leading-relaxed mb-10 max-w-xs">
        Türkiye'nin en güvenilir yerel deneyim platformu. Gerçek insanlar, gerçek yorumlar.
      </p>

      {/* Feature cards */}
      <div className="w-full grid grid-cols-2 gap-2.5 mb-10">
        {features.map((f, i) => (
          <div
            key={f.label}
            className={cn(
              'flex flex-col gap-2 p-3 rounded-2xl border border-white/[0.07] text-left transition-all',
              f.bg
            )}
            style={{ transitionDelay: `${i * 100 + 300}ms` }}
          >
            <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', f.bg)}>
              <f.icon size={15} className={f.color} />
            </div>
            <div>
              <div className="text-xs font-bold text-white">{f.label}</div>
              <div className="text-[10px] text-white/40 mt-0.5 leading-snug">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-base shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        Başlayalım
        <ArrowRight size={18} />
      </button>

      <button className="mt-3 text-xs text-white/30 hover:text-white/50 transition-colors">
        Zaten hesabım var → <span className="text-indigo-400">Giriş Yap</span>
      </button>
    </div>
  )
}

function StepLocation({
  state,
  setState,
  onNext,
  onBack,
}: {
  state: OnboardingState
  setState: (s: Partial<OnboardingState>) => void
  onNext: () => void
  onBack: () => void
}) {
  const [citySearch, setCitySearch] = useState('')
  const [nbSearch, setNbSearch] = useState('')
  const neighborhoods = NEIGHBORHOODS[state.city] || []

  const filteredDistricts = ISTANBUL_DISTRICTS.filter(d =>
    d.toLowerCase().includes(citySearch.toLowerCase())
  )
  const filteredNb = neighborhoods.filter(n =>
    n.toLowerCase().includes(nbSearch.toLowerCase())
  )

  return (
    <div className="px-5 py-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
          <MapPin size={18} className="text-indigo-400" />
        </div>
        <div>
          <h2 className="font-black text-lg text-white">Konumunuz</h2>
          <p className="text-xs text-white/40">Çevrenizden haberdar olun</p>
        </div>
      </div>

      {/* City / district */}
      <div className="mb-5">
        <label className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 block">İlçe</label>
        <input
          type="text"
          placeholder="İlçe ara..."
          value={citySearch}
          onChange={e => setCitySearch(e.target.value)}
          className="w-full bg-surface-2 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 mb-2"
        />
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
          {filteredDistricts.map(d => (
            <button
              key={d}
              onClick={() => { setState({ city: d, neighborhood: '' }); setNbSearch('') }}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border font-medium transition-all',
                state.city === d
                  ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                  : 'border-white/[0.08] text-white/50 hover:text-white/80 hover:border-white/20'
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Neighborhood */}
      {state.city && neighborhoods.length > 0 && (
        <div className="mb-6">
          <label className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 block">Mahalle</label>
          <input
            type="text"
            placeholder="Mahalle ara..."
            value={nbSearch}
            onChange={e => setNbSearch(e.target.value)}
            className="w-full bg-surface-2 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 mb-2"
          />
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {filteredNb.map(n => (
              <button
                key={n}
                onClick={() => setState({ neighborhood: n })}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-full border font-medium transition-all',
                  state.neighborhood === n
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'border-white/[0.08] text-white/50 hover:text-white/80 hover:border-white/20'
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected summary */}
      {state.city && (
        <div className="flex items-center gap-2 mb-5 p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
          <MapPin size={13} className="text-emerald-400 flex-shrink-0" />
          <span className="text-sm text-white/70">
            {state.neighborhood ? `${state.neighborhood}, ${state.city}` : state.city}
          </span>
          <Check size={13} className="text-emerald-400 ml-auto flex-shrink-0" />
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={onBack} className="w-12 h-12 rounded-xl border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 hover:border-white/20 transition-all flex-shrink-0">
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={onNext}
          disabled={!state.city}
          className="flex-1 py-3.5 rounded-xl bg-indigo-500 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-400 transition-all flex items-center justify-center gap-2"
        >
          Devam Et
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

function StepInterests({
  state,
  setState,
  onNext,
  onBack,
}: {
  state: OnboardingState
  setState: (s: Partial<OnboardingState>) => void
  onNext: () => void
  onBack: () => void
}) {
  const toggle = (id: string) => {
    const cur = state.interests
    setState({
      interests: cur.includes(id) ? cur.filter(i => i !== id) : [...cur, id]
    })
  }

  return (
    <div className="px-5 py-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
          <Star size={18} className="text-amber-400" />
        </div>
        <div>
          <h2 className="font-black text-lg text-white">İlgi Alanları</h2>
          <p className="text-xs text-white/40">En az 2 kategori seçin</p>
        </div>
      </div>
      <p className="text-xs text-white/30 mb-5 leading-relaxed">
        Seçimlerinize göre feed'inizi ve AI önerilerinizi kişiselleştireceğiz.
      </p>

      <div className="grid grid-cols-2 gap-2.5 mb-6">
        {INTEREST_CATEGORIES.map(cat => {
          const selected = state.interests.includes(cat.id)
          return (
            <button
              key={cat.id}
              onClick={() => toggle(cat.id)}
              className={cn(
                'relative flex items-center gap-3 p-3.5 rounded-2xl border bg-gradient-to-br text-left transition-all',
                selected
                  ? cat.color + ' scale-[1.02] shadow-lg'
                  : 'border-white/[0.07] from-transparent to-transparent hover:border-white/15'
              )}
            >
              <div className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                selected ? 'bg-white/15' : 'bg-white/[0.05]'
              )}>
                <cat.icon size={16} className={selected ? 'text-white' : 'text-white/40'} />
              </div>
              <span className={cn('text-sm font-semibold', selected ? 'text-white' : 'text-white/50')}>
                {cat.label}
              </span>
              {selected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <Check size={11} className="text-white" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {state.interests.length > 0 && (
        <div className="text-xs text-white/40 text-center mb-4">
          {state.interests.length} kategori seçildi
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={onBack} className="w-12 h-12 rounded-xl border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 hover:border-white/20 transition-all flex-shrink-0">
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={onNext}
          disabled={state.interests.length < 2}
          className="flex-1 py-3.5 rounded-xl bg-indigo-500 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-400 transition-all flex items-center justify-center gap-2"
        >
          Devam Et
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

function StepRole({
  state,
  setState,
  onNext,
  onBack,
}: {
  state: OnboardingState
  setState: (s: Partial<OnboardingState>) => void
  onNext: () => void
  onBack: () => void
}) {
  const roles = [
    {
      id: 'user' as const,
      title: 'Normal Kullanıcı',
      emoji: '👤',
      desc: 'Yorum yap, deneyim paylaş, işletmeleri keşfet.',
      perks: ['Sınırsız yorum', 'AI arama', 'Feed kişiselleştirme'],
      gradient: 'from-indigo-500/15 to-purple-500/5 border-indigo-500/30',
    },
    {
      id: 'muhtar' as const,
      title: 'Mahalle Muhtarı',
      emoji: '🏆',
      desc: 'Mahallenin güvenilir sesi ol, öne çık, topluluk oluştur.',
      perks: ['Muhtar rozeti', 'Öne çıkan yorumlar', 'Liderlik tablosu'],
      gradient: 'from-amber-500/15 to-yellow-500/5 border-amber-500/30',
      badge: 'Başvuru Gerekli',
    },
  ]

  return (
    <div className="px-5 py-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
          <Users size={18} className="text-purple-400" />
        </div>
        <div>
          <h2 className="font-black text-lg text-white">Rolünüz</h2>
          <p className="text-xs text-white/40">Nasıl katılmak istiyorsunuz?</p>
        </div>
      </div>
      <p className="text-xs text-white/30 mb-5 leading-relaxed">
        İstediğiniz zaman değiştirebilirsiniz.
      </p>

      <div className="space-y-3 mb-6">
        {roles.map(role => (
          <button
            key={role.id}
            onClick={() => setState({ role: role.id })}
            className={cn(
              'w-full text-left p-4 rounded-2xl border bg-gradient-to-br transition-all',
              state.role === role.id
                ? role.gradient + ' scale-[1.01]'
                : 'border-white/[0.07] from-transparent to-transparent hover:border-white/15'
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{role.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-white">{role.title}</span>
                  {role.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {role.badge}
                    </span>
                  )}
                  {state.role === role.id && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                      <Check size={11} className="text-white" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-white/50 mb-2 leading-relaxed">{role.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {role.perks.map(p => (
                    <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/40 border border-white/[0.08]">
                      ✓ {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={onBack} className="w-12 h-12 rounded-xl border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 hover:border-white/20 transition-all flex-shrink-0">
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={onNext}
          disabled={!state.role}
          className="flex-1 py-3.5 rounded-xl bg-indigo-500 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-400 transition-all flex items-center justify-center gap-2"
        >
          Devam Et
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

function StepNotifications({
  state,
  setState,
  onNext,
  onBack,
}: {
  state: OnboardingState
  setState: (s: Partial<OnboardingState>) => void
  onNext: () => void
  onBack: () => void
}) {
  const notifTypes = [
    { icon: Star,     label: 'Faydalı oy bildirimleri',  desc: 'Yorumlarınız faydalı bulunduğunda' },
    { icon: Award,    label: 'Muhtar sıralaması',         desc: 'Sıralama değiştiğinde haberdar ol' },
    { icon: Shield,   label: 'Güvenlik uyarıları',        desc: 'Şüpheli aktivite tespit edildiğinde' },
    { icon: Sparkles, label: 'AI önerileri',              desc: 'Kişiselleştirilmiş keşif önerileri' },
  ]

  return (
    <div className="px-5 py-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
          <Bell size={18} className="text-sky-400" />
        </div>
        <div>
          <h2 className="font-black text-lg text-white">Bildirimler</h2>
          <p className="text-xs text-white/40">Hiçbir şeyi kaçırmayın</p>
        </div>
      </div>

      {/* Main toggle */}
      <div
        onClick={() => setState({ notifications: !state.notifications })}
        className={cn(
          'flex items-center justify-between p-4 rounded-2xl border mb-4 cursor-pointer transition-all',
          state.notifications
            ? 'bg-indigo-500/10 border-indigo-500/30'
            : 'bg-surface-2 border-white/[0.08] hover:border-white/15'
        )}
      >
        <div>
          <div className="font-bold text-sm text-white">Bildirimleri Etkinleştir</div>
          <div className="text-xs text-white/40 mt-0.5">Önemli güncellemelerden haberdar olun</div>
        </div>
        <div className={cn(
          'w-12 h-6 rounded-full transition-all relative flex-shrink-0',
          state.notifications ? 'bg-indigo-500' : 'bg-white/10'
        )}>
          <div className={cn(
            'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all',
            state.notifications ? 'right-0.5' : 'left-0.5'
          )} />
        </div>
      </div>

      {/* Notification types */}
      {state.notifications && (
        <div className="space-y-2 mb-6">
          {notifTypes.map(n => (
            <div key={n.label} className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 border border-white/[0.06]">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                <n.icon size={14} className="text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white">{n.label}</div>
                <div className="text-[10px] text-white/40">{n.desc}</div>
              </div>
              <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                <Check size={9} className="text-white" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!state.notifications && <div className="mb-6" />}

      <div className="flex gap-2">
        <button onClick={onBack} className="w-12 h-12 rounded-xl border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 hover:border-white/20 transition-all flex-shrink-0">
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3.5 rounded-xl bg-indigo-500 text-white font-bold text-sm hover:bg-indigo-400 transition-all flex items-center justify-center gap-2"
        >
          Devam Et
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

function StepComplete({ state, onFinish }: { state: OnboardingState; onFinish: () => void }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 200) }, [])

  return (
    <div className={cn('flex flex-col items-center text-center px-6 py-10 transition-all duration-700', visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95')}>
      {/* Success animation */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
          <Check size={40} className="text-white" strokeWidth={3} />
        </div>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-emerald-400"
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${i * 60}deg) translateX(52px) translateY(-50%)`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      <h2 className="text-3xl font-black text-white mb-2">Hazırsınız! 🎉</h2>
      <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-xs">
        Profiliniz oluşturuldu. Artık çevrenizin en güvenilir deneyimlerini keşfedebilirsiniz.
      </p>

      {/* Summary card */}
      <div className="w-full rounded-2xl border border-white/[0.07] bg-surface-2 p-4 mb-8 text-left space-y-3">
        <div className="flex items-center gap-3">
          <MapPin size={14} className="text-indigo-400 flex-shrink-0" />
          <span className="text-sm text-white/70">
            {state.neighborhood ? `${state.neighborhood}, ${state.city}` : state.city || 'Konum belirtilmedi'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Star size={14} className="text-amber-400 flex-shrink-0" />
          <span className="text-sm text-white/70">
            {state.interests.length} ilgi alanı seçildi
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Award size={14} className="text-purple-400 flex-shrink-0" />
          <span className="text-sm text-white/70">
            {state.role === 'muhtar' ? 'Muhtar başvurusu gönderildi' : 'Normal kullanıcı'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Bell size={14} className="text-sky-400 flex-shrink-0" />
          <span className="text-sm text-white/70">
            {state.notifications ? 'Bildirimler aktif' : 'Bildirimler kapalı'}
          </span>
        </div>
      </div>

      <button
        onClick={onFinish}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-base shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        Ana Sayfaya Git
        <ArrowRight size={18} />
      </button>
    </div>
  )
}

// ─── Progress bar ─────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  if (step === 0) return null
  return (
    <div className="px-5 pt-4 pb-2">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-white/30 font-medium">{step}/{total}</span>
        <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${(step / total) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(0)
  const [state, setStateRaw] = useState<OnboardingState>({
    neighborhood: '',
    city: '',
    interests: [],
    role: null,
    notifications: true,
  })

  const setState = (partial: Partial<OnboardingState>) =>
    setStateRaw(prev => ({ ...prev, ...partial }))

  const next = () => setStep(s => Math.min(s + 1, 5) as Step)
  const back = () => setStep(s => Math.max(s - 1, 0) as Step)

  const finish = () => router.push('/')

  const TOTAL_STEPS = 4

  return (
    <div className="min-h-screen bg-surface flex justify-center">
      <div className="w-full max-w-[480px] min-h-screen flex flex-col">
        {/* Skip button (except last step) */}
        {step > 0 && step < 5 && (
          <div className="flex justify-end px-5 pt-4">
            <button
              onClick={finish}
              className="text-xs text-white/30 hover:text-white/50 transition-colors"
            >
              Atla
            </button>
          </div>
        )}

        <ProgressBar step={step > 0 ? step : 0} total={TOTAL_STEPS} />

        <div className="flex-1">
          {step === 0 && <StepWelcome onNext={next} />}
          {step === 1 && <StepLocation state={state} setState={setState} onNext={next} onBack={back} />}
          {step === 2 && <StepInterests state={state} setState={setState} onNext={next} onBack={back} />}
          {step === 3 && <StepRole state={state} setState={setState} onNext={next} onBack={back} />}
          {step === 4 && <StepNotifications state={state} setState={setState} onNext={next} onBack={back} />}
          {step === 5 && <StepComplete state={state} onFinish={finish} />}
        </div>
      </div>
    </div>
  )
}
