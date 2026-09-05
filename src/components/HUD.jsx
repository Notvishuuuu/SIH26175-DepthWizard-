export default function HUD({ dataset, geometryStats, fps, cameraPos, engineOnline }) {
  if (!dataset) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-10 select-none">
      {/* Top left */}
      <div className="absolute left-4 top-4 rounded-lg border hairline bg-black/25 px-3 py-2 backdrop-blur-xs">
        <div className="text-[10px] tracking-[0.14em] text-violet-300/60">TERRAIN RECONSTRUCTION</div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-white">
          <span className={`h-1.5 w-1.5 rounded-full ${engineOnline ? 'bg-cyan-300 animate-pulse-soft' : 'bg-white/30'}`} />
          STATUS: {engineOnline ? 'ONLINE' : 'IDLE'}
        </div>
      </div>

      {/* Top right */}
      <div className="absolute right-4 top-4 rounded-lg border hairline bg-black/25 px-3 py-2 text-right backdrop-blur-xs">
        <div className="text-[10px] tracking-[0.14em] text-violet-300/60">RESOLUTION</div>
        <div className="tabular text-[11px] font-medium text-white">
          {dataset.width} × {dataset.height}
        </div>
        <div className="mt-1 text-[10px] tracking-[0.14em] text-violet-300/60">MODEL</div>
        <div className="text-[11px] font-medium text-white">
          {dataset.metadata?.model?.split(' (')[0] || 'Depth Anything V2'}
        </div>
        <div className="mt-1 text-[10px] tracking-[0.14em] text-violet-300/60">DATA</div>
        <div className="text-[11px] font-medium uppercase text-white">{dataset.heightType}</div>
      </div>

      {/* Bottom left */}
      <div className="absolute bottom-4 left-4 rounded-lg border hairline bg-black/25 px-3 py-2 backdrop-blur-xs">
        <div className="grid grid-cols-3 gap-x-4 gap-y-0.5 text-[11px] tabular">
          <div className="text-violet-300/50">X</div>
          <div className="col-span-2 text-white">{cameraPos.x.toFixed(1)}</div>
          <div className="text-violet-300/50">Y</div>
          <div className="col-span-2 text-white">{cameraPos.y.toFixed(1)}</div>
          <div className="text-violet-300/50">Z</div>
          <div className="col-span-2 text-white">{cameraPos.z.toFixed(1)}</div>
        </div>
      </div>

      {/* Bottom right */}
      <div className="absolute bottom-4 right-4 rounded-lg border hairline bg-black/25 px-3 py-2 text-right backdrop-blur-xs">
        <div className="flex gap-3 text-[11px] tabular">
          <div>
            <div className="text-[9px] text-violet-300/50">FPS</div>
            <div className="font-medium text-cyan-300">{fps}</div>
          </div>
          <div>
            <div className="text-[9px] text-violet-300/50">TRIS</div>
            <div className="font-medium text-white">{geometryStats?.triCount?.toLocaleString() ?? '—'}</div>
          </div>
          <div>
            <div className="text-[9px] text-violet-300/50">VERTS</div>
            <div className="font-medium text-white">{geometryStats?.vertexCount?.toLocaleString() ?? '—'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
