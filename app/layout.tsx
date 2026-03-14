import type { Metadata, Viewport } from 'next'
import './globals.css'
import { PWAInstallBanner, IOSInstallGuide } from '@/components/ui/PWAInstallBanner'
import { AuthProvider } from '@/lib/AuthContext'
import { ThemeInit } from '@/components/layout/ThemeInit'

export const metadata: Metadata = {
  title: {
    default: 'Tecrubelerim — Guvenilir Mahalle Deneyimleri',
    template: '%s | Tecrubelerim',
  },
  description: 'AI destekli, guven tabanli yerel deneyim platformu. Mahalle muhtarlari ve dogrulanmis yorumlarla en guvenilir rehberiniz.',
  keywords: ['yorum', 'deneyim', 'guvenilir', 'mahalle', 'istanbul', 'kafe', 'restoran', 'isletme'],
  manifest: '/manifest.json',
  metadataBase: new URL('https://tecrubelerim.com'),
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Tecrubelerim',
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    siteName: 'Tecrubelerim',
    title: 'Tecrubelerim — Guvenilir Mahalle Deneyimleri',
    description: 'AI destekli guvenilir mahalle deneyim platformu',
    url: 'https://tecrubelerim.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tecrubelerim',
    description: 'AI destekli guvenilir mahalle deneyim platformu',
  },
  icons: {
    icon: [
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: dark)',  color: '#0C0C0F' },
    { media: '(prefers-color-scheme: light)', color: '#6366F1' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Tecrubelerim" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-startup-image" href="/icons/icon-512.png" />
        <meta name="msapplication-TileColor" content="#6366F1" />
        <meta name="msapplication-TileImage" content="/icons/icon-144.png" />
      </head>
      <body>
        <ThemeInit />
        <AuthProvider>
          {children}
          <PWAInstallBanner />
          <IOSInstallGuide />
        </AuthProvider>
      </body>
    </html>
  )
}