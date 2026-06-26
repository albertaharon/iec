import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
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
  // Reorder from Sun to Sat (Sunday first for Israeli context)
  const ordered = [...profile].sort((a, b) => a.dayIndex - b.dayIndex)

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <h2 className="text-slate-200 font-semibold mb-4">Average by Day of Week</h2>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={ordered} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis
            dataKey="day"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={30}
            tick={{ fill: '#64748b', fontSize: 10 }}
            tickCount={4}
          />
          <Radar
            dataKey="avgDaily"
            stroke="#22c55e"
            fill="#22c55e"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
      <p className="text-slate-500 text-xs mt-2">
        Average daily kWh per weekday · only meaningful with multiple weeks of data
      </p>
    </div>
  )
}
