import { Image as ImageIcon, Mountain, Activity, Grid3x3, FolderUp, Sparkles } from 'lucide-react'

const MODES = [
  { id: 'rgb', label: 'RGB', icon: ImageIcon },
  { id: 'elevation', label: 'Elevation', icon: Mountain },
  { id: 'slope', label: 'Slope', icon: Activity },
  { id: 'wireframe', label: 'Wireframe', icon: Grid3x3 }
]

export default function Sidebar({ viewMode, onViewModeChange, onOpenDataset, onLoadDemo }) {
  return (
    <aside className="glass-panel flex w-[168px] shrink-0 flex-col gap-5 border-r hairline p-3.5">
      <div>
        <div className="mb-2 px-1 text-[10px] font-medium tracking-[0.14em] text-violet-300/45">
          TOOLS
        </div>
        <button
          onClick={onOpenDataset}
          className="flex w-full items-center gap-2 rounded-lg border hairline bg-white/[0.02] px-2.5 py-2 text-[12.5px] text-violet-100 transition-colors hover:bg-white/[0.05]"
        >
          <FolderUp size={14} />
          Upload
        </button>
        <button
          onClick={onLoadDemo}
          className="mt-1.5 flex w-full items-center gap-2 rounded-lg border hairline bg-white/[0.02] px-2.5 py-2 text-[12.5px] text-violet-100 transition-colors hover:bg-white/[0.05]"
        >
          <Sparkles size={14} className="text-cyan-300" />
          Demo
        </button>
      </div>

      <div>
        <div className="mb-2 px-1 text-[10px] font-medium tracking-[0.14em] text-violet-300/45">
          MODES
        </div>
        <div className="flex flex-col gap-1">
          {MODES.map((m) => {
            const Icon = m.icon
            const isActive = viewMode === m.id
            return (
              <button
                key={m.id}
                onClick={() => onViewModeChange(m.id)}
                aria-pressed={isActive}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12.5px] font-medium transition-colors ${
                  isActive
                    ? 'bg-violet-500/20 text-white shadow-[inset_0_0_0_1px_rgba(157,99,240,0.35)]'
                    : 'text-violet-200/60 hover:bg-white/[0.03] hover:text-violet-100'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-cyan-300' : ''} />
                {m.label}
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
