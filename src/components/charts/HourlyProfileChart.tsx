import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import type { HourlyProfile } from '../../types'

interface Props {
  profile: HourlyProfile[]
  peakHour: number
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
      <p className="text-violet-400 font-bold">{payload[0]!.value.toFixed(3)} kWh avg/hr</p>
    </div>
  )
}

export default function HourlyProfileChart({ profile, peakHour }: Props) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <h2 className="text-slate-200 font-semibold mb-4">Average Hourly Profile</h2>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={profile} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
            interval={2}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            unit=" kWh"
            width={68}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
          <Bar dataKey="avgKwh" radius={[3, 3, 0, 0]}>
            {profile.map((h, i) => (
              <Cell
                key={i}
                fill={h.hour === peakHour ? '#a78bfa' : '#7c3aed'}
                fillOpacity={h.hour === peakHour ? 1 : 0.65}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-slate-500 text-xs mt-2">
        Peak hour highlighted in light violet · averaged across all days
      </p>
    </div>
  )
}
