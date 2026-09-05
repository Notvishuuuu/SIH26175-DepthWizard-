import { Satellite, Radio } from 'lucide-react'

const NAV_ITEMS = ['Overview', 'Terrain', 'Analysis', 'Dataset']

export default function Header({ activeTab, onTabChange, hasDataset, engineOnline }) {
  return (
    <header className="relative z-30 flex items-center justify-between gap-6 border-b hairline px-6 py-3 glass-panel">
      <div className="flex items-center gap-3">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-700 to-indigo-600 shadow-glow">
          <Satellite size={18} strokeWidth={1.8} className="text-cyan-300" />
        </div>
        <div className="leading-tight">
          <div className="font-display text-[15px] font-semibold tracking-wide text-white">
            DepthWizard
          </div>
          <div className="text-[10px] font-medium tracking-[0.18em] text-violet-300/70">
            MONOCULAR TERRAIN INTELLIGENCE
          </div>
        </div>
      </div>

      <nav className="hidden items-center gap-1 rounded-full border hairline bg-black/20 p-1 md:flex">
        {NAV_ITEMS.map((item) => {
          const key = item.toLowerCase()
          const isDisabled = key !== 'overview' && key !== 'dataset' && !hasDataset
          const isActive = activeTab === key
          return (
            <button
              key={key}
              disabled={isDisabled}
              onClick={() => onTabChange(key)}
              className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                isActive
                  ? 'bg-violet-500/25 text-white shadow-[inset_0_0_0_1px_rgba(157,99,240,0.4)]'
                  : isDisabled
                    ? 'cursor-not-allowed text-white/25'
                    : 'text-violet-200/70 hover:text-white'
              }`}
            >
              {item}
            </button>
          )
        })}
      </nav>

      <div className="flex items-center gap-3 text-[11px] text-violet-200/70">
        <div className="hidden items-center gap-1.5 sm:flex">
          <Radio size={12} className={engineOnline ? 'text-cyan-300' : 'text-white/30'} />
          <span className="tracking-wide">3D ENGINE {engineOnline ? 'ONLINE' : 'STANDBY'}</span>
        </div>
        <span className={`h-1.5 w-1.5 rounded-full ${engineOnline ? 'bg-cyan-300 animate-pulse-soft' : 'bg-white/20'}`} />
      </div>
    </header>
  )
}
