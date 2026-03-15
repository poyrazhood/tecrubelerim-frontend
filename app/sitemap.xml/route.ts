import { NextResponse } from 'next/server'
const SITE_URL = 'https://tecrubelerim.com'

export async function GET() {
  let total = 432361
  try {
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api') + '/businesses/count', { next: { revalidate: 86400 } })
    if (res.ok) { const d = await res.json(); total = d.total ?? total }
  } catch {}
  const batchCount = Math.ceil(total / 50000)
  const now = new Date().toISOString()
  const sitemaps = [
    'sitemap/static.xml','sitemap/cities.xml','sitemap/categories.xml',
    'sitemap/districts.xml','sitemap/kategori-cities.xml',
    ...Array.from({ length: batchCount }, (_, i) => 'sitemap/businesses-' + (i+1) + '.xml')
  ]
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    sitemaps.map(s => '  <sitemap>\n    <loc>' + SITE_URL + '/' + s + '</loc>\n    <lastmod>' + now + '</lastmod>\n  </sitemap>').join('\n') +
    '\n</sitemapindex>'
  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' }
  })
}
