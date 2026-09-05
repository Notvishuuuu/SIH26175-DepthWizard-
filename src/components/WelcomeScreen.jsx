import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, UploadCloud, Orbit } from 'lucide-react'

function useStarField(count) {
  return useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.6 + 0.4,
      delay: Math.random() * 3,
      duration: Math.random() * 3 + 2
    }))
  }, [count])
}

export default function WelcomeScreen({ onLaunch, onLoadDataset }) {
  const stars = useStarField(140)

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Starfield */}
      <div className="pointer-events-none absolute inset-0">
        {stars.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white animate-pulse-soft"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              opacity: 0.5,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`
            }}
          />
        ))}
      </div>

      {/* Orbital glow element */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative h-[560px] w-[560px]">
          <div className="absolute inset-0 rounded-full bg-violet-600/10 blur-3xl" />
          <div className="absolute inset-16 rounded-full border hairline animate-spin-slow" />
          <div className="absolute inset-32 rounded-full border border-cyan-400/10" />
          <div
            className="absolute inset-0 animate-spin-slow"
            style={{ animationDuration: '26s' }}
          >
            <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan-300 shadow-glow-cyan" />
          </div>
          <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-violet-500/40 via-indigo-500/25 to-transparent blur-2xl" />
        </div>
      </div>

      {/* Foreground content */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-6 text-center"
      >
        <div className="mb-6 flex items-center gap-2 rounded-full border hairline bg-black/30 px-3.5 py-1.5 text-[11px] tracking-wide text-violet-200/80">
          <Orbit size={12} className="text-cyan-300" />
          Single-view terrain reconstruction
        </div>

        <h1 className="font-display text-5xl font-semibold tracking-tight text-white text-glow sm:text-6xl">
          DepthWizard
        </h1>

        <p className="mt-4 text-lg text-violet-100/80">
          From a single image to a navigable world.
        </p>

        <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-violet-200/55">
          Transform optical imagery and calibrated elevation data into an interactive
          3D terrain environment — built for rapid geospatial reconstruction and analysis.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <button
            onClick={onLaunch}
            className="group flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-500 px-6 py-3 text-sm font-medium text-white shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.99]"
          >
            Launch Terrain Viewer
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            onClick={onLoadDataset}
            className="flex items-center gap-2 rounded-lg border hairline bg-white/[0.03] px-6 py-3 text-sm font-medium text-violet-100 transition-colors hover:bg-white/[0.06]"
          >
            <UploadCloud size={16} />
            Load Dataset
          </button>
        </div>
      </motion.div>
    </div>
  )
}
