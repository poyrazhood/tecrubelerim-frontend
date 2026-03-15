
const SITE_URL = 'https://tecrubelerim.com'

export async function GET() {
  const pages = [
    { url: SITE_URL,                        freq: 'daily',   priority: 1.0 },
    { url: SITE_URL + '/kesfet',            freq: 'daily',   priority: 0.9 },
    { url: SITE_URL + '/arama',             freq: 'weekly',  priority: 0.8 },
    { url: SITE_URL + '/muhtarlar',         freq: 'weekly',  priority: 0.7 },
    { url: SITE_URL + '/hakkimizda',        freq: 'monthly', priority: 0.5 },
    { url: SITE_URL + '/gizlilik',          freq: 'monthly', priority: 0.3 },
    { url: SITE_URL + '/kullanim-sartlari', freq: 'monthly', priority: 0.3 },
  ]
  const today = new Date().toISOString().split('T')[0]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=86400' }
  })
}
