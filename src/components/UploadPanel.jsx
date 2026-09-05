import { useCallback, useRef, useState } from 'react'
import { UploadCloud, Image as ImageIcon, Mountain, Sparkles, AlertTriangle, X } from 'lucide-react'

function DropZone({ label, hint, file, icon: Icon, onFile, accept }) {
  const inputRef = useRef(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setIsDragOver(false)
      const f = e.dataTransfer.files?.[0]
      if (f) onFile(f)
    },
    [onFile]
  )

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') inputRef.current?.click() }}
      aria-label={`Upload ${label}`}
      className={`group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-7 text-center transition-colors ${
        isDragOver
          ? 'border-cyan-300/60 bg-cyan-400/[0.04]'
          : file
            ? 'border-violet-400/40 bg-violet-500/[0.05]'
            : 'border-violet-400/20 bg-white/[0.015] hover:border-violet-400/40 hover:bg-white/[0.03]'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
        }}
      />
      <Icon size={20} className={file ? 'text-cyan-300' : 'text-violet-300/50'} />
      <div className="text-[13px] font-medium text-violet-100">{label}</div>
      {file ? (
        <div className="max-w-full truncate text-[11px] text-cyan-300/80">{file.name}</div>
      ) : (
        <div className="text-[11px] text-violet-300/45">{hint}</div>
      )}
    </div>
  )
}

export default function UploadPanel({ onLoadFiles, onLoadDemo, isLoading, error, onDismissError }) {
  const [imageFile, setImageFile] = useState(null)
  const [heightmapFile, setHeightmapFile] = useState(null)
  const [heightType, setHeightType] = useState('relative')

  const canLoad = imageFile && heightmapFile && !isLoading

  return (
    <div className="glass-panel flex w-full max-w-xl flex-col gap-5 rounded-2xl border hairline p-6 shadow-glow">
      <div>
        <div className="text-[11px] font-medium tracking-[0.16em] text-violet-300/60">
          LOAD TERRAIN DATA
        </div>
        <p className="mt-1 text-[13px] text-violet-200/50">
          Upload the source RGB image and its matching depth or elevation map.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-400/25 bg-red-500/[0.08] px-3 py-2.5 text-[12.5px] text-red-200">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={onDismissError} aria-label="Dismiss error">
            <X size={14} className="text-red-300/70 hover:text-red-100" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <DropZone
          label="RGB Image"
          hint="PNG, JPG, TIFF"
          file={imageFile}
          icon={ImageIcon}
          accept="image/*,.tif,.tiff"
          onFile={setImageFile}
        />
        <DropZone
          label="Depth / Heightmap"
          hint="PNG, JPG, or .npy"
          file={heightmapFile}
          icon={Mountain}
          accept="image/*,.npy"
          onFile={setHeightmapFile}
        />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[11px] tracking-wide text-violet-300/55">DATA TYPE</span>
        <div className="flex rounded-full border hairline bg-black/20 p-0.5">
          {['relative', 'absolute'].map((t) => (
            <button
              key={t}
              onClick={() => setHeightType(t)}
              className={`rounded-full px-3 py-1 text-[11.5px] font-medium capitalize transition-colors ${
                heightType === t ? 'bg-violet-500/25 text-white' : 'text-violet-300/50 hover:text-violet-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <button
        disabled={!canLoad}
        onClick={() => onLoadFiles({ imageFile, heightmapFile, heightType })}
        className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium transition-all ${
          canLoad
            ? 'bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-glow hover:scale-[1.01]'
            : 'cursor-not-allowed bg-white/[0.04] text-violet-300/30'
        }`}
      >
        <UploadCloud size={15} />
        Generate Terrain
      </button>

      <div className="flex items-center gap-3 text-[11px] text-violet-400/35">
        <div className="h-px flex-1 bg-violet-400/15" />
        or
        <div className="h-px flex-1 bg-violet-400/15" />
      </div>

      <button
        onClick={onLoadDemo}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 rounded-lg border hairline bg-white/[0.02] px-4 py-2.5 text-[13px] font-medium text-violet-100 transition-colors hover:bg-white/[0.05]"
      >
        <Sparkles size={15} className="text-cyan-300" />
        Load Demo Terrain
      </button>
    </div>
  )
}
