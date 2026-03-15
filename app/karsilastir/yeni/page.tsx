'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
export default function YeniKarsilastir() {
  const router = useRouter()
  useEffect(() => { router.replace('/karsilastir/ara') }, [])
  return null
}
