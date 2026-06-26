import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Cell,
} from 'recharts'
import type { WeekdayProfile } from '../../types'

interface Props {
  profile: WeekdayProfile[]
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
      <p className="text-green-400 font-bold">{payload[0]!.value.toFixed(2)} kWh avg</p>
    </div>
  )
}

export default function WeekdayChart({ profile }: Props) {
  const ordered = [...profile].sort((a, b) => a.dayIndex - b.dayIndex)
  const max = Math.max(...ordered.map(d => d.avgDaily))

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <h2 className="text-slate-200 font-semibold mb-4">Average by Day of Week</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={ordered} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="day"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            unit=" kWh"
            width={68}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
          <Bar dataKey="avgDaily" radius={[4, 4, 0, 0]}>
            {ordered.map((d, i) => (
              <Cell
                key={i}
                fill={d.avgDaily === max ? '#f59e0b' : '#22c55e'}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-slate-500 text-xs mt-2">
        Average daily kWh per weekday · peak day highlighted in amber
      </p>
    </div>
  )
}
