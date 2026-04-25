'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { User, Session } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}

interface Comment {
  id: string
  author_name: string | null
  author_avatar: string | null
  body: string
  created_at: string
  user_id: string
}

export default function CommentsSection({
  contentType,
  contentId,
}: {
  contentType: 'newsletter' | 'article' | 'note'
  contentId: string
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingAuth, setLoadingAuth] = useState(true)

  const loadComments = useCallback(async () => {
    const res = await fetch(`/api/comments?type=${contentType}&id=${contentId}`)
    if (res.ok) {
      const d = await res.json()
      setComments(d.comments || [])
    }
  }, [contentType, contentId])

  useEffect(() => {
    loadComments()

    const sb = getSupabaseClient()
    sb.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      setLoadingAuth(false)
    })

    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [loadComments])

  const signIn = async () => {
    const sb = getSupabaseClient()
    await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href },
    })
  }

  const signOut = async () => {
    const sb = getSupabaseClient()
    await sb.auth.signOut()
    setUser(null)
    setSession(null)
  }

  const submit = async () => {
    if (!text.trim() || !session?.access_token) return
    setSending(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_type: contentType,
          content_id: contentId,
          text: text.trim(),
          access_token: session.access_token,
        }),
      })
      if (res.ok) {
        setText('')
        loadComments()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSending(false)
    }
  }

  const formatDate = (d: string) => {
    const date = new Date(d)
    const diff = (Date.now() - date.getTime()) / 1000
    if (diff < 60) return 'ahora'
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`
    if (diff < 604800) return `hace ${Math.floor(diff / 86400)} d`
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="mt-12">
      <h3 className="text-title">Comentarios</h3>

      {/* Lista de comentarios */}
      {comments.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {comments.map(c => (
            <li key={c.id} className="flex gap-3">
              {c.author_avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.author_avatar} alt="" className="w-8 h-8 rounded-full shrink-0 mt-0.5" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-canvas-alt grid place-items-center shrink-0 mt-0.5 text-[12px] font-medium text-ink-mute">
                  {(c.author_name || '?')[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-[14px] font-medium text-ink">{c.author_name || 'Anónimo'}</span>
                  <span className="text-[12px] text-ink-mute">{formatDate(c.created_at)}</span>
                </div>
                <p className="mt-1 text-[14px] text-ink-soft leading-relaxed whitespace-pre-wrap">
                  {c.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-[14px] text-ink-mute">Sé el primero en comentar.</p>
      )}

      {/* Formulario / Login */}
      <div className="mt-8 card p-5">
        {loadingAuth ? (
          <div className="text-[13px] text-ink-mute">Cargando…</div>
        ) : user ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {user.user_metadata?.avatar_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.user_metadata.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                )}
                <span className="text-[13px] text-ink">
                  {user.user_metadata?.full_name || user.email}
                </span>
              </div>
              <button onClick={signOut} className="text-[12px] text-ink-mute hover:text-ink transition-colors">
                Cerrar sesión
              </button>
            </div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Escribe un comentario…"
              className="input-apple text-[14px]"
              rows={3}
              style={{ resize: 'vertical' }}
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={submit}
                disabled={sending || !text.trim()}
                className="btn-primary text-[13px]"
              >
                {sending ? 'Enviando…' : 'Comentar'}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-[14px] text-ink-soft mb-4">
              Inicia sesión con Google para comentar.
            </p>
            <button onClick={signIn} className="btn-ghost text-[13px] inline-flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Iniciar sesión con Google
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
