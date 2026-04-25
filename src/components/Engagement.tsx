'use client'

import LikeButton from './LikeButton'
import CommentsSection from './CommentsSection'

export default function Engagement({
  contentType,
  contentId,
}: {
  contentType: 'newsletter' | 'article' | 'note'
  contentId: string
}) {
  return (
    <div className="mt-14 pt-10 border-t border-line-soft">
      <LikeButton contentType={contentType} contentId={contentId} />
      <CommentsSection contentType={contentType} contentId={contentId} />
    </div>
  )
}
