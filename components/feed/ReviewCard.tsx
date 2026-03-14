'use client'

import { ThumbsUp, Heart, MessageCircle, Share2, AlertTriangle, Shield, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { cn, formatCount } from '@/lib/utils'
import type { Review } from '@/types'
import Link from 'next/link'

interface ReviewCardProps {
  review: Review
}

function Avatar({ name, image, size = 48 }: { name: string; image?: string; size?: number }) {
  const colors = ['#818CF8', '#34D399', '#FBBF24', '#F472B6', '#60A5FA', '#A78BFA']
  const color = colors[(name || 'U').charCodeAt(0) % colors.length]
  const initials = (name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
    )
  }

  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white"
      style={{ width: size, height: size, background: color, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  )
}

function ShieldBadge({ status, reason }: { status: Review['shieldStatus']; reason?: string }) {
  if (status === 'safe') return null
  const isWarning = status === 'warning'
  const Icon = isWarning ? ShieldAlert : Shield

  return (
    <div className={cn(
      'flex items-center gap-2 rounded-xl px-3 py-2 mb-3 text-xs font-medium',
      isWarning
        ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30'
        : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30'
    )}>
      <Icon size={13} />
      <span>{isWarning ? 'ÅÃ¼pheli Yorum' : 'Ä°nceleniyor'}</span>
      {reason && <span className="text-gray-400 dark:text-white/40 ml-1">â€” {reason}</span>}
    </div>
  )
}

export function ReviewCard({ review }: ReviewCardProps) {
  const [liked, setLiked] = useState(false)
  const [thanked, setThanked] = useState(false)
  const [likeAnim, setLikeAnim] = useState(false)
  const [thankAnim, setThankAnim] = useState(false)

  const handleLike = () => {
    setLiked(!liked)
    setLikeAnim(true)
    setTimeout(() => setLikeAnim(false), 400)
  }

  const handleThank = () => {
    setThanked(!thanked)
    setThankAnim(true)
    setTimeout(() => setThankAnim(false), 400)
  }

  const isDanger = review.shieldStatus === 'danger'
  const isWarning = review.shieldStatus === 'warning'

  return (
    <article className={cn(
      'feed-card rounded-2xl border p-4 mb-3 transition-all',
      'bg-white dark:bg-surface-1',
      'border-black/[0.07] dark:border-white/[0.06]',
      'shadow-sm dark:shadow-none',
      isDanger ? 'opacity-50 grayscale' : '',
      isWarning ? 'opacity-80' : '',
    )}>
      <ShieldBadge status={review.shieldStatus} reason={review.shieldReason} />

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Link href={`/kullanici/${review.userHandle?.replace('@', '') || 'kullanici'}`} className="relative flex-shrink-0">
          <Avatar name={review.userName || 'KullanÄ±cÄ±'} image={review.userImage} size={44} />
          {review.userIsMuhtar && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-[9px] font-black text-black border-2 border-white dark:border-surface-1">
              M
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/kullanici/${review.userHandle?.replace('@', '') || 'kullanici'}`}
              className="font-semibold text-sm text-gray-900 dark:text-white hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
            >
              {review.userName}
            </Link>

            {review.userIsMuhtar && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full
                bg-amber-50 text-amber-700 border border-amber-200
                dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30">
                {review.userMuhtarNeighborhood} MuhtarÄ±
              </span>
            )}

            {review.userIsExpert && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full
                bg-indigo-50 text-indigo-700 border border-indigo-200
                dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/20">
                {review.userExpertise}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-gray-400 dark:text-white/40">{review.userHandle}</span>
            <span className="text-gray-200 dark:text-white/20">Â·</span>
            <Link
              href={`/isletme/${review.businessSlug}`}
              className="text-xs text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors font-medium truncate"
            >
              {review.businessName}
            </Link>
          </div>
        </div>

        <span className="text-xs text-gray-400 dark:text-white/30 flex-shrink-0">{review.createdAt}</span>
      </div>

      {/* Content */}
      {!isDanger ? (
        <>
          {/* Irony warning */}
          {review.sentiment?.irony && (
            <div className="flex items-start gap-2 mb-3 p-2.5 rounded-xl
              bg-red-50 border border-red-200
              dark:bg-red-500/10 dark:border-red-500/20">
              <AlertTriangle size={13} className="text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-red-600 dark:text-red-400">Ä°roni Tespit Edildi</span>
                {review.ironyExplanation && (
                  <p className="text-[11px] text-gray-500 dark:text-white/50 mt-0.5">{review.ironyExplanation}</p>
                )}
              </div>
            </div>
          )}

          <p className="text-sm text-gray-700 dark:text-white/80 leading-relaxed mb-3">
            {review.content}
          </p>

          {/* AI highlights */}
          {review.aiHighlights && review.aiHighlights.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {review.aiHighlights.map((tag) => (
                <span key={tag} className="ai-highlight text-xs">{tag}</span>
              ))}
            </div>
          )}

          {/* Photos */}
          {(review.photos?.length ?? 0) > 0 && (
            <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: `repeat(${Math.min((review.photos?.length ?? 0), 3)}, 1fr)` }}>
              {(review.photos ?? []).map((photo, i) => (
                <img key={i} src={photo} alt="" className="rounded-xl object-cover w-full h-28"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              ))}
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={i < review.rating ? 'text-amber-400' : 'text-gray-200 dark:text-white/15'} style={{ fontSize: 13 }}>
                â˜…
              </span>
            ))}
            <span className="text-xs text-gray-400 dark:text-white/40 ml-1">{review.rating}/5</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 pt-2 border-t border-black/[0.05] dark:border-white/[0.05]">
            <button
              onClick={handleLike}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all btn-press',
                liked
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400'
                  : 'text-gray-400 dark:text-white/40 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-600 dark:hover:text-white/70'
              )}
            >
              <ThumbsUp size={13} className={likeAnim ? 'animate-wiggle' : ''} />
              <span className={likeAnim ? 'animate-number-tick' : ''}>
                {formatCount(review.helpfulCount + (liked ? 1 : 0))}
              </span>
            </button>

            <button
              onClick={handleThank}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all btn-press relative',
                thanked
                  ? 'bg-pink-50 text-pink-600 dark:bg-pink-500/15 dark:text-pink-400'
                  : 'text-gray-400 dark:text-white/40 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-600 dark:hover:text-white/70'
              )}
            >
              <Heart size={13} className={cn(thanked ? 'fill-pink-500 dark:fill-pink-400' : '', thankAnim ? 'animate-pop' : '')} />
              {thankAnim && (
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="w-4 h-4 rounded-full bg-pink-400/30 animate-ping-once" />
                </span>
              )}
              <span>TeÅŸekkÃ¼r</span>
            </button>

            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
              text-gray-400 dark:text-white/40
              hover:bg-gray-50 dark:hover:bg-white/5
              hover:text-gray-600 dark:hover:text-white/70 transition-all">
              <MessageCircle size={13} />
              <span>YanÄ±tla</span>
            </button>

            <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
              text-gray-300 dark:text-white/30
              hover:bg-gray-50 dark:hover:bg-white/5
              hover:text-gray-500 dark:hover:text-white/50 transition-all">
              <Share2 size={13} />
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-6 text-gray-400 dark:text-white/30 text-sm italic">
          Bu iÃ§erik ÅŸÃ¼pheli aktivite nedeniyle inceleniyor
        </div>
      )}
    </article>
  )
}
