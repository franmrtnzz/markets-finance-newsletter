'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/newsletters', label: 'Newsletters' },
  { href: '/articulos', label: 'Artículos' },
  { href: '/notas', label: 'Notas' },
  { href: '/sobre-mi', label: 'Sobre mí' },
]

export default function SiteNav() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // No mostrar la nav pública dentro del admin
  if (pathname?.startsWith('/admin')) return null

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-canvas/80 backdrop-blur-apple border-b border-line-soft'
          : 'bg-transparent'
      }`}
    >
      <div className="container-apple flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-7 h-7 rounded-lg bg-ink text-white grid place-items-center text-[11px] font-semibold tracking-tight">
            M&amp;F
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-ink group-hover:opacity-70 transition-opacity">
            Markets &amp; Finance
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => {
            const active = l.href === '/' ? pathname === '/' : pathname?.startsWith(l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-4 py-2 text-[13px] rounded-full transition-colors ${
                  active
                    ? 'text-ink bg-canvas-alt'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/#suscribirse"
            className="hidden sm:inline-flex items-center rounded-full bg-ink text-white px-4 py-2 text-[13px] font-medium hover:bg-ink-soft transition-colors"
          >
            Suscribirse
          </Link>
          <button
            onClick={() => setOpen(o => !o)}
            className="md:hidden w-9 h-9 grid place-items-center rounded-full hover:bg-canvas-alt transition-colors"
            aria-label="Menú"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {open
                ? <path strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
                : <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-line-soft bg-canvas/95 backdrop-blur-apple">
          <nav className="container-apple py-3 flex flex-col">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3 text-[15px] text-ink-soft hover:text-ink transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
