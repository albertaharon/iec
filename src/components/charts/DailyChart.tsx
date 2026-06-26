import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts'
import type { DailySummary } from '../../types'

interface Props {
  summaries: DailySummary[]
  average: number
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm shadow-xl">
      <p className="text-slate-300 font-medium">{label}</p>
      <p className="text-cyan-400 font-bold">{payload[0]!.value.toFixed(3)} kWh</p>
    </div>
  )
}

export default function DailyChart({ summaries, average }: Props) {
  const max = Math.max(...summaries.map(d => d.total))

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <h2 className="text-slate-200 font-semibold mb-4">Daily Consumption</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={summaries} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            unit=" kWh"
            width={68}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
          <ReferenceLine
            y={average}
            stroke="#f59e0b"
            strokeDasharray="4 4"
            label={{ value: 'avg', fill: '#f59e0b', fontSize: 11, position: 'right' }}
          />
          <Bar dataKey="total" radius={[4, 4, 0, 0]}>
            {summaries.map((d, i) => (
              <Cell
                key={i}
                fill={d.total === max ? '#f59e0b' : '#0ea5e9'}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-slate-500 text-xs mt-2">
        Peak day highlighted in amber · dashed line = daily average
      </p>
    </div>
  )
}
