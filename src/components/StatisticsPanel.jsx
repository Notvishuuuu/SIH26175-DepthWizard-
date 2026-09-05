import { useMemo } from 'react'
import { BarChart3 } from 'lucide-react'
import { computeElevationStatistics } from '../utils/statistics.js'

function StatCell({ label, value, unit }) {
  return (
    <div className="rounded-lg border hairline bg-white/[0.015] px-3 py-2">
      <div className="text-[9.5px] tracking-[0.12em] text-violet-300/50">{label}</div>
      <div className="tabular mt-0.5 text-[15px] font-semibold text-white">
        {value}
        {unit && <span className="ml-0.5 text-[10px] font-normal text-violet-300/50">{unit}</span>}
      </div>
    </div>
  )
}

export default function StatisticsPanel({ dataset }) {
  const stats = useMemo(
    () => computeElevationStatistics(dataset.heights, dataset.heightType),
    [dataset]
  )

  const prefix = stats.isAbsolute ? '' : 'Relative '
  const fmt = (v) => (stats.isAbsolute ? v.toFixed(1) : v.toFixed(2))

  return (
    <div className="glass-panel rounded-xl border hairline p-4">
      <div className="mb-3 flex items-center gap-2 text-[11px] font-medium tracking-[0.14em] text-violet-300/60">
        <BarChart3 size={13} />
        ELEVATION STATISTICS
      </div>
      <div className="grid grid-cols-2 gap-2">
        <StatCell label={`${prefix}MIN`.toUpperCase()} value={fmt(stats.min)} unit={stats.unit} />
        <StatCell label={`${prefix}MAX`.toUpperCase()} value={fmt(stats.max)} unit={stats.unit} />
        <StatCell label={`${prefix}MEAN`.toUpperCase()} value={fmt(stats.mean)} unit={stats.unit} />
        <StatCell label="RELIEF" value={fmt(stats.relief)} unit={stats.unit} />
      </div>
    </div>
  )
}
