'use client'

import Link from 'next/link'
import { MapPin, Search, Sparkles, TrendingUp, ArrowUpRight, Flame } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'

const POPULAR_CITIES = [
  { name: 'Istanbul', href: '/istanbul', count: '12.4K mekan', vibe: 'En cok yorumlanan sehir', tone: 'from-pink-500/20 to-transparent' },
  { name: 'Ankara', href: '/ankara', count: '8.1K mekan', vibe: 'Kafe, restoran, kampus rotalari', tone: 'from-indigo-500/20 to-transparent' },
  { name: 'Izmir', href: '/izmir', count: '7.3K mekan', vibe: 'Sahil, lezzet, sosyal hayat', tone: 'from-cyan-500/20 to-transparent' },
  { name: 'Antalya', href: '/antalya', count: '6.2K mekan', vibe: 'Turizm ve deneyim odakli', tone: 'from-amber-500/20 to-transparent' },
  { name: 'Bursa', href: '/bursa', count: '4.9K mekan', vibe: 'Aile ve lezzet rotalari', tone: 'from-emerald-500/20 to-transparent' },
  { name: 'Konya', href: '/konya', count: '3.8K mekan', vibe: 'Yerel deneyimler one cikiyor', tone: 'from-fuchsia-500/20 to-transparent' }
]

const CITY_GROUPS = [
  { title: 'Marmara', cities: ['Istanbul', 'Bursa', 'Kocaeli', 'Sakarya', 'Tekirdag', 'Edirne', 'Balikesir', 'Canakkale'] },
  { title: 'Ic Anadolu', cities: ['Ankara', 'Konya', 'Eskisehir', 'Kayseri', 'Sivas', 'Kirikkale', 'Aksaray', 'Nevsehir'] },
  { title: 'Ege', cities: ['Izmir', 'Manisa', 'Aydin', 'Mugla', 'Denizli', 'Usak', 'Kutahya', 'Afyonkarahisar'] },
  { title: 'Akdeniz', cities: ['Antalya', 'Adana', 'Mersin', 'Hatay', 'Isparta', 'Burdur', 'Osmaniye', 'Kahramanmaras'] },
  { title: 'Karadeniz', cities: ['Samsun', 'Trabzon', 'Ordu', 'Giresun', 'Rize', 'Sinop', 'Amasya', 'Tokat'] },
  { title: 'Dogu ve Guneydogu', cities: ['Gaziantep', 'Sanliurfa', 'Diyarbakir', 'Mardin', 'Van', 'Erzurum', 'Malatya', 'Elazig'] }
]

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/\s+/g, '-')
}

export default function SehirlerPage() {
  const [query, setQuery] = useState('')

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return CITY_GROUPS

    return CITY_GROUPS
      .map(group => ({
        ...group,
        cities: group.cities.filter(city => city.toLowerCase().includes(q))
      }))
      .filter(group => group.cities.length > 0)
  }, [query])

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto pb-24 pt-5 px-4">
        <section className="relative overflow-hidden rounded-[30px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.025))] p-5 shadow-[0_10px_50px_rgba(0,0,0,0.24)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_26%),linear-gradient(180deg,transparent,rgba(255,255,255,0.02))]" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.05] px-3 py-1.5 text-[11px] font-semibold text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <Sparkles size={12} />
              Sehir sec, deneyimi daralt
            </div>

            <div className="mt-4 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h1 className="text-[34px] leading-none font-black tracking-tight text-white">
                  Sehirler
                </h1>
                <p className="mt-3 max-w-md text-[15px] leading-7 text-white/55">
                  Sehir bazli kesfet, bolgesel tercihleri filtrele ve gercek kullanici deneyimlerine daha hizli ulas.
                </p>
              </div>

              <div className="flex w-[138px] shrink-0 flex-col gap-2">
                <div className="rounded-2xl border border-white/[0.08] bg-black/20 px-3 py-3 backdrop-blur-sm">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/30">Kapsam</div>
                  <div className="mt-1 text-xl font-black text-white">81+</div>
                </div>
                <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.07] px-3 py-3 backdrop-blur-sm">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/30">Trend</div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <TrendingUp size={14} />
                    Populer
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-5">
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Sehir ara..."
                className="h-12 w-full rounded-2xl border border-white/[0.08] bg-black/25 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-white/22 focus:border-pink-500/35 focus:bg-white/[0.04]"
              />
            </div>
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame size={14} className="text-pink-400" />
              <h2 className="text-sm font-black text-white">Populer sehirler</h2>
            </div>
            <span className="text-[11px] text-white/35">Hizli gecis</span>
          </div>

          <div className="grid gap-3">
            {POPULAR_CITIES.map((city) => (
              <Link
                key={city.name}
                href={city.href}
                className="group relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-white/[0.03] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-white/[0.045]"
              >
                <div className={'absolute inset-0 bg-gradient-to-br ' + city.tone + ' opacity-70'} />
                <div className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-[radial-gradient(circle_at_right_top,rgba(255,255,255,0.08),transparent_25%)]" />

                <div className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-black/25 text-pink-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                        <MapPin size={18} />
                      </div>

                      <div className="min-w-0">
                        <div className="text-[22px] leading-none font-black tracking-tight text-white">
                          {city.name}
                        </div>
                        <div className="mt-2 text-[12px] font-semibold text-white/42">
                          {city.count}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold text-white/55 shrink-0">
                      Sehir sayfasi
                      <ArrowUpRight size={11} />
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-6 text-white/58">
                    {city.vibe}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-black text-white">Bolgelere gore sehirler</h2>
            <span className="text-[11px] text-white/35">
              {query ? 'Filtrelenmis sonuc' : 'Tum liste'}
            </span>
          </div>

          <div className="space-y-4">
            {filteredGroups.map((group) => (
              <div
                key={group.title}
                className="rounded-[28px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.02))] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.18)]"
              >
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-pink-400 shadow-[0_0_18px_rgba(236,72,153,0.9)]" />
                  <h3 className="text-[15px] font-black text-white">{group.title}</h3>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {group.cities.map((city) => (
                    <Link
                      key={city}
                      href={`/${slugify(city)}`}
                      className="rounded-2xl border border-white/[0.06] bg-black/20 px-3 py-3 text-sm font-semibold text-white/75 transition-all hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-white"
                    >
                      {city}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filteredGroups.length === 0 && (
            <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-8 text-center">
              <div className="text-base font-bold text-white">Sonuc bulunamadi</div>
              <div className="mt-2 text-sm text-white/45">
                Farkli bir sehir adi deneyebilirsin.
              </div>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  )
}
