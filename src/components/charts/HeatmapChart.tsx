import type { MeterRecord } from '../../types'

interface Props {
  records: MeterRecord[]
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

// Color: dark slate (low) → cyan (mid) → amber (high)
function heatColor(val: number, max: number): string {
  if (max === 0) return '#1e293b'
  const t = Math.min(val / max, 1)
  if (t < 0.5) {
    const tt = t * 2
    const r = Math.round(lerp(30, 6, tt))
    const g = Math.round(lerp(41, 182, tt))
    const b = Math.round(lerp(59, 212, tt))
    return `rgb(${r},${g},${b})`
  } else {
    const tt = (t - 0.5) * 2
    const r = Math.round(lerp(6, 245, tt))
    const g = Math.round(lerp(182, 158, tt))
    const b = Math.round(lerp(212, 11, tt))
    return `rgb(${r},${g},${b})`
  }
}

export default function HeatmapChart({ records }: Props) {
  // Build date × hour grid
  const dateSet = new Set(records.map(r => r.date))
  const dates = [...dateSet].sort()

  const grid = new Map<string, number>()
  for (const r of records) {
    const hour = parseInt(r.time.split(':')[0]!)
    const key = `${r.date}-${hour}`
    grid.set(key, (grid.get(key) ?? 0) + r.consumption)
  }

  const allVals = [...grid.values()]
  const maxVal = allVals.length ? Math.max(...allVals) : 1

  const hours = Array.from({ length: 24 }, (_, i) => i)

  // Limit to last 60 days if data is large
  const visibleDates = dates.slice(-60)

  const cellW = Math.max(8, Math.min(18, Math.floor(900 / visibleDates.length)))
  const cellH = 14

  const svgWidth = cellW * visibleDates.length + 48
  const svgHeight = cellH * 24 + 32

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <h2 className="text-slate-200 font-semibold mb-1">Usage Heatmap</h2>
      <p className="text-slate-500 text-xs mb-4">
        Each column = one day · each row = one hour · color = kWh consumed
      </p>
      <div className="overflow-x-auto">
        <svg width={svgWidth} height={svgHeight} style={{ display: 'block' }}>
          {/* Hour labels */}
          {hours.map(h => (
            <text
              key={h}
              x={36}
              y={h * cellH + cellH / 2 + 28 + 4}
              textAnchor="end"
              fontSize={9}
              fill="#64748b"
            >
              {String(h).padStart(2, '0')}
            </text>
          ))}

          {/* Cells */}
          {visibleDates.map((date, di) => {
            const [yyyy, mm, dd] = date.split('-')
            const label = `${dd}/${mm}/${yyyy?.slice(2)}`
            return (
              <g key={date}>
                {/* Date label every N days */}
                {di % Math.max(1, Math.floor(visibleDates.length / 10)) === 0 && (
                  <text
                    x={48 + di * cellW + cellW / 2}
                    y={18}
                    textAnchor="middle"
                    fontSize={8}
                    fill="#64748b"
                  >
                    {label}
                  </text>
                )}
                {hours.map(h => {
                  const val = grid.get(`${date}-${h}`) ?? 0
                  return (
                    <rect
                      key={h}
                      x={48 + di * cellW}
                      y={28 + h * cellH}
                      width={cellW - 1}
                      height={cellH - 1}
                      rx={1}
                      fill={heatColor(val, maxVal)}
                    >
                      <title>{`${date} ${String(h).padStart(2, '0')}:00 — ${val.toFixed(3)} kWh`}</title>
                    </rect>
                  )
                })}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3">
        <span className="text-slate-500 text-xs">Low</span>
        <div className="flex-1 h-2 rounded-full" style={{
          background: 'linear-gradient(to right, #1e293b, #06b6d4, #f59e0b)'
        }} />
        <span className="text-slate-500 text-xs">High</span>
      </div>
    </div>
  )
}
