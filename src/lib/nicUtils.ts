/**
 * Parse Sri Lankan NIC to extract Date of Birth
 * Old format: 901234567V (9 digits + V/X)
 * New format: 199912345678 (12 digits)
 *
 * Sri Lankan NIC convention: February is always 29 days for all years.
 */
const DAYS_UP_TO_MONTH = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335] // Feb = 29 days

function getDateFromDayOfYear(year: number, dayOfYear: number): { y: number; m: number; d: number } | null {
  if (dayOfYear < 1 || dayOfYear > 366) return null
  let month = 0
  for (let i = 11; i >= 0; i--) {
    if (dayOfYear > DAYS_UP_TO_MONTH[i]) {
      month = i
      break
    }
  }
  const day = dayOfYear - DAYS_UP_TO_MONTH[month]
  return { y: year, m: month + 1, d: day }
}

export function getDateOfBirthFromNIC(nic: string): string | null {
  const cleaned = (nic || '').trim().replace(/[^0-9]/g, '')
  if (cleaned.length === 0) return null

  let year: number
  let ddd: number

  if (cleaned.length >= 12) {
    // New NIC: YYYYDDDXXXXX
    year = parseInt(cleaned.substring(0, 4), 10)
    ddd = parseInt(cleaned.substring(4, 7), 10)
  } else if (cleaned.length >= 9) {
    // Old NIC: YYDDDXXXX
    const yy = parseInt(cleaned.substring(0, 2), 10)
    year = yy >= 0 && yy <= 25 ? 2000 + yy : 1900 + yy
    ddd = parseInt(cleaned.substring(2, 5), 10)
  } else {
    return null
  }

  // DDD > 500 means female (500 added to day)
  const dayOfYear = ddd > 500 ? ddd - 500 : ddd
  const result = getDateFromDayOfYear(year, dayOfYear)
  if (!result) return null

  const m = String(result.m).padStart(2, '0')
  const d = String(result.d).padStart(2, '0')
  return `${result.y}-${m}-${d}`
}
