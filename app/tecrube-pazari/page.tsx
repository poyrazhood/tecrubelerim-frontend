'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { ShoppingBag, Gift, Zap, Star, Package, Loader2, CheckCircle, Lock, Building2, MessageSquare, Camera, X, MapPin, Phone, User, ChevronRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/AuthContext'
import Link from 'next/link'

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '')

const CAT_FILTERS = [
  { key: 'ALL',      label: 'Tümü',      emoji: '✨' },
  { key: 'BADGE',    label: 'Rozetler',  emoji: '🏅' },
  { key: 'COUPON',   label: 'Kuponlar',  emoji: '🎟️' },
  { key: 'FEATURE',  label: 'Özellikler',emoji: '⚡' },
  { key: 'DONATION', label: 'Bağışlar',  emoji: '💚' },
]

const CAT_STYLES: Record<string, { bg: string; text: string; border: string; icon: any }> = {
  BADGE:    { bg: 'bg-indigo-500/15', text: 'text-indigo-400',  border: 'border-indigo-500/25', icon: Star },
  COUPON:   { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/25', icon: Gift },
  FEATURE:  { bg: 'bg-amber-500/15',  text: 'text-amber-400',   border: 'border-amber-500/25', icon: Zap },
  DONATION: { bg: 'bg-pink-500/15',   text: 'text-pink-400',    border: 'border-pink-500/25', icon: Gift },
}

const HOW_TO_EARN = [
  { icon: '💬', label: 'Yorum Yaz',      points: '+20 TP', color: 'text-indigo-400' },
  { icon: '🏢', label: 'İşletme Ekle',   points: '+50 TP', color: 'text-purple-400' },
  { icon: '📸', label: 'Fotoğraf Yükle', points: '+5 TP',  color: 'text-blue-400' },
  { icon: '👍', label: 'Faydalı Oy Al',  points: '+5 TP',  color: 'text-emerald-400' },
]

// Kategori bazlı hangi bilgilerin alınacağı
const DELIVERY_FIELDS: Record<string, { fields: string[]; title: string; desc: string }> = {
  BADGE:    { fields: [],                                     title: 'Rozet Aktivasyonu',    desc: 'Rozet profiline otomatik eklenecek.' },
  FEATURE:  { fields: [],                                     title: 'Özellik Aktivasyonu',  desc: 'Özellik hesabına otomatik aktarılacak.' },
  COUPON:   { fields: ['name', 'email'],                      title: 'Kupon Teslimatı',       desc: 'Kupon kodunu e-posta ile göndereceğiz.' },
  DONATION: { fields: ['name'],                               title: 'Bağış Onayı',           desc: 'Bağışın adına gerçekleştirilecek.' },
}

// Fiziksel teslimat gerektiren kategoriler için adres bilgisi
const PHYSICAL_CATS = ['PHYSICAL', 'GIFT']

interface DeliveryInfo {
  name: string
  email: string
  phone: string
  address: string
  city: string
  note: string
}

interface RedeemModalProps {
  item: any
  userPoints: number
  onClose: () => void
  onConfirm: (info: DeliveryInfo) => void
  loading: boolean
}

function RedeemModal({ item, userPoints, onClose, onConfirm, loading }: RedeemModalProps) {
  const catConfig = DELIVERY_FIELDS[item.category] || DELIVERY_FIELDS.BADGE
  const needsFields = catConfig.fields.length > 0 || PHYSICAL_CATS.includes(item.category)
  const isPhysical = PHYSICAL_CATS.includes(item.category)
  const catStyle = CAT_STYLES[item.category] || CAT_STYLES.BADGE

  const [info, setInfo] = useState<DeliveryInfo>({
    name: '', email: '', phone: '', address: '', city: '', note: ''
  })

  const remainingAfter = userPoints - item.pointCost

  const isValid = () => {
    if (!needsFields) return true
    if (catConfig.fields.includes('name') && !info.name.trim()) return false
    if (catConfig.fields.includes('email') && !info.email.trim()) return false
    if (isPhysical && (!info.name.trim() || !info.phone.trim() || !info.address.trim() || !info.city.trim())) return false
    return true
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0f0f14] shadow-2xl overflow-hidden">
        {/* Üst dekor */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <div className="p-5">
          {/* Başlık */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-white/[0.08]" />
              ) : (
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', catStyle.bg)}>
                  <span className="text-xl">{CAT_FILTERS.find(c => c.key === item.category)?.emoji}</span>
                </div>
              )}
              <div>
                <div className="font-black text-white text-sm">{item.name}</div>
                <div className="text-xs text-white/40 mt-0.5">{catConfig.desc}</div>
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center text-white/40 hover:text-white transition-colors flex-shrink-0">
              <X size={14} />
            </button>
          </div>

          {/* Puan özeti */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-5">
            <div className="flex-1">
              <div className="text-[10px] text-white/30 mb-0.5">Mevcut Puan</div>
              <div className="text-lg font-black text-amber-400">{userPoints} TP</div>
            </div>
            <div className="text-white/20 text-lg">−</div>
            <div className="flex-1 text-center">
              <div className="text-[10px] text-white/30 mb-0.5">Ürün Fiyatı</div>
              <div className="text-lg font-black text-red-400">{item.pointCost} TP</div>
            </div>
            <div className="text-white/20 text-lg">=</div>
            <div className="flex-1 text-right">
              <div className="text-[10px] text-white/30 mb-0.5">Kalan</div>
              <div className={cn('text-lg font-black', remainingAfter >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                {remainingAfter} TP
              </div>
            </div>
          </div>

          {/* Teslimat bilgileri */}
          {needsFields && (
            <div className="space-y-3 mb-5">
              <div className="text-xs font-bold text-white/60 uppercase tracking-wider">{catConfig.title}</div>

              {(catConfig.fields.includes('name') || isPhysical) && (
                <div className="relative">
                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    placeholder="Ad Soyad *"
                    value={info.name}
                    onChange={e => setInfo(p => ({ ...p, name: e.target.value }))}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-white/25 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                </div>
              )}

              {catConfig.fields.includes('email') && (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">@</span>
                  <input
                    type="email"
                    placeholder="E-posta *"
                    value={info.email}
                    onChange={e => setInfo(p => ({ ...p, email: e.target.value }))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-white/25 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                </div>
              )}

              {isPhysical && (
                <>
                  <div className="relative">
                    <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="tel"
                      placeholder="Telefon *"
                      value={info.phone}
                      onChange={e => setInfo(p => ({ ...p, phone: e.target.value }))}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-white/25 focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <MapPin size={13} className="absolute left-3 top-3 text-white/30" />
                    <textarea
                      placeholder="Adres *"
                      value={info.address}
                      onChange={e => setInfo(p => ({ ...p, address: e.target.value }))}
                      rows={2}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-white/25 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Şehir *"
                    value={info.city}
                    onChange={e => setInfo(p => ({ ...p, city: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-white/25 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                </>
              )}

              <div className="relative">
                <input
                  type="text"
                  placeholder="Not (isteğe bağlı)"
                  value={info.note}
                  onChange={e => setInfo(p => ({ ...p, note: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Butonlar */}
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white/40 hover:text-white/70 transition-all">
              İptal
            </button>
            <button
              onClick={() => onConfirm(info)}
              disabled={loading || !isValid()}
              className={cn(
                'flex-2 flex-grow py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2',
                isValid() && !loading
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-400 hover:to-purple-400 shadow-lg shadow-indigo-500/25'
                  : 'bg-white/[0.06] border border-white/[0.06] text-white/25 cursor-not-allowed'
              )}>
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <>
                  <Sparkles size={14} />
                  Satın Al — {item.pointCost} TP
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TecrubePazariPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [redeeming, setRedeeming] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [purchases, setPurchases] = useState<string[]>([])
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [userPoints, setUserPoints] = useState(0)

  useEffect(() => {
    fetch(`${API}/api/market-items`)
      .then(r => r.json())
      .then(d => setItems(Array.isArray(d) ? d : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (token) {
      // Güncel puan bilgisi
      fetch(`${API}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => setUserPoints(d.user?.currentPoints ?? 0))
        .catch(() => {})

      // Satın alma geçmişi
      fetch(`${API}/api/market-items/my-purchases`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => setPurchases((Array.isArray(d) ? d : []).map((p: any) => p.itemId)))
        .catch(() => {})
    }
  }, [])

  // user güncellenince puan al
  useEffect(() => {
    if ((user as any)?.currentPoints !== undefined) {
      setUserPoints((user as any).currentPoints)
    }
  }, [user])

  const handleRedeem = async (info: DeliveryInfo) => {
    if (!selectedItem || !user) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    if (!token) return

    setRedeeming(true)
    setError(null)
    try {
      const r = await fetch(`${API}/api/market-items/${selectedItem.id}/redeem`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryInfo: info })
      })
      const d = await r.json()
      if (r.ok) {
        setSuccess(selectedItem.id)
        setPurchases(prev => [...prev, selectedItem.id])
        setUserPoints(d.remainingPoints ?? userPoints - selectedItem.pointCost)
        setSelectedItem(null)
        setTimeout(() => setSuccess(null), 4000)
      } else {
        setError(d.error || 'Bir hata oluştu')
        setSelectedItem(null)
        setTimeout(() => setError(null), 4000)
      }
    } catch {
      setError('Bağlantı hatası')
      setSelectedItem(null)
    }
    setRedeeming(false)
  }

  const filtered = filter === 'ALL' ? items : items.filter(i => i.category === filter)

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto pb-20">

        {/* Header */}
        <div className="relative rounded-2xl overflow-hidden mb-5 p-5 border border-indigo-500/20 bg-gradient-to-br from-indigo-950/60 to-purple-950/40">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/25 border border-indigo-500/30 flex items-center justify-center">
                <ShoppingBag size={20} className="text-indigo-400" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white">Tecrübe Pazarı</h1>
                <p className="text-xs text-white/40">Puanlarını ödüllere dönüştür</p>
              </div>
            </div>

            {user ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.05] border border-white/[0.08]">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Zap size={15} className="text-amber-400" />
                </div>
                <div>
                  <div className="text-[10px] text-white/30">Kullanılabilir Puan</div>
                  <div className="text-xl font-black text-amber-400 leading-none">{userPoints} <span className="text-xs font-normal text-white/30">TP</span></div>
                </div>
                <Link href="/yorum-yaz" className="ml-auto flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                  Puan Kazan <ChevronRight size={12} />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.05] border border-white/[0.08]">
                <Lock size={14} className="text-white/30" />
                <span className="text-xs text-white/40">Puan kazanmak ve harcamak için</span>
                <Link href="/giris" className="ml-auto text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                  Giriş Yap →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Puan kazanma - kompakt */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {HOW_TO_EARN.map(({ icon, label, points, color }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
              <span className="text-lg">{icon}</span>
              <div className="text-[10px] text-white/40 leading-tight">{label}</div>
              <div className={cn('text-xs font-black', color)}>{points}</div>
            </div>
          ))}
        </div>

        {/* Filtreler */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-none">
          {CAT_FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={cn('px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-1.5',
                filter === f.key
                  ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300'
                  : 'bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white/70'
              )}>
              <span>{f.emoji}</span>{f.label}
            </button>
          ))}
        </div>

        {/* Mesajlar */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/20 text-sm text-red-400 flex items-center gap-2">
            <X size={14} /> {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-sm text-emerald-400 flex items-center gap-2">
            <CheckCircle size={14} /> Satın alma başarılı! Kalan puan: {userPoints} TP
          </div>
        )}

        {/* Ürünler */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="animate-spin text-white/30" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/[0.08] rounded-2xl">
            <Package size={40} className="mx-auto mb-3 text-white/20" />
            <div className="text-white/40 text-sm">Bu kategoride ürün yok</div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item: any) => {
              const catStyle = CAT_STYLES[item.category] || CAT_STYLES.BADGE
              const CatIcon = catStyle.icon
              const alreadyPurchased = purchases.includes(item.id)
              const canAfford = userPoints >= item.pointCost
              const outOfStock = item.stock === 0
              const isSucceeded = success === item.id

              return (
                <div key={item.id}
                  className={cn('rounded-2xl border p-4 transition-all duration-200',
                    isSucceeded ? 'border-emerald-500/30 bg-emerald-950/20' :
                    alreadyPurchased ? 'border-white/[0.06] bg-white/[0.02] opacity-60' :
                    canAfford ? 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12]' :
                    'border-white/[0.05] bg-white/[0.01]'
                  )}>
                  <div className="flex items-center gap-3">
                    {/* Görsel */}
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-white/[0.08]" />
                    ) : (
                      <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl', catStyle.bg)}>
                        {CAT_FILTERS.find(c => c.key === item.category)?.emoji}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-bold text-sm text-white">{item.name}</span>
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium border', catStyle.bg, catStyle.text, catStyle.border)}>
                          {CAT_FILTERS.find(c => c.key === item.category)?.label}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-white/40 mb-1.5 line-clamp-1">{item.description}</p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Zap size={11} className="text-amber-400" />
                          <span className={cn('text-sm font-black', canAfford ? 'text-amber-400' : 'text-white/30')}>
                            {item.pointCost} TP
                          </span>
                        </div>
                        {item.stock !== -1 && (
                          <span className={cn('text-[10px]', item.stock === 0 ? 'text-red-400' : 'text-white/25')}>
                            {item.stock === 0 ? '• Tükendi' : `• ${item.stock} kaldı`}
                          </span>
                        )}
                        {!canAfford && !alreadyPurchased && !outOfStock && (
                          <span className="text-[10px] text-white/25">• {item.pointCost - userPoints} TP eksik</span>
                        )}
                      </div>
                    </div>

                    {/* Buton */}
                    <div className="flex-shrink-0">
                      {alreadyPurchased || isSucceeded ? (
                        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/20">
                          <CheckCircle size={12} className="text-emerald-400" />
                          <span className="text-xs text-emerald-400 font-semibold">Alındı</span>
                        </div>
                      ) : outOfStock ? (
                        <div className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                          <span className="text-xs text-white/25">Tükendi</span>
                        </div>
                      ) : !user ? (
                        <Link href="/giris">
                          <div className="px-3 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
                            <span className="text-xs text-indigo-300 font-medium">Giriş Yap</span>
                          </div>
                        </Link>
                      ) : (
                        <button
                          onClick={() => setSelectedItem(item)}
                          disabled={!canAfford}
                          className={cn('px-3 py-2 rounded-xl text-xs font-bold transition-all',
                            canAfford
                              ? 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30 border border-indigo-500/30 text-indigo-300 hover:from-indigo-500/40 hover:to-purple-500/40'
                              : 'bg-white/[0.03] border border-white/[0.05] text-white/20 cursor-not-allowed'
                          )}>
                          {canAfford ? 'Satın Al' : 'Yetersiz'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Satın Alma Modalı */}
      {selectedItem && (
        <RedeemModal
          item={selectedItem}
          userPoints={userPoints}
          onClose={() => setSelectedItem(null)}
          onConfirm={handleRedeem}
          loading={redeeming}
        />
      )}
    </AppLayout>
  )
}
