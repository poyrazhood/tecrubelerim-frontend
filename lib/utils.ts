import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTrustColor(grade: string): string {
  const colors: Record<string, string> = {
    A: '#22C55E',
    B: '#84CC16',
    C: '#EAB308',
    D: '#F97316',
    F: '#EF4444',
  }
  return colors[grade] ?? colors['C']
}

export function getTrustBg(grade: string): string {
  const colors: Record<string, string> = {
    A: 'rgba(34,197,94,0.12)',
    B: 'rgba(132,204,22,0.12)',
    C: 'rgba(234,179,8,0.12)',
    D: 'rgba(249,115,22,0.12)',
    F: 'rgba(239,68,68,0.12)',
  }
  return colors[grade] ?? colors['C']
}

export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}B`
  return String(n)
}

export function timeAgo(date: string): string {
  return date
}
