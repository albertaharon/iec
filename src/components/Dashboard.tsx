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
  onReset: () => void
}

function fmtDate(iso: string) {
  const [yyyy, mm, dd] = iso.split('-')
  return `${dd}/${mm}/${yyyy}`
}

export default function Dashboard({ data, onReset }: Props) {
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h1 className="text-white font-semibold text-sm leading-tight">
                {data.metadata.customerName || 'Electricity Dashboard'}
              </h1>
              <p className="text-slate-500 text-xs truncate max-w-xs">
                {data.metadata.address}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-500 text-xs hidden sm:block">
              {data.fileName}
            </span>
            <button
              onClick={onReset}
              className="text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700
                         px-3 py-1.5 rounded-lg transition-colors border border-slate-700"
            >
              ↑ Upload new file
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Date range banner + selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="text-slate-400 text-sm flex-1">
              File covers{' '}
              <span className="text-slate-200 font-medium">{allDates.length} days</span>
              {' '}· {fmtDate(minDate)} → {fmtDate(maxDate)}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 text-xs whitespace-nowrap">Show range:</span>
              <input
                type="date"
                value={startDate}
                min={minDate}
                max={endDate}
                onChange={e => setStartDate(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm
                           text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-slate-500 text-xs">→</span>
              <input
                type="date"
                value={endDate}
                min={startDate}
                max={maxDate}
                onChange={e => setEndDate(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm
                           text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              {(startDate !== minDate || endDate !== maxDate) && (
                <button
                  onClick={() => { setStartDate(minDate); setEndDate(maxDate) }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 underline whitespace-nowrap"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
          {(startDate !== minDate || endDate !== maxDate) && (
            <p className="text-slate-500 text-xs mt-2">
              Showing {daysOfData} of {allDates.length} days · {fmtDate(dateRange.start)} → {fmtDate(dateRange.end)}
            </p>
          )}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <StatCard
              label="Total Consumption"
              value={`${totalKwh.toFixed(1)} kWh`}
              sub={`over ${daysOfData} day${daysOfData !== 1 ? 's' : ''}`}
              accent="cyan"
              icon="🔋"
            />
          </div>
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <StatCard
              label="Daily Average"
              value={`${averageDaily.toFixed(2)} kWh`}
              sub="per day"
              accent="green"
              icon="📊"
            />
          </div>
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <StatCard
              label="Peak Day"
              value={`${peakDay.label} (${peakDay.weekday})`}
              sub={`${peakDay.total.toFixed(2)} kWh`}
              accent="amber"
              icon="📈"
            />
          </div>
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <StatCard
              label="Peak Hour"
              value={peakHour.label}
              sub={`avg ${peakHour.avgKwh.toFixed(3)} kWh`}
              accent="rose"
              icon="⏰"
            />
          </div>
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <StatCard
              label="Quietest Hour"
              value={quietHour.label}
              sub={`avg ${quietHour.avgKwh.toFixed(3)} kWh`}
              accent="violet"
              icon="😴"
            />
          </div>
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <StatCard
              label="Meter"
              value={data.metadata.meterNumber || '—'}
              sub={`Code ${data.metadata.meterCode}`}
              accent="cyan"
              icon="🔌"
            />
          </div>
        </div>

        {/* Daily chart */}
        <DailyChart summaries={dailySummaries} average={averageDaily} />

        {/* Heatmap */}
        <HeatmapChart records={filteredRecords.length > 0 ? filteredRecords : data.records} />

        {/* Hourly + weekday side by side */}
        <div className={`grid gap-6 ${showWeekday ? 'lg:grid-cols-2' : ''}`}>
          <HourlyProfileChart profile={hourlyProfile} peakHour={peakHour.hour} />
          {showWeekday && <WeekdayChart profile={weekdayProfile} />}
        </div>

        {/* Peak days table */}
        <PeakDaysTable days={topPeakDays} />

        {/* Footer */}
        <footer className="text-center text-slate-600 text-xs pb-8">
          Data processed locally in your browser · uploaded copy archived for site owner
        </footer>
      </main>
    </div>
  )
}
