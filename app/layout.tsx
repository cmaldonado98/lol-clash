import type { Metadata, Viewport } from 'next'
import { Cinzel, Inter } from 'next/font/google'
import { SFX_PRELOAD_URLS } from '@/lib/constants/assets'
import './globals.css'

/* ── Beaufort-equivalent: Cinzel (serif, all-caps capable) ── */
const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-beaufort',
  weight: ['400', '600', '700', '900'],
  display: 'swap',
})

/* ── Spiegel-equivalent: Inter (clean sans-serif) ─────────── */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-spiegel',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Copa Mexicali · Clash Tournament',
  description:
    'Has sido reclutado para la Copa Mexicali. Un torneo Clash de League of Legends – 10 de Octubre, 2026.',
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: 'Copa Mexicali · Clash Tournament',
    description: 'Tu invitación al torneo te espera, Invocador.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#010A13',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cinzel.variable} ${inter.variable}`}>
      {/*
       * Preload SFX as audio resources.
       * as="audio" matches how Howler (html5: true) loads files via <audio>,
       * so the browser pre-fills the resource cache before JS even runs.
       * No crossOrigin needed — <audio> elements allow cross-origin src by default.
       */}
      <head>
        {SFX_PRELOAD_URLS.map((href) => (
          <link key={href} rel="preload" as="audio" href={href} />
        ))}
      </head>
      <body className="bg-hextech-black min-h-dvh overflow-x-hidden antialiased">
        {children}
      </body>
    </html>
  )
}
