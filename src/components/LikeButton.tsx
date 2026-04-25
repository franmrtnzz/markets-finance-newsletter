'use client'

import { useState, useEffect, useCallback } from 'react'

function getFingerprint(): string {
  if (typeof window === 'undefined') return ''
  const key = 'mf_fp'
  let fp = localStorage.getItem(key)
  if (!fp) {
    fp = crypto.randomUUID()
    localStorage.setItem(key, fp)
  }
  return fp
}

export default function LikeButton({
  contentType,
  contentId,
}: {
  contentType: 'newsletter' | 'article' | 'note'
  contentId: string
}) {
  const [count, setCount] = useState(0)
  const [liked, setLiked] = useState(false)
  const [animating, setAnimating] = useState(false)

  const load = useCallback(async () => {
    const fp = getFingerprint()
    const res = await fetch(`/api/likes?type=${contentType}&id=${contentId}&fp=${fp}`)
    if (res.ok) {
      const d = await res.json()
      setCount(d.count)
      setLiked(d.liked)
    }
  }, [contentType, contentId])

  useEffect(() => { load() }, [load])

  const toggle = async () => {
    const fp = getFingerprint()
    // Optimistic update
    setLiked(l => !l)
    setCount(c => liked ? c - 1 : c + 1)
    setAnimating(true)
    setTimeout(() => setAnimating(false), 400)

    const res = await fetch('/api/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content_type: contentType, content_id: contentId, fingerprint: fp }),
    })
    if (res.ok) {
      const d = await res.json()
      setCount(d.count)
      setLiked(d.liked)
    }
  }

  return (
    <button
      onClick={toggle}
      className={`group inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[14px] font-medium transition-all duration-200 border ${
        liked
          ? 'bg-red-50 border-red-200 text-red-600'
          : 'bg-canvas-card border-line-soft text-ink-mute hover:text-red-500 hover:border-red-200 hover:bg-red-50/50'
      }`}
      aria-label={liked ? 'Quitar me gusta' : 'Me gusta'}
    >
      <svg
        className={`w-[18px] h-[18px] transition-transform duration-300 ${animating ? 'scale-125' : 'scale-100'}`}
        viewBox="0 0 24 24"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      <span>{count}</span>
    </button>
  )
}
