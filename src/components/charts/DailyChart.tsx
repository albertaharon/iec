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
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700
                    rounded-xl px-4 py-2 text-sm shadow-xl">
      <p className="text-gray-600 dark:text-slate-300 font-medium">{label}</p>
      <p className="text-cyan-500 dark:text-cyan-400 font-bold">{payload[0]!.value.toFixed(3)} kWh</p>
    </div>
  )
}

export default function DailyChart({ summaries, average }: Props) {
  const max = Math.max(...summaries.map(d => d.total))

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5">
      <h2 className="text-gray-900 dark:text-slate-200 font-semibold mb-4">צריכה יומית</h2>
      {/* Charts always render LTR */}
      <div dir="ltr">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={summaries} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
              axisLine={{ stroke: 'var(--chart-axis-line)' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              unit=" kWh"
              width={68}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--chart-cursor)' }} />
            <ReferenceLine
              y={average}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              label={{ value: 'ממוצע', fill: '#f59e0b', fontSize: 11, position: 'right' }}
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
      </div>
      <p className="text-gray-400 dark:text-slate-500 text-xs mt-2">
        יום השיא מסומן בכתום · קו מקווקו = ממוצע יומי
      </p>
    </div>
  )
}
