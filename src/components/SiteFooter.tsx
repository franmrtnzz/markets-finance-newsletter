'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function SiteFooter() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null

  return (
    <footer className="mt-24 border-t border-line-soft bg-canvas-alt">
      <div className="container-apple py-12 text-[13px] text-ink-mute">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <p className="text-ink font-medium">Markets &amp; Finance</p>
            <p className="mt-1 max-w-md">
              Newsletter informal sobre mercados, finanzas y economía. Sin ruido. Cuando me apetece.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <Link href="/newsletters" className="hover:text-ink transition-colors">Newsletters</Link>
            <Link href="/articulos" className="hover:text-ink transition-colors">Artículos</Link>
            <Link href="/notas" className="hover:text-ink transition-colors">Notas</Link>
            <Link href="/#suscribirse" className="hover:text-ink transition-colors">Suscribirse</Link>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-line-soft flex flex-col sm:flex-row justify-between gap-2">
          <p>© {new Date().getFullYear()} Markets &amp; Finance.</p>
          <p>Hecho con cariño y café ☕</p>
        </div>
      </div>
    </footer>
  )
}
