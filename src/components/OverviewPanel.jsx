import { Layers, Compass, Ruler, FolderUp, Sparkles, ArrowRight } from 'lucide-react'
import StatisticsPanel from './StatisticsPanel.jsx'
import { isGeoreferenced } from '../utils/coordinateUtils.js'

function MetaRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between border-b hairline py-2 last:border-0">
      <div className="flex items-center gap-2 text-[11px] tracking-wide text-violet-300/55">
        <Icon size={13} />
        {label}
      </div>
      <span className="text-[13px] font-medium text-white">{value}</span>
    </div>
  )
}

export default function OverviewPanel({ dataset, onGoToTerrain, onGoToAnalysis, onOpenDataset, onLoadDemo }) {
  const meta = dataset.metadata || {}
  const georeferenced = isGeoreferenced(meta)

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-5 overflow-y-auto p-6">
      <div className="glass-panel rounded-2xl border hairline p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-medium tracking-[0.16em] text-violet-300/60">
              DATASET OVERVIEW
            </div>
            <h1 className="mt-1 font-display text-[20px] font-semibold text-white">
              {meta.sourceName || 'Untitled Terrain Dataset'}
            </h1>
            <p className="mt-1 max-w-md text-[12.5px] text-violet-200/50">
              {dataset.heightType === 'absolute'
                ? 'Calibrated elevation data — real-world measurements in meters.'
                : 'Relative depth data — no DEM calibration applied yet.'}
            </p>
          </div>

          {dataset.imageUrl && (
            <img
              src={dataset.imageUrl}
              alt="Terrain RGB preview"
              className="h-20 w-32 shrink-0 rounded-lg border hairline object-cover"
            />
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          <MetaRow icon={Layers} label="MODEL" value={meta.model || '—'} />
          <MetaRow icon={Ruler} label="RESOLUTION" value={`${dataset.width} × ${dataset.height}`} />
          <MetaRow icon={Compass} label="GEOREFERENCED" value={georeferenced ? 'Yes' : 'No'} />
          <MetaRow icon={Layers} label="HEIGHT TYPE" value={dataset.heightType === 'absolute' ? 'Absolute' : 'Relative'} />
        </div>
      </div>

      <StatisticsPanel dataset={dataset} />

      <div className="glass-panel flex flex-wrap items-center gap-3 rounded-2xl border hairline p-4">
        <button
          onClick={onGoToTerrain}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-500 px-4 py-2.5 text-[13px] font-medium text-white shadow-glow transition-all hover:scale-[1.01]"
        >
          Open Terrain Viewer
          <ArrowRight size={14} />
        </button>
        <button
          onClick={onGoToAnalysis}
          className="flex items-center gap-2 rounded-lg border hairline bg-white/[0.02] px-4 py-2.5 text-[13px] font-medium text-violet-100 transition-colors hover:bg-white/[0.05]"
        >
          Inspect Terrain Data
        </button>
        <button
          onClick={onOpenDataset}
          className="flex items-center gap-2 rounded-lg border hairline bg-white/[0.02] px-4 py-2.5 text-[13px] font-medium text-violet-100 transition-colors hover:bg-white/[0.05]"
        >
          <FolderUp size={14} />
          Load Different Dataset
        </button>
        <button
          onClick={onLoadDemo}
          className="flex items-center gap-2 rounded-lg border hairline bg-white/[0.02] px-4 py-2.5 text-[13px] font-medium text-violet-100 transition-colors hover:bg-white/[0.05]"
        >
          <Sparkles size={14} className="text-cyan-300" />
          Reload Demo
        </button>
      </div>
    </div>
  )
}
