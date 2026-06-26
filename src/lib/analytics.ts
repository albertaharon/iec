import type { Analytics, DailySummary, HourlyProfile, MeterRecord, WeekdayProfile } from '../types'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function computeAnalytics(records: MeterRecord[]): Analytics {
  // Group by date
  const byDate = new Map<string, MeterRecord[]>()
  for (const r of records) {
    const arr = byDate.get(r.date) ?? []
    arr.push(r)
    byDate.set(r.date, arr)
  }

  const dates = [...byDate.keys()].sort()
  const dateRange = { start: dates[0] ?? '', end: dates[dates.length - 1] ?? '' }
  const daysOfData = dates.length

  // Daily summaries
  const dailySummaries: DailySummary[] = dates.map(date => {
    const recs = byDate.get(date)!
    const total = recs.reduce((s, r) => s + r.consumption, 0)
    const peak15min = Math.max(...recs.map(r => r.consumption))
    const peakRec = recs.find(r => r.consumption === peak15min)!
    const [yyyy, mm, dd] = date.split('-')
    const jsDate = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
    return {
      date,
      label: `${dd}/${mm}`,
      total: Math.round(total * 1000) / 1000,
      peak15min: Math.round(peak15min * 1000) / 1000,
      peakTime: peakRec.time,
      intervals: recs.length,
      weekday: WEEKDAYS[jsDate.getDay()] ?? '',
    }
  })

  const totalKwh = Math.round(dailySummaries.reduce((s, d) => s + d.total, 0) * 100) / 100
  const averageDaily = Math.round((totalKwh / daysOfData) * 100) / 100

  // Hourly profile — group all records by hour, compute averages per day then avg
  const hourDayMap = new Map<string, number[]>()  // key: "hour-date"
  for (const r of records) {
    const hour = parseInt(r.time.split(':')[0]!)
    const key = `${hour}-${r.date}`
    const arr = hourDayMap.get(key) ?? []
    arr.push(r.consumption)
    hourDayMap.set(key, arr)
  }

  // For each hour, collect daily totals then average across days
  const hourlyByDay = new Map<number, number[]>()
  for (const [key, vals] of hourDayMap) {
    const hour = parseInt(key.split('-')[0]!)
    const hourTotal = vals.reduce((s, v) => s + v, 0)
    const arr = hourlyByDay.get(hour) ?? []
    arr.push(hourTotal)
    hourlyByDay.set(hour, arr)
  }

  const hourlyProfile: HourlyProfile[] = Array.from({ length: 24 }, (_, hour) => {
    const dayTotals = hourlyByDay.get(hour) ?? [0]
    const avgKwh = dayTotals.reduce((s, v) => s + v, 0) / dayTotals.length
    const maxKwh = Math.max(...dayTotals)
    return {
      hour,
      label: `${String(hour).padStart(2, '0')}:00`,
      avgKwh: Math.round(avgKwh * 1000) / 1000,
      maxKwh: Math.round(maxKwh * 1000) / 1000,
    }
  })

  // Weekday profile
  const weekdayTotals = new Map<number, number[]>()
  for (const d of dailySummaries) {
    const [yyyy, mm, dd] = d.date.split('-')
    const jsDate = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
    const dayIdx = jsDate.getDay()
    const arr = weekdayTotals.get(dayIdx) ?? []
    arr.push(d.total)
    weekdayTotals.set(dayIdx, arr)
  }

  const weekdayProfile: WeekdayProfile[] = WEEKDAYS.map((day, dayIndex) => {
    const totals = weekdayTotals.get(dayIndex) ?? []
    const avgDaily = totals.length > 0
      ? Math.round((totals.reduce((s, v) => s + v, 0) / totals.length) * 100) / 100
      : 0
    return { day, dayIndex, avgDaily }
  })

  const sortedByTotal = [...dailySummaries].sort((a, b) => b.total - a.total)
  const peakDay = sortedByTotal[0]!
  const topPeakDays = sortedByTotal.slice(0, 10)

  const hoursWithData = hourlyProfile.filter(h => hourlyByDay.has(h.hour))
  const sortedHourly = [...hoursWithData].sort((a, b) => b.avgKwh - a.avgKwh)
  const peakHour = sortedHourly[0]!
  const quietHour = sortedHourly[sortedHourly.length - 1]!

  return {
    totalKwh,
    dateRange,
    daysOfData,
    averageDaily,
    dailySummaries,
    hourlyProfile,
    weekdayProfile,
    peakDay,
    peakHour,
    quietHour,
    topPeakDays,
  }
}
