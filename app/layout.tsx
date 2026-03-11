import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tecrübelerim — Güvenilir Mahalle Deneyimleri',
  description: 'AI destekli, güven tabanlı yerel deneyim platformu. Mahalle muhtarları ve doğrulanmış yorumlarla en güvenilir rehberiniz.',
  keywords: ['yorum', 'deneyim', 'güvenilir', 'mahalle', 'istanbul', 'kafe', 'restoran'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}
