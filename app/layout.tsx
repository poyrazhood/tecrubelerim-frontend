import type { Metadata, Viewport } from 'next'
import './globals.css'
import { PWAInstallBanner, IOSInstallGuide } from '@/components/ui/PWAInstallBanner'
import { AuthProvider } from '@/lib/AuthContext'

export const metadata: Metadata = {
  title: 'Tecrübelerim — Güvenilir Mahalle Deneyimleri',
  description: 'AI destekli, güven tabanlı yerel deneyim platformu. Mahalle muhtarları ve doğrulanmış yorumlarla en güvenilir rehberiniz.',
  keywords: ['yorum', 'deneyim', 'güvenilir', 'mahalle', 'istanbul', 'kafe', 'restoran'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Tecrübelerim',
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    siteName: 'Tecrübelerim',
    title: 'Tecrübelerim — Güvenilir Mahalle Deneyimleri',
    description: 'AI destekli güvenilir mahalle deneyim platformu',
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
        {/* iOS PWA meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Tecrübelerim" />
        {/* Splash screens */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-startup-image" href="/icons/icon-512.png" />
        {/* MS Tiles */}
        <meta name="msapplication-TileColor" content="#6366F1" />
        <meta name="msapplication-TileImage" content="/icons/icon-144.png" />
      </head>
      <body>
        <AuthProvider>
          {children}
          <PWAInstallBanner />
          <IOSInstallGuide />
        </AuthProvider>
      </body>
    </html>
  )
}
