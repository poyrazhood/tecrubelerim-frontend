import { MetadataRoute } from 'next'

const baseUrl = 'https://tecrubelerim.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Tüm botlar için genel kurallar
        userAgent: '*',
        allow: [
          '/',
          '/kesfet',
          '/kategori/',
          '/isletme/',
          '/sehir/',
        ],
        disallow: [
          '/admin',
          '/api/',
          '/profil',
          '/bildirimler',
          '/sahip-paneli',
          '/kullanici/ayarlar',
          '/kullanici/*/duzenle',
          '/yorum-yaz',
          '/_next/',
          '/static/',
          '/*?*sort=',
          '/*?*filter=',
          '/*?*page=',
        ],
      },
      {
        // Googlebot'a özel — tüm indexlenebilir içeriğe izin ver
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin',
          '/api/',
          '/profil',
          '/bildirimler',
          '/sahip-paneli',
          '/kullanici/ayarlar',
          '/kullanici/*/duzenle',
          '/yorum-yaz',
        ],
      },
      {
        // Bing
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/admin',
          '/api/',
          '/profil',
          '/bildirimler',
          '/sahip-paneli',
          '/yorum-yaz',
        ],
      },
      {
        // Agresif ücretli SEO botlarını tamamen engelle
        userAgent: [
          'AhrefsBot',
          'SemrushBot',
          'DotBot',
          'MJ12bot',
          'BLEXBot',
          'PetalBot',
          'serpstatbot',
          'SEOkicks',
        ],
        disallow: '/',
      },
      {
        // AI scraper botlarını engelle
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'CCBot',
          'anthropic-ai',
          'Claude-Web',
          'Omgilibot',
          'FacebookBot',
        ],
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
