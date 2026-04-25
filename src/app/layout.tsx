import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Markets & Finance — Newsletter, artículos y notas',
  description: 'Newsletter informal sobre mercados, finanzas y economía. Más artículos, lecturas y notas que voy publicando.',
  metadataBase: new URL(process.env.BASE_URL ?? 'https://marketsfinancenewsletter.com'),
  openGraph: {
    title: 'Markets & Finance',
    description: 'Newsletter, artículos y notas sobre mercados y finanzas.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen flex flex-col antialiased">
        <SiteNav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
