import type { Metadata, Viewport } from 'next'
import { Cinzel, Inter } from 'next/font/google'
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
      <body className="bg-hextech-black min-h-dvh overflow-x-hidden antialiased">
        {children}
      </body>
    </html>
  )
}
