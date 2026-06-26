import type { DailySummary } from '../types'

interface Props {
  days: DailySummary[]
}

export default function PeakDaysTable({ days }: Props) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <h2 className="text-slate-200 font-semibold mb-4">Top Peak Days</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 text-xs uppercase tracking-wide border-b border-slate-800">
              <th className="text-left pb-2 pr-4">#</th>
              <th className="text-left pb-2 pr-4">Date</th>
              <th className="text-left pb-2 pr-4">Day</th>
              <th className="text-right pb-2 pr-4">Total kWh</th>
              <th className="text-right pb-2 pr-4">Peak 15-min</th>
              <th className="text-right pb-2">Peak Time</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d, i) => (
              <tr
                key={d.date}
                className="border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors"
              >
                <td className="py-2 pr-4">
                  {i === 0 ? (
                    <span className="text-amber-400 font-bold">🥇</span>
                  ) : i === 1 ? (
                    <span className="text-slate-400">🥈</span>
                  ) : i === 2 ? (
                    <span className="text-amber-700">🥉</span>
                  ) : (
                    <span className="text-slate-600">{i + 1}</span>
                  )}
                </td>
                <td className="py-2 pr-4 text-slate-200 font-medium">{d.label}</td>
                <td className="py-2 pr-4 text-slate-400">{d.weekday}</td>
                <td className="py-2 pr-4 text-right">
                  <span className={`font-semibold ${i === 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
                    {d.total.toFixed(3)}
                  </span>
                </td>
                <td className="py-2 pr-4 text-right text-slate-300">{d.peak15min.toFixed(3)}</td>
                <td className="py-2 text-right text-slate-400">{d.peakTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
