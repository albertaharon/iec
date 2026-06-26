import type { MeterRecord } from '../../types'
import { heatColor, heatLegendGradient } from '../../lib/colors'

interface Props {
  records: MeterRecord[]
  isDark: boolean
}

function fmtDateShort(iso: string) {
  const [yyyy, mm, dd] = iso.split('-')
  return `${dd}/${mm}/${yyyy?.slice(2)}`
}

export default function HeatmapChart({ records, isDark }: Props) {
  const dateSet = new Set(records.map(r => r.date))
  const dates = [...dateSet].sort()

  const grid = new Map<string, number>()
  for (const r of records) {
    const hour = parseInt(r.time.split(':')[0]!)
    const key = `${r.date}-${hour}`
    grid.set(key, (grid.get(key) ?? 0) + r.consumption)
  }

  const allVals = [...grid.values()].filter(v => v > 0)
  // Use 95th percentile as effective max so colors spread across most of the data
  const sortedVals = [...allVals].sort((a, b) => a - b)
  const p95idx = Math.floor(sortedVals.length * 0.95)
  const maxVal = sortedVals[p95idx] ?? (sortedVals[sortedVals.length - 1] ?? 1)

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const visibleDates = dates.slice(-60)

  const cellW = Math.max(8, Math.min(18, Math.floor(900 / visibleDates.length)))
  const cellH = 14

  const svgWidth = cellW * visibleDates.length + 48
  const svgHeight = cellH * 24 + 32

  const axisColor = isDark ? '#64748b' : '#94a3b8'
  const emptyColor = isDark ? '#0f172a' : '#f1f5f9'

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5">
      <h2 className="text-gray-900 dark:text-slate-200 font-semibold mb-1">מפת חום צריכה</h2>
      <p className="text-gray-400 dark:text-slate-500 text-xs mb-4">
        כל עמודה = יום · כל שורה = שעה · צבע = kWh שנצרך
      </p>
      {/* SVG heatmap is always LTR */}
      <div className="overflow-x-auto" dir="ltr">
        <svg width={svgWidth} height={svgHeight} style={{ display: 'block' }}>
          {/* Hour labels */}
          {hours.map(h => (
            <text
              key={h}
              x={36}
              y={h * cellH + cellH / 2 + 28 + 4}
              textAnchor="end"
              fontSize={9}
              fill={axisColor}
            >
              {String(h).padStart(2, '0')}
            </text>
          ))}

          {/* Cells */}
          {visibleDates.map((date, di) => {
            const label = fmtDateShort(date)
            return (
              <g key={date}>
                {di % Math.max(1, Math.floor(visibleDates.length / 10)) === 0 && (
                  <text
                    x={48 + di * cellW + cellW / 2}
                    y={18}
                    textAnchor="middle"
                    fontSize={8}
                    fill={axisColor}
                  >
                    {label}
                  </text>
                )}
                {hours.map(h => {
                  const val = grid.get(`${date}-${h}`) ?? 0
                  const [yyyy, mm, dd] = date.split('-')
                  return (
                    <rect
                      key={h}
                      x={48 + di * cellW}
                      y={28 + h * cellH}
                      width={cellW - 1}
                      height={cellH - 1}
                      rx={1}
                      fill={val > 0 ? heatColor(val, maxVal, isDark) : emptyColor}
                    >
                      <title>{`${dd}/${mm}/${yyyy} ${String(h).padStart(2, '0')}:00 — ${val.toFixed(3)} kWh`}</title>
                    </rect>
                  )
                })}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend — always LTR so low=left, high=right matches the gradient direction */}
      <div className="flex items-center gap-3 mt-3" dir="ltr">
        <span className="text-gray-400 dark:text-slate-500 text-xs">נמוך</span>
        <div className="flex-1 h-2 rounded-full" style={{
          background: heatLegendGradient(isDark)
        }} />
        <span className="text-gray-400 dark:text-slate-500 text-xs">גבוה</span>
      </div>
    </div>
  )
}
