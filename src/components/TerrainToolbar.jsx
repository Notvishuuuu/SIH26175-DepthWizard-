import {
  Orbit,
  Plane,
  RotateCcw,
  Camera,
  Maximize,
  Grid3x3,
  Tag,
  RefreshCw,
  CloudFog
} from 'lucide-react'

function ToggleIcon({ active, onClick, icon: Icon, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-pressed={active}
      aria-label={title}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
        active ? 'bg-violet-500/25 text-cyan-300' : 'text-violet-300/50 hover:bg-white/[0.05] hover:text-violet-100'
      }`}
    >
      <Icon size={15} />
    </button>
  )
}

export default function TerrainToolbar({
  cameraMode,
  onCameraModeChange,
  onReset,
  onScreenshot,
  onFullscreen,
  showGrid,
  onToggleGrid,
  showLabels,
  onToggleLabels,
  autoRotate,
  onToggleAutoRotate,
  fogEnabled,
  onToggleFog,
  verticalExaggeration,
  onVerticalExaggerationChange,
  meshResolution,
  onMeshResolutionChange
}) {
  return (
    <div className="glass-panel flex flex-wrap items-center gap-4 border-t hairline px-4 py-2.5">
      <div className="flex items-center gap-1 rounded-full border hairline bg-black/20 p-0.5">
        <button
          onClick={() => onCameraModeChange('orbit')}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
            cameraMode === 'orbit' ? 'bg-violet-500/25 text-white' : 'text-violet-300/55 hover:text-violet-100'
          }`}
        >
          <Orbit size={13} /> Orbit
        </button>
        <button
          onClick={() => onCameraModeChange('fly')}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
            cameraMode === 'fly' ? 'bg-violet-500/25 text-white' : 'text-violet-300/55 hover:text-violet-100'
          }`}
        >
          <Plane size={13} /> Fly
        </button>
      </div>

      <div className="h-5 w-px bg-violet-400/15" />

      <div className="flex items-center gap-0.5">
        <ToggleIcon active={showGrid} onClick={onToggleGrid} icon={Grid3x3} title="Toggle grid" />
        <ToggleIcon active={showLabels} onClick={onToggleLabels} icon={Tag} title="Toggle labels" />
        <ToggleIcon active={autoRotate} onClick={onToggleAutoRotate} icon={RefreshCw} title="Auto rotate" />
        <ToggleIcon active={fogEnabled} onClick={onToggleFog} icon={CloudFog} title="Toggle fog" />
      </div>

      <div className="h-5 w-px bg-violet-400/15" />

      <div className="flex items-center gap-2">
        <span className="text-[11px] text-violet-300/50">Exaggeration</span>
        <input
          type="range"
          min={0.5}
          max={10}
          step={0.5}
          value={verticalExaggeration}
          onChange={(e) => onVerticalExaggerationChange(Number(e.target.value))}
          className="h-1 w-24 cursor-pointer accent-violet-400"
        />
        <span className="tabular w-8 text-[11px] text-white">{verticalExaggeration}x</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] text-violet-300/50">Resolution</span>
        <select
          value={meshResolution}
          onChange={(e) => onMeshResolutionChange(e.target.value)}
          className="rounded-md border hairline bg-black/30 px-2 py-1 text-[11px] text-white outline-none"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="ml-auto flex items-center gap-0.5">
        <ToggleIcon active={false} onClick={onReset} icon={RotateCcw} title="Reset camera" />
        <ToggleIcon active={false} onClick={onScreenshot} icon={Camera} title="Screenshot" />
        <ToggleIcon active={false} onClick={onFullscreen} icon={Maximize} title="Fullscreen" />
      </div>
    </div>
  )
}
