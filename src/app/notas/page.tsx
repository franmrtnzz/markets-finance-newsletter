import { listPublishedNotes } from '@/lib/content'
import NotesTimeline from './NotesTimeline'

export const metadata = {
  title: 'Notas — Markets & Finance',
  description: 'Pensamientos breves y publicaciones cortas.',
}

export const revalidate = 3600

export default async function NotesPage() {
  const items = await listPublishedNotes()

  return (
    <div className="container-narrow pt-24 pb-32">
      <header className="text-center mb-16">
        <p className="eyebrow">Pensamientos</p>
        <h1 className="mt-4 text-display">Notas</h1>
        <p className="mt-4 text-[17px] text-ink-soft max-w-xl mx-auto">
          Ideas sueltas, comentarios y publicaciones cortas.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-canvas-alt grid place-items-center mx-auto">
            <svg className="w-6 h-6 text-ink-mute" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h6m-6 8l-4-4h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2v4z" />
            </svg>
          </div>
          <h2 className="mt-6 text-title">Aún no hay notas</h2>
          <p className="mt-2 text-[15px] text-ink-soft">Pronto empezaré a publicar aquí.</p>
        </div>
      ) : (
        <NotesTimeline notes={items} />
      )}
    </div>
  )
}

