import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Format date string (YYYY-MM-DD or DD/MM/YYYY) to DD/MM/YYYY */
export function formatDateDDMMYYYY(dateStr: string | undefined): string {
  if (!dateStr || !dateStr.trim()) return '-'
  const parts = dateStr.trim().split(/[-/]/)
  if (parts.length >= 3) {
    const [a, b, c] = parts
    const isYYYYMMDD = (a?.length ?? 0) === 4 && (b?.length ?? 0) <= 2
    const [d, m, y] = isYYYYMMDD ? [c, b, a] : [a, b, c]
    return `${d?.padStart(2, '0') ?? ''}/${m?.padStart(2, '0') ?? ''}/${y ?? ''}`
  }
  return dateStr
}
