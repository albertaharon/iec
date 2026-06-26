import type { DailySummary } from '../types'

interface Props {
  days: DailySummary[]
}

function fmtDate(iso: string) {
  const [yyyy, mm, dd] = iso.split('-')
  return `${dd}/${mm}/${yyyy}`
}

export default function PeakDaysTable({ days }: Props) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5">
      <h2 className="text-gray-900 dark:text-slate-200 font-semibold mb-4">ימי שיא מובילים</h2>
      {/* Table is LTR for numeric alignment clarity */}
      <div className="overflow-x-auto" dir="ltr">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 dark:text-slate-500 text-xs uppercase tracking-wide
                           border-b border-gray-100 dark:border-slate-800">
              <th className="text-left pb-2 pr-4">#</th>
              <th className="text-left pb-2 pr-4">תאריך</th>
              <th className="text-left pb-2 pr-4">יום</th>
              <th className="text-right pb-2 pr-4">סה"כ kWh</th>
              <th className="text-right pb-2 pr-4">שיא 15 דק'</th>
              <th className="text-right pb-2">שעת שיא</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d, i) => (
              <tr
                key={d.date}
                className="border-b border-gray-50 dark:border-slate-800/50
                           hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="py-2 pr-4">
                  {i === 0 ? (
                    <span className="text-amber-400 font-bold">🥇</span>
                  ) : i === 1 ? (
                    <span className="text-slate-400">🥈</span>
                  ) : i === 2 ? (
                    <span className="text-amber-700">🥉</span>
                  ) : (
                    <span className="text-gray-400 dark:text-slate-600">{i + 1}</span>
                  )}
                </td>
                <td className="py-2 pr-4 text-gray-800 dark:text-slate-200 font-medium">
                  {fmtDate(d.date)}
                </td>
                <td className="py-2 pr-4 text-gray-500 dark:text-slate-400">{d.weekday}</td>
                <td className="py-2 pr-4 text-right">
                  <span className={`font-semibold ${i === 0 ? 'text-amber-500 dark:text-amber-400' : 'text-cyan-600 dark:text-cyan-400'}`}>
                    {d.total.toFixed(3)}
                  </span>
                </td>
                <td className="py-2 pr-4 text-right text-gray-600 dark:text-slate-300">{d.peak15min.toFixed(3)}</td>
                <td className="py-2 text-right text-gray-400 dark:text-slate-400">{d.peakTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
