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
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700
                    rounded-xl px-4 py-2 text-sm shadow-xl">
      <p className="text-gray-600 dark:text-slate-300 font-medium">{label}</p>
      <p className="text-green-600 dark:text-green-400 font-bold">{payload[0]!.value.toFixed(2)} kWh ממוצע</p>
    </div>
  )
}

export default function WeekdayChart({ profile }: Props) {
  const ordered = [...profile].sort((a, b) => a.dayIndex - b.dayIndex)
  const max = Math.max(...ordered.map(d => d.avgDaily))

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5">
      <h2 className="text-gray-900 dark:text-slate-200 font-semibold mb-4">ממוצע לפי יום בשבוע</h2>
      {/* Charts always render LTR */}
      <div dir="ltr">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={ordered} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis
              dataKey="day"
              tick={{ fill: 'var(--chart-axis)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--chart-axis-line)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              unit=" kWh"
              width={68}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--chart-cursor)' }} />
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
      </div>
      <p className="text-gray-400 dark:text-slate-500 text-xs mt-2">
        ממוצע יומי kWh לפי יום · יום השיא מסומן בכתום
      </p>
    </div>
  )
}
