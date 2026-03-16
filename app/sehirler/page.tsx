'use client'

import Link from 'next/link'
import { MapPin, Search, Building2, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

const CITY_GROUPS = [
  {
    title: 'Marmara',
    color: 'text-blue-400',
    dot: 'bg-blue-400',
    cities: [
      { name: 'İstanbul',  slug: 'istanbul'  },
      { name: 'Bursa',     slug: 'bursa'     },
      { name: 'Kocaeli',   slug: 'kocaeli'   },
      { name: 'Sakarya',   slug: 'sakarya'   },
      { name: 'Tekirdağ',  slug: 'tekirdag'  },
      { name: 'Edirne',    slug: 'edirne'    },
      { name: 'Balıkesir', slug: 'balikesir' },
      { name: 'Çanakkale', slug: 'canakkale' },
      { name: 'Yalova',    slug: 'yalova'    },
      { name: 'Bilecik',   slug: 'bilecik'   },
    ],
  },
  {
    title: 'İç Anadolu',
    color: 'text-purple-400',
    dot: 'bg-purple-400',
    cities: [
      { name: 'Ankara',     slug: 'ankara'     },
      { name: 'Konya',      slug: 'konya'      },
      { name: 'Eskişehir',  slug: 'eskisehir'  },
      { name: 'Kayseri',    slug: 'kayseri'    },
      { name: 'Sivas',      slug: 'sivas'      },
      { name: 'Kırıkkale',  slug: 'kirikkale'  },
      { name: 'Aksaray',    slug: 'aksaray'    },
      { name: 'Nevşehir',   slug: 'nevsehir'   },
      { name: 'Kırşehir',   slug: 'kirsehir'   },
      { name: 'Yozgat',     slug: 'yozgat'     },
    ],
  },
  {
    title: 'Ege',
    color: 'text-cyan-400',
    dot: 'bg-cyan-400',
    cities: [
      { name: 'İzmir',          slug: 'izmir'          },
      { name: 'Manisa',         slug: 'manisa'         },
      { name: 'Aydın',          slug: 'aydin'          },
      { name: 'Muğla',          slug: 'mugla'          },
      { name: 'Denizli',        slug: 'denizli'        },
      { name: 'Uşak',           slug: 'usak'           },
      { name: 'Kütahya',        slug: 'kutahya'        },
      { name: 'Afyonkarahisar', slug: 'afyonkarahisar' },
    ],
  },
  {
    title: 'Akdeniz',
    color: 'text-orange-400',
    dot: 'bg-orange-400',
    cities: [
      { name: 'Antalya',        slug: 'antalya'        },
      { name: 'Adana',          slug: 'adana'          },
      { name: 'Mersin',         slug: 'mersin'         },
      { name: 'Hatay',          slug: 'hatay'          },
      { name: 'Isparta',        slug: 'isparta'        },
      { name: 'Burdur',         slug: 'burdur'         },
      { name: 'Osmaniye',       slug: 'osmaniye'       },
      { name: 'Kahramanmaraş',  slug: 'kahramanmaras'  },
    ],
  },
  {
    title: 'Karadeniz',
    color: 'text-emerald-400',
    dot: 'bg-emerald-400',
    cities: [
      { name: 'Samsun',    slug: 'samsun'    },
      { name: 'Trabzon',   slug: 'trabzon'   },
      { name: 'Ordu',      slug: 'ordu'      },
      { name: 'Giresun',   slug: 'giresun'   },
      { name: 'Rize',      slug: 'rize'      },
      { name: 'Sinop',     slug: 'sinop'     },
      { name: 'Amasya',    slug: 'amasya'    },
      { name: 'Tokat',     slug: 'tokat'     },
      { name: 'Kastamonu', slug: 'kastamonu' },
      { name: 'Zonguldak', slug: 'zonguldak' },
    ],
  },
  {
    title: 'Doğu ve Güneydoğu',
    color: 'text-rose-400',
    dot: 'bg-rose-400',
    cities: [
      { name: 'Gaziantep',  slug: 'gaziantep'  },
      { name: 'Şanlıurfa',  slug: 'sanliurfa'  },
      { name: 'Diyarbakır', slug: 'diyarbakir' },
      { name: 'Mardin',     slug: 'mardin'     },
      { name: 'Van',        slug: 'van'        },
      { name: 'Erzurum',    slug: 'erzurum'    },
      { name: 'Malatya',    slug: 'malatya'    },
      { name: 'Elazığ',     slug: 'elazig'     },
      { name: 'Batman',     slug: 'batman'     },
      { name: 'Siirt',      slug: 'siirt'      },
    ],
  },
]

const ALL_CITIES = CITY_GROUPS.flatMap(g => g.cities)

export default function SehirlerPage() {
  const [query, setQuery] = useState('')
  // slug → count map
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [statsLoaded, setStatsLoaded] = useState(false)

  useEffect(() => {
    fetch(`${API}/businesses/cities-stats`)
      .then(r => r.json())
      .then(d => {
        const map: Record<string, number> = {}
        const rows: { city: string; count: number }[] = d.data || []
        rows.forEach(row => {
          // city name → slug eşleştir
          const found = ALL_CITIES.find(c =>
            c.name.toLowerCase() === row.city?.toLowerCase()
          )
          if (found) map[found.slug] = row.count
        })
        setCounts(map)
        setStatsLoaded(true)
      })
      .catch(() => setStatsLoaded(true))
  }, [])

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return CITY_GROUPS
    return CITY_GROUPS
      .map(g => ({
        ...g,
        cities: g.cities.filter(c =>
          c.name.toLowerCase().includes(q) || c.slug.includes(q)
        ),
      }))
      .filter(g => g.cities.length > 0)
  }, [query])

  function fmt(n: number) {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}B`
    return n.toString()
  }

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto pb-24 pt-5 px-4">

        {/* Başlık */}
        <div className="mb-5">
          <h1 className="text-2xl font-black text-white tracking-tight">Şehirler</h1>
          <p className="text-sm text-white/40 mt-1">
            81 şehirde işletmeleri keşfet, gerçek yorumları incele.
          </p>
        </div>

        {/* Arama */}
        <div className="relative mb-6">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Şehir ara…"
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white outline-none placeholder:text-white/25 focus:border-white/20 transition-colors"
          />
        </div>

        {/* Bölgeler */}
        <div className="space-y-5">
          {filteredGroups.map(group => (
            <div key={group.title}>

              {/* Bölge başlığı */}
              <div className="flex items-center gap-2 mb-2.5">
                <div className={`w-1.5 h-1.5 rounded-full ${group.dot}`} />
                <span className={`text-xs font-bold uppercase tracking-wider ${group.color}`}>
                  {group.title}
                </span>
              </div>

              {/* Şehir listesi */}
              <div className="rounded-2xl border border-white/[0.07] overflow-hidden divide-y divide-white/[0.05]">
                {group.cities.map((city, i) => {
                  const count = counts[city.slug]
                  return (
                    <Link
                      key={city.slug}
                      href={`/${city.slug}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.04] transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <MapPin size={13} className="text-white/20 shrink-0 group-hover:text-white/40 transition-colors" />
                        <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors truncate">
                          {city.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {statsLoaded ? (
                          count ? (
                            <div className="flex items-center gap-1 text-[11px] text-white/35">
                              <Building2 size={10} />
                              <span>{fmt(count)}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-white/20">—</span>
                          )
                        ) : (
                          <div className="w-8 h-2 rounded bg-white/[0.06] animate-pulse" />
                        )}
                        <ChevronRight size={13} className="text-white/15 group-hover:text-white/40 transition-colors" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}

          {filteredGroups.length === 0 && (
            <div className="text-center py-16 text-white/30 text-sm">
              <MapPin size={28} className="mx-auto mb-3 opacity-30" />
              <p>"{query}" için sonuç bulunamadı.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
