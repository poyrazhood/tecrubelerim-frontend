'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Activity, Play, Square, RefreshCw, ChevronLeft, Loader2,
  Cpu, AlertTriangle, CheckCircle, Clock, Zap, Trash2
} from 'lucide-react'
import Link from 'next/link'

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '')
const getH = () => ({ 'x-admin-secret': 'tecrube_admin_2026', 'Content-Type': 'application/json' })
const AUTO_REFRESH_MS = 10 * 60 * 1000

// Pipeline key → görsel bilgi
const PIPELINE_META: Record<string, { name: string; icon: string; description: string; color: string }> = {
  reviewEmbed:  { name: 'Review Embedding',     icon: '💬', description: 'Yorumları Ollama ile vektöre çevirir (mxbai-embed-large)',      color: 'indigo'  },
  bizEmbed:     { name: 'Business Embedding',   icon: '🏢', description: 'İşletmeleri vektöre çevirir, benzer öneri için kullanılır',     color: 'purple'  },
  enrich:       { name: 'AI Zenginleştirme',    icon: '🤖', description: 'Yorumlardan soru-cevap üretir (llama3.1:8b)',                   color: 'blue'    },
  scraper:      { name: 'Review Scraper',       icon: '🔍', description: 'Google Maps\'ten işletme yorumlarını toplar (sürekli çalışır)', color: 'emerald' },
}

const COLOR_MAP: Record<string, { bg: string; border: string; text: string }> = {
  indigo:  { bg: 'bg-indigo-500/10',  border: 'border-indigo-500/30',  text: 'text-indigo-400'  },
  purple:  { bg: 'bg-purple-500/10',  border: 'border-purple-500/30',  text: 'text-purple-400'  },
  blue:    { bg: 'bg-blue-500/10',    border: 'border-blue-500/30',    text: 'text-blue-400'    },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'RUNNING') return (
    <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-bold">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      ÇALIŞIYOR
    </span>
  )
  if (status === 'FAILED') return (
    <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/25 font-bold">
      <AlertTriangle size={10} /> HATA
    </span>
  )
  return (
    <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-white/30 border border-white/10 font-bold">
      <Clock size={10} /> BEKLİYOR
    </span>
  )
}

function StatBox({ label, value, sub, color = 'white' }: { label: string; value: string; sub?: string; color?: string }) {
  const colorClass = color === 'red' ? 'text-red-400' : color === 'amber' ? 'text-amber-400' : color === 'emerald' ? 'text-emerald-400' : 'text-white'
  return (
    <div className="bg-black/20 rounded-xl p-3 text-center">
      <div className={cn('text-lg font-black', colorClass)}>{value}</div>
      {sub && <div className="text-[10px] text-white/30 mt-0.5">{sub}</div>}
      <div className="text-[10px] text-white/40 mt-0.5">{label}</div>
    </div>
  )
}

export default function AdminPipelinePage() {
  const [rawPipelines, setRawPipelines] = useState<any[]>([])
  const [system, setSystem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState(AUTO_REFRESH_MS / 1000)
  const [killLoading, setKillLoading] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/pipeline/status`, { headers: getH() })
      if (!res.ok) return
      const d = await res.json()
      setRawPipelines(d.pipelines || [])
      setSystem(d.system || null)
      setLastRefresh(new Date())
      setCountdown(AUTO_REFRESH_MS / 1000)
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchStatus()
    intervalRef.current = setInterval(fetchStatus, AUTO_REFRESH_MS)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [fetchStatus])

  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setCountdown(c => c <= 1 ? AUTO_REFRESH_MS / 1000 : c - 1)
    }, 1000)
    return () => { if (countdownRef.current) clearInterval(countdownRef.current) }
  }, [])

  const handleManualRefresh = () => { setLoading(true); fetchStatus(); setCountdown(AUTO_REFRESH_MS / 1000) }

  const handleAction = async (key: string, action: 'start' | 'stop') => {
    setActionLoading(key + action)
    try {
      const res = await fetch(`${API}/api/admin/pipeline/${key}/${action}`, { method: 'POST', headers: getH() })
      const d = await res.json()
      if (!res.ok) { alert(d.error || 'İşlem başarısız'); return }
      setTimeout(fetchStatus, 1500)
    } catch (e: any) { alert(e.message) }
    finally { setActionLoading(null) }
  }

  const handleKillChrome = async () => {
    setKillLoading(true)
    try {
      await fetch(`${API}/api/admin/pipeline/chrome/kill`, { method: 'POST', headers: getH() })
      setTimeout(fetchStatus, 2000)
    } catch {}
    finally { setKillLoading(false) }
  }

  const formatDate = (d: string | null) => {
    if (!d) return '—'
    try { return new Date(d).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }
    catch { return '—' }
  }

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60); const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const formatNum = (n: any) => {
    if (n == null) return '—'
    try { return Number(n).toLocaleString('tr-TR') } catch { return String(n) }
  }

  // Raw pipeline verilerini meta ile birleştir
  const pipelines = rawPipelines.map(p => {
    const meta = PIPELINE_META[p.pipeline] || { name: p.pipeline, icon: '⚙️', description: '', color: 'indigo' }
    return {
      key:         p.pipeline,
      name:        meta.name,
      icon:        meta.icon,
      description: meta.description,
      color:       meta.color,
      status:      p.status || 'IDLE',
      processed:   p.lastProcessed ?? p.totalProcessed ?? null,
      totalProcessed: p.totalProcessed ?? 0,
      speed:       p.speedPerSec ?? null,
      remaining:   p.remaining ?? null,
      errorCount:  p.lastErrors ?? 0,
      lastActivity: p.updatedAt ?? null,
      message:     p.message ?? null,
      lastStartedAt: p.lastStartedAt ?? null,
      lastFinishedAt: p.lastFinishedAt ?? null,
    }
  })

  const runningCount = pipelines.filter(p => p.status === 'RUNNING').length
  const memPercent = system ? Math.round(((system.usedMemMB ?? 0) / (system.totalMemMB ?? 1)) * 100) : 0
  const loadAvg = system?.loadAvg ?? 0
  const loadColor = loadAvg > 8 ? 'red' : loadAvg > 4 ? 'amber' : 'emerald'

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="border-b border-white/[0.07] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0f] z-10">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <ChevronLeft size={16} />
          </Link>
          <Activity size={18} className="text-indigo-400" />
          <span className="font-black text-lg">Pipeline Monitor</span>
          {runningCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-bold animate-pulse">
              {runningCount} aktif
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/25 font-mono">
            Yenileme: {formatCountdown(countdown)}
          </span>
          {lastRefresh && (
            <span className="text-xs text-white/25">
              {lastRefresh.toLocaleTimeString('tr-TR')}
            </span>
          )}
          <button onClick={handleManualRefresh} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] text-white/50 text-xs font-medium hover:text-white hover:bg-white/[0.08] transition-all disabled:opacity-30">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Yenile
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-6">

        {/* Sistem Kaynakları */}
        {system && (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Cpu size={15} className="text-white/50" />
              <span className="font-bold text-sm text-white">Sistem Kaynakları</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatBox label="CPU Load (1dk)" value={(system.loadAvg ?? 0).toFixed(2)} color={loadColor} />
              <StatBox label="CPU Load (5dk)" value={(system.loadAvg5 ?? 0).toFixed(2)} color={(system.loadAvg5 ?? 0) > 8 ? 'red' : 'white'} />
              <StatBox label="RAM Kullanım" value={`${memPercent}%`} sub={`${system.usedMemMB ?? 0} / ${system.totalMemMB ?? 0} MB`} color={memPercent > 85 ? 'red' : memPercent > 70 ? 'amber' : 'emerald'} />
              <StatBox label="Boş RAM" value={`${system.freeMemMB ?? 0} MB`} color={(system.freeMemMB ?? 0) < 500 ? 'red' : 'white'} />
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-white/30 mb-1">
                <span>CPU Yükü (8 core)</span>
                <span>{(system.loadAvg ?? 0).toFixed(2)} / 8.00</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div className={cn('h-full rounded-full transition-all duration-700',
                  loadAvg > 8 ? 'bg-red-500' : loadAvg > 4 ? 'bg-amber-500' : 'bg-emerald-500'
                )} style={{ width: `${Math.min((loadAvg / 8) * 100, 100)}%` }} />
              </div>
            </div>
            {loadAvg > 8 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                <AlertTriangle size={13} />
                Sunucu aşırı yüklü! Yeni pipeline başlatmayın.
              </div>
            )}
          </div>
        )}

        {/* Pipeline Kartları */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider">Pipeline'lar</h2>

          {loading && pipelines.length === 0 ? (
            <div className="flex justify-center py-16">
              <Loader2 size={28} className="animate-spin text-white/20" />
            </div>
          ) : pipelines.length === 0 ? (
            <div className="text-center py-16 text-white/20 text-sm">Veri yok — pipeline henüz hiç çalıştırılmamış</div>
          ) : (
            pipelines.map(p => {
              const colors = COLOR_MAP[p.color] || COLOR_MAP.indigo
              const isRunning = p.status === 'RUNNING'
              return (
                <div key={p.key} className={cn(
                  'rounded-2xl border p-5 transition-all',
                  isRunning ? `${colors.bg} ${colors.border}` : 'bg-white/[0.02] border-white/[0.07]'
                )}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0', colors.bg)}>
                        {p.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="font-bold text-white">{p.name}</span>
                          <StatusBadge status={p.status} />
                        </div>
                        <p className="text-xs text-white/40 mb-3">{p.description}</p>

                        {p.message && (
                          <div className="text-xs text-white/50 bg-white/[0.03] rounded-lg px-3 py-1.5 mb-3 font-mono">
                            {p.message}
                          </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <div className="bg-black/20 rounded-xl p-2.5 text-center">
                            <div className="text-sm font-black text-white">{formatNum(p.processed)}</div>
                            <div className="text-[10px] text-white/30 mt-0.5">Bu Çalışma</div>
                          </div>
                          <div className="bg-black/20 rounded-xl p-2.5 text-center">
                            <div className="text-sm font-black text-white">{formatNum(p.totalProcessed)}</div>
                            <div className="text-[10px] text-white/30 mt-0.5">Toplam</div>
                          </div>
                          <div className="bg-black/20 rounded-xl p-2.5 text-center">
                            <div className={cn('text-sm font-black', p.speed ? colors.text : 'text-white')}>
                              {p.speed != null ? `${Number(p.speed).toFixed(1)}/sn` : '—'}
                            </div>
                            <div className="text-[10px] text-white/30 mt-0.5">Hız</div>
                          </div>
                          <div className="bg-black/20 rounded-xl p-2.5 text-center">
                            <div className={cn('text-sm font-black', (p.errorCount ?? 0) > 0 ? 'text-amber-400' : 'text-white')}>
                              {p.errorCount ?? 0}
                            </div>
                            <div className="text-[10px] text-white/30 mt-0.5">Hata</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-[10px] text-white/25">
                          <span className="flex items-center gap-1">
                            <Clock size={9} /> Son güncelleme: {formatDate(p.lastActivity)}
                          </span>
                          {p.lastStartedAt && (
                            <span>Başladı: {formatDate(p.lastStartedAt)}</span>
                          )}
                          {p.remaining != null && (
                            <span className="flex items-center gap-1">
                              <Zap size={9} /> Kalan: {formatNum(p.remaining)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Aksiyon butonu */}
                    <div className="flex-shrink-0">
                      {isRunning ? (
                        <button
                          onClick={() => handleAction(p.key, 'stop')}
                          disabled={actionLoading === p.key + 'stop'}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/15 text-red-400 border border-red-500/20 text-xs font-bold hover:bg-red-500/25 transition-all disabled:opacity-50"
                        >
                          {actionLoading === p.key + 'stop' ? <Loader2 size={13} className="animate-spin" /> : <Square size={13} />}
                          Durdur
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(p.key, 'start')}
                          disabled={actionLoading === p.key + 'start' || loadAvg > 12}
                          className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 border', colors.bg, colors.text, colors.border, 'hover:opacity-80')}
                        >
                          {actionLoading === p.key + 'start' ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                          Başlat
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Bilgi Kutusu */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-amber-400" />
            <span className="font-bold text-sm text-white">Pipeline Sırası</span>
          </div>
          <div className="space-y-2">
            {Object.entries(PIPELINE_META).map(([key, meta], i) => (
              <div key={key} className="flex items-center gap-3 text-xs text-white/40">
                <span className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white', COLOR_MAP[meta.color]?.bg)}>
                  {i + 1}
                </span>
                <span className="font-bold text-white/60">{meta.icon} {meta.name}</span>
                <span>→ {meta.description}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-[11px] text-amber-400/60 bg-amber-500/5 border border-amber-500/10 rounded-xl px-3 py-2">
            ⚠ Embedding pipeline'larını aynı anda çalıştırmayın — Ollama aynı anda tek model çalıştırabilir.
          </div>
        </div>

      </div>
    </div>
  )
}
