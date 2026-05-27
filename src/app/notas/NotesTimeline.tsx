'use client'

import Image from 'next/image'
import LikeButton from '@/components/LikeButton'
import type { Note } from '@/lib/types'

function formatRelative(d: string) {
  const date = new Date(d)
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60) return 'hace un momento'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`
  if (diff < 86400 * 7) return `hace ${Math.floor(diff / 86400)} d`
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export default function NotesTimeline({ notes }: { notes: Note[] }) {
  return (
    <ol className="space-y-4">
      {notes.map(n => (
        <li key={n.id} className="card p-5 sm:p-6">
          <div className="flex gap-3">
            {/* Avatar */}
            <div className="shrink-0">
              <Image
                src="/images/fran.jpg"
                alt="Fran"
                width={44}
                height={44}
                className="rounded-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] font-semibold text-ink">Fran</span>
                <span className="text-[14px] text-ink-mute">@marketsfinance</span>
                <span className="text-ink-mute mx-0.5">·</span>
                <time className="text-[13px] text-ink-mute">
                  {n.published_at ? formatRelative(n.published_at) : ''}
                </time>
              </div>

              {/* Body */}
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink whitespace-pre-wrap">
                {n.body}
              </p>

              {/* Actions */}
              <div className="mt-3">
                <LikeButton contentType="note" contentId={n.id} />
              </div>
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}
