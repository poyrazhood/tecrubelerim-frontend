'use client'

import React, { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { ArrowLeft, Bookmark, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { BusinessCard } from '@/components/business/BusinessCard'
import Link from 'next/link'

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '')
const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

export default function KaydedilenlerPage() {
  const router = useRouter()
  const [businesses, setBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/users/me/saved?page=${p}&limit=10`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (res.ok) {
        const data = await res.json()
        if (p === 1) setBusinesses(data.data || [])
        else setBusinesses(prev => [...prev, ...(data.data || [])])
        setHasMore(data.pagination?.page < data.pagination?.totalPages)
      }
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load(1) }, [])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    load(next)
  }

  return (
    <AppLayout>
      <div className="pb-6">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06]">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-base font-bold text-white">Kaydedilen Yerler</h1>
            {businesses.length > 0 && <p className="text-xs text-white/40">{businesses.length} yer</p>}
          </div>
        </div>

        <div className="px-4 pt-4">
          {loading && businesses.length === 0 ? (
            <div className="flex justify-center py-16">
              <Loader2 size={24} className="animate-spin text-white/30" />
            </div>
          ) : businesses.length === 0 ? (
            <div className="text-center py-16">
              <Bookmark size={36} className="mx-auto mb-3 text-white/20" />
              <div className="text-white/40 text-sm mb-1">Henuz kaydedilen yer yok</div>
              <Link href="/kesf" className="text-indigo-400 text-sm font-medium hover:text-indigo-300">
                Yerleri kesfet
              </Link>
            </div>
          ) : (
            <>
              {businesses.map(b => <BusinessCard key={b.id} business={b} />)}
              {hasMore && (
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="w-full mt-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white/60 hover:bg-white/[0.08] transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : 'Daha Fazla'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
