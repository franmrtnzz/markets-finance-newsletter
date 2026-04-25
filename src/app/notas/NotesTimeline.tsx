'use client'

import LikeButton from '@/components/LikeButton'
import type { Note } from '@/lib/types'

function formatRelative(d: string) {
  const date = new Date(d)
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60) return 'hace un momento'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`
  if (diff < 86400 * 7) return `hace ${Math.floor(diff / 86400)} d`
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function NotesTimeline({ notes }: { notes: Note[] }) {
  return (
    <ol className="space-y-4">
      {notes.map(n => (
        <li key={n.id} className="card p-6">
          <time className="text-[12px] text-ink-mute">
            {n.published_at ? formatRelative(n.published_at) : ''}
          </time>
          <p className="mt-3 text-[16px] leading-relaxed text-ink whitespace-pre-wrap">
            {n.body}
          </p>
          <div className="mt-4 pt-3 border-t border-line">
            <LikeButton contentType="note" contentId={n.id} />
          </div>
        </li>
      ))}
    </ol>
  )
}
