import type { MeterRecord } from '../../types'

interface Props {
  records: MeterRecord[]
}

// 5-stop color scale: navy → teal → green → yellow → red
function heatColor(val: number, max: number): string {
  if (max === 0) return '#0f172a'
  const t = Math.min(val / max, 1)

  const stops = [
    [15, 23, 42],    // 0.0 — navy (no usage)
    [14, 116, 144],  // 0.25 — teal
    [22, 163, 74],   // 0.5 — green
    [234, 179, 8],   // 0.75 — yellow
    [220, 38, 38],   // 1.0 — red
  ] as const

  const scaled = t * (stops.length - 1)
  const lo = Math.floor(scaled)
  const hi = Math.min(lo + 1, stops.length - 1)
  const tt = scaled - lo

  const [r, g, b] = [0, 1, 2].map(i =>
    Math.round(stops[lo]![i] + (stops[hi]![i] - stops[lo]![i]) * tt)
  ) as [number, number, number]

  return `rgb(${r},${g},${b})`
}

function fmtDateShort(iso: string) {
  const [yyyy, mm, dd] = iso.split('-')
  return `${dd}/${mm}/${yyyy?.slice(2)}`
}

export default function HeatmapChart({ records }: Props) {
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
            const label = fmtDateShort(date)
            return (
              <g key={date}>
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
                  const [yyyy, mm, dd] = date.split('-')
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
                      <title>{`${dd}/${mm}/${yyyy} ${String(h).padStart(2, '0')}:00 — ${val.toFixed(3)} kWh`}</title>
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
          background: 'linear-gradient(to right, #0f172a, #0e7490, #16a34a, #eab308, #dc2626)'
        }} />
        <span className="text-slate-500 text-xs">High</span>
      </div>
    </div>
  )
}
