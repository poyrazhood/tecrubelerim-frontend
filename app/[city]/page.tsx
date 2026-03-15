import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CityPageClient from './city-client'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
const SITE_URL = 'https://tecrubelerim.com'

const CITY_NAMES: Record<string, string> = {
  'istanbul': 'İstanbul', 'ankara': 'Ankara', 'izmir': 'İzmir',
  'bursa': 'Bursa', 'antalya': 'Antalya', 'adana': 'Adana',
  'konya': 'Konya', 'gaziantep': 'Gaziantep', 'mersin': 'Mersin',
  'kayseri': 'Kayseri', 'eskisehir': 'Eskişehir', 'diyarbakir': 'Diyarbakır',
  'samsun': 'Samsun', 'denizli': 'Denizli', 'trabzon': 'Trabzon',
  'malatya': 'Malatya', 'erzurum': 'Erzurum', 'sakarya': 'Sakarya',
  'kahramanmaras': 'Kahramanmaraş', 'van': 'Van', 'aydin': 'Aydın',
  'tekirdag': 'Tekirdağ', 'muğla': 'Muğla', 'manisa': 'Manisa',
  'balikesir': 'Balıkesir', 'canakkale': 'Çanakkale', 'sanliurfa': 'Şanlıurfa',
  'agri': 'Ağrı', 'adiyaman': 'Adıyaman', 'afyonkarahisar': 'Afyonkarahisar',
  'aksaray': 'Aksaray', 'amasya': 'Amasya', 'ardahan': 'Ardahan',
  'artvin': 'Artvin', 'bartin': 'Bartın', 'batman': 'Batman',
  'bayburt': 'Bayburt', 'bilecik': 'Bilecik', 'bingol': 'Bingöl',
  'bitlis': 'Bitlis', 'bolu': 'Bolu', 'burdur': 'Burdur',
  'duzce': 'Düzce', 'edirne': 'Edirne', 'elazig': 'Elazığ',
  'erzincan': 'Erzincan', 'giresun': 'Giresun', 'gumushane': 'Gümüşhane',
  'hakkari': 'Hakkari', 'hatay': 'Hatay', 'isparta': 'Isparta',
  'igdir': 'Iğdır', 'karabuk': 'Karabük', 'karaman': 'Karaman',
  'kars': 'Kars', 'kastamonu': 'Kastamonu', 'kilis': 'Kilis',
  'kocaeli': 'Kocaeli', 'kutahya': 'Kütahya', 'kirklareli': 'Kırklareli',
  'kirikkale': 'Kırıkkale', 'kirsehir': 'Kırşehir', 'mardin': 'Mardin',
  'mus': 'Muş', 'nevsehir': 'Nevşehir', 'nigde': 'Niğde',
  'ordu': 'Ordu', 'osmaniye': 'Osmaniye', 'rize': 'Rize',
  'siirt': 'Siirt', 'sinop': 'Sinop', 'sivas': 'Sivas',
  'tokat': 'Tokat', 'tunceli': 'Tunceli', 'usak': 'Uşak',
  'yalova': 'Yalova', 'yozgat': 'Yozgat', 'zonguldak': 'Zonguldak',
  'cankiri': 'Çankırı', 'corum': 'Çorum', 'mugla': 'Muğla',
  'sirnak': 'Şırnak'
}

export async function generateStaticParams() {
  return ["istanbul","ankara","izmir","bursa","antalya","adana","konya","gaziantep","mersin","kayseri","eskisehir","diyarbakir","samsun","denizli","trabzon","malatya","erzurum","sakarya","kahramanmaras","van"].map(city => ({ city }))
}

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const cityName = CITY_NAMES[params.city]
  if (!cityName) return { title: 'Tecrübelerim' }
  
  const title = `${cityName} İşletmeleri – Yorumlar ve Değerlendirmeler | Tecrübelerim`
  const description = `${cityName} şehrindeki en güvenilir işletmeler, restoranlar, kafeler ve daha fazlası. Gerçek kullanıcı yorumları ve TrustScore değerlendirmeleri.`
  const url = `${SITE_URL}/${params.city}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title, description, url,
      type: 'website',
      siteName: 'Tecrübelerim',
      locale: 'tr_TR',
    },
  }
}

export default function CityPage({ params }: { params: { city: string } }) {
  const cityName = CITY_NAMES[params.city]
  if (!cityName) notFound()
  return <CityPageClient city={params.city} cityName={cityName} />
}
