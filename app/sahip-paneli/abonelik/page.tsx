'use client'
import React, { useState, useEffect } from 'react'
import { CheckCircle, Crown, Zap, Star, ArrowLeft, Loader2, Phone, MessageCircle, ChevronRight, Sparkles, Shield, BarChart2, Image, Bell } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '')

// ─── Plan Definitions ────────────────────────────────────────────────────────
const PLANS = [
  {
    key: 'FREE',
    label: 'Ücretsiz',
    price: '0',
    period: '',
    color: 'text-white/60',
    border: 'border-white/[0.08]',
    bg: 'bg-white/[0.02]',
    activeBg: 'bg-white/[0.05]',
    badge: null,
    icon: Star,
    features: [
      'İşletme profili',
      '5 fotoğrafa kadar',
      'Temel istatistikler',
      'Müşteri yorumlarını görüntüle',
    ],
    missing: [
      'Öne çıkarma',
      'Detaylı analitik',
      'Fotoğraf galerisi (sınırsız)',
      'Öncelikli destek',
    ],
  },
  {
    key: 'PROFESSIONAL',
    label: 'Profesyonel',
    price: '99',
    period: '/ay',
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/[0.04]',
    activeBg: 'bg-blue-500/10',
    badge: 'Popüler',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: Zap,
    features: [
      'Ücretsiz plan + tümü',
      '30 fotoğrafa kadar',
      'Detaylı analitik paneli',
      'Yorumlara öncelikli yanıt',
      'İşletme öne çıkarma (ayda 3x)',
      'E-posta destek',
    ],
    missing: [
      'Sınırsız fotoğraf',
      'API erişimi',
    ],
  },
  {
    key: 'PREMIUM',
    label: 'Premium',
    price: '299',
    period: '/ay',
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/[0.04]',
    activeBg: 'bg-amber-500/10',
    badge: 'En İyi Değer',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: Crown,
    features: [
      'Profesyonel plan + tümü',
      'Sınırsız fotoğraf galerisi',
      'Öne çıkarma (sınırsız)',
      'Doğrulanmış rozet',
      'Öncelikli destek (7/24)',
      'Özel kampanya bannerı',
    ],
    missing: [],
  },
  {
    key: 'ENTERPRISE',
    label: 'Kurumsal',
    price: '999',
    period: '/ay',
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/[0.04]',
    activeBg: 'bg-purple-500/10',
    badge: 'Kurumsal',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    icon: Shield,
    features: [
      'Premium plan + tümü',
      'Çoklu şube yönetimi',
      'API erişimi & webhook',
      'Özel entegrasyon desteği',
      'Hesap yöneticisi',
      'SLA garantisi',
    ],
    missing: [],
  },
]

// ─── Feature Comparison Table ─────────────────────────────────────────────────
const FEATURES_TABLE = [
  { label: 'Fotoğraf Limiti', values: ['5', '30', 'Sınırsız', 'Sınırsız'] },
  { label: 'Analitik', values: ['Temel', 'Detaylı', 'Gelişmiş', 'Tam API'] },
  { label: 'Öne Çıkarma', values: ['—', '3/ay', 'Sınırsız', 'Sınırsız'] },
  { label: 'Destek', values: ['—', 'E-posta', '7/24', 'Hesap Yöneticisi'] },
  { label: 'Doğrulama Rozeti', values: ['—', '—', '✓', '✓'] },
  { label: 'Çoklu Şube', values: ['—', '—', '—', '✓'] },
]

export default function AbonelikPage() {
  const router = useRouter()
  const [currentPlan, setCurrentPlan] = useState<string>('FREE')
  const [businessId, setBusinessId] = useState<string>('')
  const [businessName, setBusinessName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [showRequestForm, setShowRequestForm] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) { router.push('/giris'); return }
    // Load current business subscription
    fetch(`${API}/api/subscriptions/my`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        setCurrentPlan(d.plan || 'FREE')
        setBusinessId(d.businessId || '')
        setBusinessName(d.businessName || '')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSelectPlan = (planKey: string) => {
    if (planKey === currentPlan) return
    setSelectedPlan(planKey)
    setShowRequestForm(true)
  }

  const handleSubmitRequest = async () => {
    if (!selectedPlan || !phone) return
    setSubmitting(true)
    const token = localStorage.getItem('auth_token')
    try {
      await fetch(`${API}/api/subscriptions/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          planWanted: selectedPlan,
          phone,
          note,
          businessId,
          businessName,
        })
      })
      setSubmitted(true)
      setShowRequestForm(false)
    } catch (e) {
      console.error(e)
    }
    setSubmitting(false)
  }

  const currentPlanIdx = PLANS.findIndex(p => p.key === currentPlan)
  const selectedPlanData = PLANS.find(p => p.key === selectedPlan)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090f] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-white/30" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090f] text-white">
      {/* Header */}
      <div className="border-b border-white/[0.07] px-4 py-4 flex items-center gap-3 sticky top-0 bg-[#09090f]/90 backdrop-blur-sm z-10">
        <Link href="/sahip-paneli" className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-black text-base">Abonelik Planları</h1>
          {businessName && <p className="text-xs text-white/40">{businessName}</p>}
        </div>
        <div className="ml-auto">
          {currentPlan !== 'FREE' && (
            <div className={`text-xs font-bold px-3 py-1.5 rounded-full border ${PLANS.find(p => p.key === currentPlan)?.badgeColor || 'bg-white/[0.05] border-white/10 text-white/40'}`}>
              Mevcut: {PLANS.find(p => p.key === currentPlan)?.label}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Success State */}
        {submitted && (
          <div className="mb-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle size={20} className="text-emerald-400" />
            </div>
            <div>
              <div className="font-bold text-emerald-400 mb-1">Talebiniz Alındı!</div>
              <p className="text-sm text-white/60">
                <strong className="text-white">{selectedPlanData?.label}</strong> planına geçiş talebiniz iletildi.
                Ekibimiz en kısa sürede <strong className="text-white">{phone}</strong> numarasından sizinle iletişime geçecek.
              </p>
            </div>
          </div>
        )}

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-4">
            <Sparkles size={12} />
            İşletmenizi Büyütün
          </div>
          <h2 className="text-3xl font-black mb-3">
            Doğru planı seçin,<br />
            <span className="text-indigo-400">işletmenizi öne çıkarın</span>
          </h2>
          <p className="text-white/50 text-sm max-w-md mx-auto">
            Her plan, işletmenizin ihtiyaçlarına göre tasarlandı. İstediğiniz zaman yükseltebilirsiniz.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {PLANS.map((plan, idx) => {
            const Icon = plan.icon
            const isCurrent = plan.key === currentPlan
            const isUpgrade = idx > currentPlanIdx
            const isDowngrade = idx < currentPlanIdx

            return (
              <div
                key={plan.key}
                className={`relative rounded-2xl border p-5 flex flex-col transition-all ${
                  isCurrent
                    ? `${plan.activeBg} ${plan.border} ring-2 ring-offset-2 ring-offset-[#09090f] ${plan.border.replace('border-', 'ring-')}`
                    : `${plan.bg} ${plan.border} hover:opacity-90`
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-black px-2.5 py-0.5 rounded-full border ${plan.badgeColor}`}>
                    {plan.badge}
                  </div>
                )}

                {/* Icon + Label */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${plan.activeBg || 'bg-white/[0.05]'}`}>
                    <Icon size={15} className={plan.color} />
                  </div>
                  <span className={`font-bold text-sm ${plan.color}`}>{plan.label}</span>
                  {isCurrent && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-white/50 ml-auto">Mevcut</span>}
                </div>

                {/* Price */}
                <div className="mb-4">
                  <span className={`text-3xl font-black ${plan.color}`}>
                    {plan.price === '0' ? 'Ücretsiz' : `₺${plan.price}`}
                  </span>
                  {plan.period && <span className="text-white/30 text-sm">{plan.period}</span>}
                </div>

                {/* Features */}
                <ul className="space-y-1.5 mb-5 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-white/70">
                      <CheckCircle size={11} className={`mt-0.5 flex-shrink-0 ${plan.color}`} />
                      {f}
                    </li>
                  ))}
                  {plan.missing.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-white/25 line-through">
                      <span className="mt-0.5 flex-shrink-0 w-[11px] h-[11px]" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                  <div className="w-full py-2.5 rounded-xl text-center text-xs font-bold border border-white/10 text-white/40 cursor-default">
                    Mevcut Plan
                  </div>
                ) : isUpgrade ? (
                  <button
                    onClick={() => handleSelectPlan(plan.key)}
                    className={`w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      plan.key === 'PREMIUM'
                        ? 'bg-amber-500 hover:bg-amber-400 text-white'
                        : plan.key === 'ENTERPRISE'
                        ? 'bg-purple-600 hover:bg-purple-500 text-white'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    Yükselt <ChevronRight size={12} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(plan.key)}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-white/[0.05] text-white/40 hover:bg-white/[0.08] hover:text-white/60 transition-all"
                  >
                    Düşür
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden mb-10">
          <div className="px-5 py-4 border-b border-white/[0.07]">
            <h3 className="font-bold text-sm">Plan Karşılaştırması</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  <th className="px-5 py-3 text-left text-white/40 font-medium">Özellik</th>
                  {PLANS.map(p => (
                    <th key={p.key} className={`px-4 py-3 text-center font-bold ${p.key === currentPlan ? p.color : 'text-white/50'}`}>
                      {p.label}
                      {p.key === currentPlan && <span className="block text-[9px] font-normal text-white/30">mevcut</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURES_TABLE.map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? 'bg-white/[0.01]' : ''}>
                    <td className="px-5 py-2.5 text-white/60">{row.label}</td>
                    {row.values.map((val, j) => (
                      <td key={j} className={`px-4 py-2.5 text-center font-medium ${val === '—' ? 'text-white/20' : PLANS[j].key === currentPlan ? PLANS[j].color : 'text-white/70'}`}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="rounded-2xl bg-indigo-500/[0.06] border border-indigo-500/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold text-sm mb-1">Özel fiyatlandırma mı arıyorsunuz?</div>
            <p className="text-xs text-white/50">Birden fazla şubeniz varsa veya özel ihtiyaçlarınız için bize ulaşın.</p>
          </div>
          <a
            href="mailto:destek@tecrubelerim.com"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-400 transition-all flex-shrink-0"
          >
            <MessageCircle size={14} /> Bizimle İletişime Geçin
          </a>
        </div>
      </div>

      {/* Upgrade Request Modal */}
      {showRequestForm && selectedPlanData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#13131f] border border-white/[0.1] rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-10 h-10 rounded-xl ${selectedPlanData.activeBg} flex items-center justify-center`}>
                <selectedPlanData.icon size={18} className={selectedPlanData.color} />
              </div>
              <div>
                <div className="font-black text-white">{selectedPlanData.label} Planı</div>
                <div className="text-xs text-white/40">
                  {selectedPlanData.price === '0' ? 'Ücretsiz' : `₺${selectedPlanData.price}${selectedPlanData.period}`}
                </div>
              </div>
            </div>

            <p className="text-sm text-white/60 mb-5">
              Ekibimiz sizinle iletişime geçecek ve planınızı aktive edecek. Telefon numaranızı bırakın.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Telefon Numarası *</label>
                <div className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2.5">
                  <Phone size={14} className="text-white/30 flex-shrink-0" />
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="0532 123 45 67"
                    className="bg-transparent text-sm text-white outline-none flex-1 placeholder-white/20"
                    type="tel"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Not (opsiyonel)</label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Eklemek istediğiniz bir not..."
                  rows={2}
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2.5 text-sm text-white outline-none placeholder-white/20 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={handleSubmitRequest}
                disabled={submitting || !phone}
                className={`flex-1 py-3 rounded-xl text-sm font-black transition-all disabled:opacity-40 ${
                  selectedPlanData.key === 'PREMIUM' ? 'bg-amber-500 hover:bg-amber-400 text-white' :
                  selectedPlanData.key === 'ENTERPRISE' ? 'bg-purple-600 hover:bg-purple-500 text-white' :
                  'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {submitting ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Talep Gönder'}
              </button>
              <button
                onClick={() => { setShowRequestForm(false); setSelectedPlan('') }}
                className="px-4 py-3 rounded-xl bg-white/[0.06] text-white/50 text-sm hover:bg-white/[0.1] transition-all"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
