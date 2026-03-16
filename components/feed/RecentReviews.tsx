'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { MapPin, ThumbsUp, MessageSquare, BadgeCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

interface Review {
  id: string
  content: string
  rating: number
  createdAt: string
  user: { username: string; avatarUrl?: string }
  business: { name: string; slug: string; city?: string; district?: string }
  helpfulCount?: number
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'şimdi'
  if (mins < 60) return `${mins}dk`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}s`
  return `${Math.floor(hrs / 24)}g`
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i <= rating ? '#F59E0B' : 'none'} stroke={i <= rating ? '#F59E0B' : '#4B5563'} strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}

export function RecentReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadedRef = useRef(false)

  async function loadReviews(p: number) {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch(`${API}/reviews/feed?limit=10&page=${p}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      const items: Review[] = data.reviews ?? data.data ?? data ?? []
      if (items.length < 10) setHasMore(false)
      setReviews((prev) => [...prev, ...items])
      setPage(p + 1)
    } catch {
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  // Intersection Observer — görünce yükle
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadedRef.current) {
          loadedRef.current = true
          loadReviews(1)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Sonraki sayfa için observer
  useEffect(() => {
    if (reviews.length === 0) return
    const el = sentinelRef.current
    if (!el || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadReviews(page)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reviews.length, hasMore, loading, page])

  return (
    <section className="px-4 mb-8">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare size={15} className="text-indigo-400" />
        <span className="text-[15px] font-bold text-[var(--fg)]">Son Yorumlar</span>
      </div>

      <div className="flex flex-col gap-3">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="p-3 rounded-2xl border bg-[var(--bg-1)] border-[var(--border)]"
          >
            {/* Üst: kullanıcı + işletme */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-[12px] font-bold text-indigo-400 flex-shrink-0 overflow-hidden">
                  {review.user?.avatarUrl ? (
                    <img src={review.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (review.user?.username?.[0] ?? '?').toUpperCase()
                  )}
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-[var(--fg)]">
                    @{review.user?.username ?? 'anonim'}
                  </div>
                  <StarRow rating={review.rating ?? 0} />
                </div>
              </div>
              <span className="text-[11px] text-[var(--fg-faint)] flex-shrink-0">
                {timeAgo(review.createdAt)}
              </span>
            </div>

            {/* Yorum metni */}
            <p className="text-[13px] text-[var(--fg-muted)] leading-relaxed line-clamp-3 mb-2">
              {review.content}
            </p>

            {/* Alt: işletme linki */}
            <Link
              href={`/isletme/${review.business?.slug}`}
              className="flex items-center gap-1 text-[11px] text-indigo-400 font-medium"
            >
              <MapPin size={10} />
              {review.business?.name}
              {review.business?.district && (
                <span className="text-[var(--fg-faint)]">· {review.business.district}</span>
              )}
            </Link>
          </div>
        ))}

        {/* Skeleton yükleme */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-2xl border bg-[var(--bg-1)] border-[var(--border)]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-3)] animate-pulse" />
                  <div className="flex flex-col gap-1">
                    <div className="w-24 h-3 rounded bg-[var(--bg-3)] animate-pulse" />
                    <div className="w-16 h-2.5 rounded bg-[var(--bg-3)] animate-pulse" />
                  </div>
                </div>
                <div className="w-full h-3 rounded bg-[var(--bg-3)] animate-pulse mb-1" />
                <div className="w-3/4 h-3 rounded bg-[var(--bg-3)] animate-pulse" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sentinel — buraya gelince yükle */}
      <div ref={sentinelRef} className="h-4" />

      {!hasMore && reviews.length > 0 && (
        <div className="text-center text-[12px] text-[var(--fg-faint)] py-4">
          Tüm yorumlar gösterildi
        </div>
      )}
    </section>
  )
}
