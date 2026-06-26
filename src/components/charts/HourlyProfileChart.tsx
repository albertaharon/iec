import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import type { HourlyProfile } from '../../types'
import { heatColor } from '../../lib/colors'

interface Props {
  profile: HourlyProfile[]
  isDark: boolean
}

const makeTooltip = (isDark: boolean) =>
  ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700
                      rounded-xl px-4 py-2 text-sm shadow-xl">
        <p className="text-gray-600 dark:text-slate-300 font-medium">{label}</p>
        <p className="font-bold" style={{ color: heatColor(payload[0]!.value, payload[0]!.value, isDark) }}>
          {payload[0]!.value.toFixed(3)} kWh ממוצע
        </p>
      </div>
    )
  }

export default function HourlyProfileChart({ profile, isDark }: Props) {
  const maxAvg = Math.max(...profile.map(h => h.avgKwh))

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5">
      <h2 className="text-gray-900 dark:text-slate-200 font-semibold mb-4">פרופיל שעתי ממוצע</h2>
      {/* Charts always render LTR */}
      <div dir="ltr">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={profile} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--chart-axis)', fontSize: 10 }}
              axisLine={{ stroke: 'var(--chart-axis-line)' }}
              tickLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              unit=" kWh"
              width={68}
            />
            <Tooltip content={makeTooltip(isDark)} cursor={{ fill: 'var(--chart-cursor)' }} />
            <Bar dataKey="avgKwh" radius={[3, 3, 0, 0]}>
              {profile.map((h, i) => (
                <Cell
                  key={i}
                  fill={heatColor(h.avgKwh, maxAvg, isDark)}
                  fillOpacity={0.9}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-gray-400 dark:text-slate-500 text-xs mt-2">
        צבע הפס לפי עוצמת הצריכה · ממוצע על פני כל הימים
      </p>
    </div>
  )
}
