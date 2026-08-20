'use client'

import { useEffect, useState } from 'react'

export default function ArticleReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const article = document.querySelector('[data-longform-article]')
      if (!article) return

      const rect = article.getBoundingClientRect()
      const readable = Math.max(article.scrollHeight - window.innerHeight, 1)
      setProgress(Math.min(100, Math.max(0, (-rect.top / readable) * 100)))
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div className="article-progress" aria-hidden="true">
      <span style={{ transform: `scaleX(${progress / 100})` }} />
    </div>
  )
}
