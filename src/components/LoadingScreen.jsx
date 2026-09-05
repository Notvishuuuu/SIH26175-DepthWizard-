import { motion } from 'framer-motion'

export default function LoadingScreen({ progress, stageLabel, stages, activeStageIndex }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-2"
      >
        <div className="text-[11px] font-medium tracking-[0.2em] text-cyan-300/80">
          INITIALIZING TERRAIN ENGINE
        </div>
        <div className="font-display text-2xl font-semibold text-white">{stageLabel}</div>
      </motion.div>

      <div className="w-full max-w-md">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-400 to-cyan-300"
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut', duration: 0.35 }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] tabular text-violet-300/60">
          <span>{Math.round(progress)}%</span>
          <span>PROCESSING</span>
        </div>
      </div>

      <ul className="w-full max-w-md space-y-1.5">
        {stages.map((stage, i) => (
          <li
            key={stage}
            className={`flex items-center gap-2.5 text-[13px] transition-colors ${
              i < activeStageIndex
                ? 'text-violet-300/50'
                : i === activeStageIndex
                  ? 'text-white'
                  : 'text-violet-400/25'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                i < activeStageIndex
                  ? 'bg-violet-400/60'
                  : i === activeStageIndex
                    ? 'bg-cyan-300 animate-pulse-soft'
                    : 'bg-violet-500/20'
              }`}
            />
            {stage}
          </li>
        ))}
      </ul>
    </div>
  )
}
