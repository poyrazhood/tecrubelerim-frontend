'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { SearchBar } from '@/components/search/SearchBar'
import { BusinessCard } from '@/components/business/BusinessCard'
import { MOCK_BUSINESSES } from '@/lib/mock-data'
import { Filter, MapPin, Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORIES = ['Tümü', 'Kafe', 'Restoran', 'Oto Servis', 'Eğitim', 'Hukuk', 'Sağlık']
const DISTRICTS = ['Tüm İlçeler', 'Kadıköy', 'Bostancı', 'Beşiktaş', 'Üsküdar', 'Şişli']
const TRUST_GRADES = ['Tümü', 'A', 'B', 'C']

export default function KesfetPage() {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tümü')
  const [selectedDistrict, setSelectedDistrict] = useState('Tüm İlçeler')
  const [selectedGrade, setSelectedGrade] = useState('Tümü')
  const [showFilters, setShowFilters] = useState(false)
  const [searchDone, setSearchDone] = useState(false)

  const filtered = MOCK_BUSINESSES.filter((b) => {
    const matchCat = selectedCategory === 'Tümü' || b.category === selectedCategory
    const matchDist = selectedDistrict === 'Tüm İlçeler' || b.district === selectedDistrict
    const matchGrade = selectedGrade === 'Tümü' || b.trustScore.grade === selectedGrade
    const matchQuery = !query || b.name.toLowerCase().includes(query.toLowerCase()) ||
      b.category.toLowerCase().includes(query.toLowerCase()) ||
      b.district.toLowerCase().includes(query.toLowerCase())
    return matchCat && matchDist && matchGrade && matchQuery
  })

  const activeFilters = [
    selectedCategory !== 'Tümü' && selectedCategory,
    selectedDistrict !== 'Tüm İlçeler' && selectedDistrict,
    selectedGrade !== 'Tümü' && `TrustScore ${selectedGrade}`,
  ].filter(Boolean) as string[]

  return (
    <AppLayout>
      <div className="px-4 pt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-black text-white">Keşfet</h1>
            <div className="flex items-center gap-1.5 text-xs text-white/40 mt-0.5">
              <MapPin size={11} className="text-indigo-400" />
              <span>Kadıköy, İstanbul</span>
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all',
              showFilters || activeFilters.length > 0
                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                : 'bg-white/[0.04] text-white/50 border-white/[0.08] hover:bg-white/[0.08]'
            )}
          >
            <Filter size={13} />
            Filtrele
            {activeFilters.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] font-black flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <SearchBar onSearch={(q) => { setQuery(q); setSearchDone(true) }} />
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilters.map((f) => (
              <span key={f} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                {f}
                <button onClick={() => {
                  if (f === selectedCategory) setSelectedCategory('Tümü')
                  if (f === selectedDistrict) setSelectedDistrict('Tüm İlçeler')
                  if (f.startsWith('TrustScore')) setSelectedGrade('Tümü')
                }}>
                  <X size={11} />
                </button>
              </span>
            ))}
            <button
              onClick={() => { setSelectedCategory('Tümü'); setSelectedDistrict('Tüm İlçeler'); setSelectedGrade('Tümü') }}
              className="text-xs px-2.5 py-1 rounded-full text-white/30 hover:text-white/60 transition-colors"
            >
              Temizle
            </button>
          </div>
        )}

        {/* Filter panel */}
        {showFilters && (
          <div className="rounded-2xl border border-white/[0.08] bg-surface-2 p-4 mb-4 space-y-4">
            {/* Category */}
            <div>
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">Kategori</div>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={cn(
                      'text-xs px-3 py-1.5 rounded-xl font-medium border transition-all',
                      selectedCategory === c
                        ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                        : 'bg-white/[0.03] text-white/50 border-white/[0.06] hover:bg-white/[0.06]'
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* District */}
            <div>
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">İlçe</div>
              <div className="flex flex-wrap gap-1.5">
                {DISTRICTS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDistrict(d)}
                    className={cn(
                      'text-xs px-3 py-1.5 rounded-xl font-medium border transition-all',
                      selectedDistrict === d
                        ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                        : 'bg-white/[0.03] text-white/50 border-white/[0.06] hover:bg-white/[0.06]'
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Trust grade */}
            <div>
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">Minimum TrustScore</div>
              <div className="flex gap-1.5">
                {TRUST_GRADES.map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGrade(g)}
                    className={cn(
                      'flex-1 text-xs py-2 rounded-xl font-bold border transition-all',
                      selectedGrade === g
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-white/[0.03] text-white/50 border-white/[0.06] hover:bg-white/[0.06]'
                    )}
                  >
                    {g === 'Tümü' ? 'Tümü' : `${g}+`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Category pills (quick filter) */}
        {!showFilters && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 -mx-4 px-4">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={cn(
                  'flex-shrink-0 text-xs px-3.5 py-2 rounded-xl font-semibold border transition-all',
                  selectedCategory === c
                    ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                    : 'bg-white/[0.04] text-white/50 border-white/[0.07] hover:bg-white/[0.08]'
                )}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* AI summary banner (when searched) */}
        {searchDone && query && (
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
            <Sparkles size={15} className="text-indigo-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-indigo-400 mb-1">AI Arama Sonucu</div>
              <p className="text-xs text-white/60 leading-relaxed">
                "<span className="text-white font-medium">{query}</span>" aramanız için {filtered.length} sonuç bulundu.
                Sonuçlar semantik eşleşme skoruna göre sıralandı.
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-white/40">
            {filtered.length} işletme bulundu
          </span>
          <button className="text-xs text-white/40 hover:text-white/70 transition-colors">
            Haritada Gör →
          </button>
        </div>

        {filtered.length > 0 ? (
          filtered.map((b) => (
            <BusinessCard key={b.id} business={b} showSemanticMatch={searchDone} />
          ))
        ) : (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <div className="text-white/50 text-sm mb-1">Sonuç bulunamadı</div>
            <div className="text-white/30 text-xs">Filtrelerinizi değiştirmeyi deneyin</div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
