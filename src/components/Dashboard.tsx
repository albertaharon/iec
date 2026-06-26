import { useState, useMemo } from 'react'
import type { ParsedData } from '../types'
import { computeAnalytics } from '../lib/analytics'
import StatCard from './StatCard'
import DailyChart from './charts/DailyChart'
import HourlyProfileChart from './charts/HourlyProfileChart'
import WeekdayChart from './charts/WeekdayChart'
import HeatmapChart from './charts/HeatmapChart'
import PeakDaysTable from './PeakDaysTable'

interface Props {
  data: ParsedData
  isDark: boolean
  onReset: () => void
}

function fmtDate(iso: string) {
  const [yyyy, mm, dd] = iso.split('-')
  return `${dd}/${mm}/${yyyy}`
}

export default function Dashboard({ data, isDark, onReset }: Props) {
  const allDates = useMemo(() => {
    const s = new Set(data.records.map(r => r.date))
    return [...s].sort()
  }, [data.records])

  const minDate = allDates[0] ?? ''
  const maxDate = allDates[allDates.length - 1] ?? ''

  const [startDate, setStartDate] = useState(minDate)
  const [endDate, setEndDate] = useState(maxDate)

  const filteredRecords = useMemo(() =>
    data.records.filter(r => r.date >= startDate && r.date <= endDate),
    [data.records, startDate, endDate]
  )

  const analytics = useMemo(() =>
    computeAnalytics(filteredRecords.length > 0 ? filteredRecords : data.records),
    [filteredRecords, data.records]
  )

  const {
    totalKwh, dateRange, daysOfData, averageDaily,
    dailySummaries, hourlyProfile, weekdayProfile,
    peakDay, peakHour, quietHour, topPeakDays,
  } = analytics

  const showWeekday = daysOfData >= 7
  const heatmapRecords = filteredRecords.length > 0 ? filteredRecords : data.records

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-10
                         bg-white/90 dark:bg-slate-950/90 backdrop-blur
                         border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h1 className="text-gray-900 dark:text-white font-semibold text-sm leading-tight">
                {data.metadata.customerName || 'צריכת חשמל'}
              </h1>
              <p className="text-gray-500 dark:text-slate-500 text-xs truncate max-w-xs">
                {data.metadata.address}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 dark:text-slate-500 text-xs hidden sm:block">
              {data.fileName}
            </span>
            <button
              onClick={onReset}
              className="text-sm text-gray-600 dark:text-slate-400
                         hover:text-gray-900 dark:hover:text-white
                         bg-gray-100 dark:bg-slate-800
                         hover:bg-gray-200 dark:hover:bg-slate-700
                         px-3 py-1.5 rounded-lg transition-colors
                         border border-gray-200 dark:border-slate-700"
            >
              ↑ העלה קובץ חדש
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Date range banner + selector */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="text-gray-500 dark:text-slate-400 text-sm flex-1">
              הקובץ מכסה{' '}
              <span className="text-gray-900 dark:text-slate-200 font-medium">{allDates.length} ימים</span>
              {' '}· {fmtDate(minDate)} → {fmtDate(maxDate)}
            </div>
            {/* Date inputs are always LTR regardless of page direction */}
            <div className="flex items-center gap-2 flex-wrap" dir="ltr">
              <span className="text-gray-400 dark:text-slate-500 text-xs whitespace-nowrap">טווח:</span>
              <input
                type="date"
                value={startDate}
                min={minDate}
                max={endDate}
                onChange={e => setStartDate(e.target.value)}
                className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700
                           rounded-lg px-2 py-1 text-sm text-gray-800 dark:text-slate-200
                           focus:outline-none focus:border-cyan-500"
              />
              <span className="text-gray-400 dark:text-slate-500 text-xs">→</span>
              <input
                type="date"
                value={endDate}
                min={startDate}
                max={maxDate}
                onChange={e => setEndDate(e.target.value)}
                className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700
                           rounded-lg px-2 py-1 text-sm text-gray-800 dark:text-slate-200
                           focus:outline-none focus:border-cyan-500"
              />
              {(startDate !== minDate || endDate !== maxDate) && (
                <button
                  onClick={() => { setStartDate(minDate); setEndDate(maxDate) }}
                  className="text-xs text-cyan-500 hover:text-cyan-400 underline whitespace-nowrap"
                >
                  איפוס
                </button>
              )}
            </div>
          </div>
          {(startDate !== minDate || endDate !== maxDate) && (
            <p className="text-gray-400 dark:text-slate-500 text-xs mt-2">
              מציג {daysOfData} מתוך {allDates.length} ימים · {fmtDate(dateRange.start)} → {fmtDate(dateRange.end)}
            </p>
          )}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <StatCard
              label="סך צריכה"
              value={`${totalKwh.toFixed(1)} kWh`}
              sub={`על פני ${daysOfData} ימים`}
              accent="cyan"
              icon="🔋"
            />
          </div>
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <StatCard
              label="ממוצע יומי"
              value={`${averageDaily.toFixed(2)} kWh`}
              sub="ליום"
              accent="green"
              icon="📊"
            />
          </div>
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <StatCard
              label="יום שיא"
              value={`${fmtDate(peakDay.date)} (${peakDay.weekday})`}
              sub={`${peakDay.total.toFixed(2)} kWh`}
              accent="amber"
              icon="📈"
            />
          </div>
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <StatCard
              label="שעת שיא"
              value={peakHour.label}
              sub={`ממוצע ${peakHour.avgKwh.toFixed(3)} kWh`}
              accent="rose"
              icon="⏰"
            />
          </div>
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <StatCard
              label="שעה שקטה"
              value={quietHour.label}
              sub={`ממוצע ${quietHour.avgKwh.toFixed(3)} kWh`}
              accent="violet"
              icon="😴"
            />
          </div>
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <StatCard
              label="מונה"
              value={data.metadata.meterNumber || '—'}
              sub={`קוד ${data.metadata.meterCode}`}
              accent="cyan"
              icon="🔌"
            />
          </div>
        </div>

        {/* Daily chart */}
        <DailyChart summaries={dailySummaries} average={averageDaily} />

        {/* Heatmap */}
        <HeatmapChart records={heatmapRecords} isDark={isDark} />

        {/* Hourly + weekday side by side */}
        <div className={`grid gap-6 ${showWeekday ? 'lg:grid-cols-2' : ''}`}>
          <HourlyProfileChart profile={hourlyProfile} isDark={isDark} />
          {showWeekday && <WeekdayChart profile={weekdayProfile} />}
        </div>

        {/* Peak days table */}
        <PeakDaysTable days={topPeakDays} />

        {/* Footer */}
        <footer className="text-center text-gray-400 dark:text-slate-600 text-xs pb-8">
          הנתונים מעובדים מקומית בדפדפן שלך · עותק מועלה לבעל האתר לצרכי ניפוי שגיאות
        </footer>
      </main>
    </div>
  )
}
