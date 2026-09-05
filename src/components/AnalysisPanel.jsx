import { Crosshair, MapPin } from 'lucide-react'

function Row({ label, value, unit }) {
  return (
    <div className="flex items-baseline justify-between border-b hairline py-1.5 last:border-0">
      <span className="text-[11px] tracking-wide text-violet-300/55">{label}</span>
      <span className="tabular text-[13px] font-medium text-white">
        {value}
        {unit && <span className="ml-0.5 text-[10px] text-violet-300/50">{unit}</span>}
      </span>
    </div>
  )
}

export default function AnalysisPanel({ hoverInfo, isGeoreferenced, latLon }) {
  return (
    <div className="glass-panel flex flex-col rounded-xl border hairline p-4">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-medium tracking-[0.14em] text-violet-300/60">
        <Crosshair size={13} />
        TERRAIN INSPECTOR
      </div>

      {!hoverInfo ? (
        <p className="py-4 text-center text-[12px] text-violet-300/35">
          Hover over the terrain to inspect elevation and slope.
        </p>
      ) : (
        <div>
          {hoverInfo.isAbsolute ? (
            <Row label="ELEVATION" value={hoverInfo.elevation.toFixed(1)} unit="m" />
          ) : (
            <Row label="RELATIVE HEIGHT" value={hoverInfo.normalizedHeight.toFixed(2)} />
          )}
          <Row label="SLOPE" value={hoverInfo.slope.toFixed(1)} unit="°" />
          <Row label="PIXEL X" value={hoverInfo.pixelX} />
          <Row label="PIXEL Y" value={hoverInfo.pixelY} />

          {isGeoreferenced && latLon ? (
            <>
              <Row label="LAT" value={latLon.lat.toFixed(4)} unit="°" />
              <Row label="LON" value={latLon.lon.toFixed(4)} unit="°" />
            </>
          ) : (
            <div className="mt-2 flex items-center gap-1.5 text-[10.5px] text-violet-300/35">
              <MapPin size={11} />
              No georeference — showing relative coordinates.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
