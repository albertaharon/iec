interface Props {
  label: string
  value: string
  sub?: string
  accent?: 'cyan' | 'amber' | 'green' | 'rose' | 'violet'
  icon?: string
}

const accentMap = {
  cyan:   { border: 'border-cyan-800',   text: 'text-cyan-400',   bg: 'bg-cyan-950/40' },
  amber:  { border: 'border-amber-800',  text: 'text-amber-400',  bg: 'bg-amber-950/40' },
  green:  { border: 'border-green-800',  text: 'text-green-400',  bg: 'bg-green-950/40' },
  rose:   { border: 'border-rose-800',   text: 'text-rose-400',   bg: 'bg-rose-950/40' },
  violet: { border: 'border-violet-800', text: 'text-violet-400', bg: 'bg-violet-950/40' },
}

export default function StatCard({ label, value, sub, accent = 'cyan', icon }: Props) {
  const { border, text, bg } = accentMap[accent]
  return (
    <div className={`rounded-2xl border ${border} ${bg} p-5 flex flex-col gap-1`}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-xl">{icon}</span>}
        <span className="text-slate-400 text-sm font-medium">{label}</span>
      </div>
      <p className={`text-3xl font-bold ${text}`}>{value}</p>
      {sub && <p className="text-slate-500 text-xs">{sub}</p>}
    </div>
  )
}
