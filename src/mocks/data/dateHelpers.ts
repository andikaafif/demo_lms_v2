const MS_PER_DAY = 24 * 60 * 60 * 1000

export function shiftDays(days: number): Date {
  return new Date(Date.now() + days * MS_PER_DAY)
}

/** ISO date-time string offset by the given number of days from now. */
export function isoDaysFromNow(days: number, hour = 9, minute = 0): string {
  const date = shiftDays(days)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

/** `YYYY-MM-DD` string offset by the given number of days from now. */
export function dateKeyFromNow(days: number): string {
  const date = shiftDays(days)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** Returns the last `count` weekday (Mon-Fri) date keys, oldest first. */
export function recentWeekdayKeys(count: number): string[] {
  const keys: string[] = []
  let offset = 0
  while (keys.length < count) {
    const date = shiftDays(-offset)
    const day = date.getDay()
    if (day !== 0 && day !== 6) {
      keys.push(dateKeyFromNow(-offset))
    }
    offset += 1
  }
  return keys.reverse()
}
