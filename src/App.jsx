import { useCallback, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import Header from './components/Header.jsx'
import WelcomeScreen from './components/WelcomeScreen.jsx'
import LoadingScreen from './components/LoadingScreen.jsx'
import UploadPanel from './components/UploadPanel.jsx'
import Sidebar from './components/Sidebar.jsx'
import TerrainViewer from './components/TerrainViewer.jsx'
import TerrainToolbar from './components/TerrainToolbar.jsx'
import AnalysisPanel from './components/AnalysisPanel.jsx'
import StatisticsPanel from './components/StatisticsPanel.jsx'
import OverviewPanel from './components/OverviewPanel.jsx'

import { terrainDataLoader, loadDemoDataset, DatasetError } from './services/api.js'
import { isGeoreferenced, pixelToLatLon } from './utils/coordinateUtils.js'

const LOADING_STAGES = [
  'Loading RGB texture',
  'Loading heightmap',
  'Generating mesh',
  'Applying elevation',
  'Initializing navigation'
]

export default function App() {
  const [screen, setScreen] = useState('welcome') // welcome | loading | app
  const [dataset, setDataset] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingStageIndex, setLoadingStageIndex] = useState(0)

  const [activeTab, setActiveTab] = useState('terrain')

  const [viewMode, setViewMode] = useState('rgb')
  const [cameraMode, setCameraMode] = useState('orbit')
  const [verticalExaggeration, setVerticalExaggeration] = useState(2)
  const [meshResolution, setMeshResolution] = useState('medium')
  const [showGrid, setShowGrid] = useState(true)
  const [showLabels, setShowLabels] = useState(false)
  const [autoRotate, setAutoRotate] = useState(false)
  const [fogEnabled, setFogEnabled] = useState(true)

  const [hoverInfo, setHoverInfo] = useState(null)

  const viewerRef = useRef(null)

  const runLoadingSequence = useCallback(async (loaderFn) => {
    setScreen('loading')
    setLoadError(null)
    setLoadingProgress(0)
    setLoadingStageIndex(0)

    const stageDelay = 260
    let result = null
    let thrown = null

    // Stage 1-2 happen while we await real work; 3-5 are simulated beats
    // so the user sees deliberate progress rather than a blank pause.
    const workPromise = loaderFn()
      .then((r) => { result = r })
      .catch((e) => { thrown = e })

    for (let i = 0; i < LOADING_STAGES.length; i++) {
      setLoadingStageIndex(i)
      setLoadingProgress(((i + 1) / LOADING_STAGES.length) * 100)
      await new Promise((res) => setTimeout(res, stageDelay))
    }
    await workPromise

    if (thrown) {
      setLoadError(thrown instanceof DatasetError ? thrown.message : 'Failed to load terrain data.')
      setScreen('welcome')
      return
    }

    setDataset(result)
    setHoverInfo(null)
    setActiveTab('terrain')
    setScreen('app')
  }, [])

  const handleLaunchDemo = useCallback(() => {
    runLoadingSequence(loadDemoDataset)
  }, [runLoadingSequence])

  const handleLoadFiles = useCallback(
    (files) => {
      runLoadingSequence(() => terrainDataLoader(files))
    },
    [runLoadingSequence]
  )

  const handleHover = useCallback((info) => setHoverInfo(info), [])
  const handleHoverEnd = useCallback(() => setHoverInfo(null), [])

  const latLon = useMemo(() => {
    if (!dataset || !hoverInfo || !isGeoreferenced(dataset.metadata)) return null
    return pixelToLatLon(hoverInfo.pixelX, hoverInfo.pixelY, dataset.width, dataset.height, dataset.metadata.bounds)
  }, [dataset, hoverInfo])

  return (
    <div className="relative h-screen w-screen overflow-hidden font-sans">
      <AnimatePresence mode="wait">
        {screen === 'welcome' && (
          <motion.div
            key="welcome"
            className="absolute inset-0"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <WelcomeScreen
              onLaunch={handleLaunchDemo}
              onLoadDataset={() => {
                setScreen('app')
                setActiveTab('dataset')
              }}
            />
            {loadError && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-[12.5px] text-red-200">
                {loadError}
              </div>
            )}
          </motion.div>
        )}

        {screen === 'loading' && (
          <motion.div
            key="loading"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <LoadingScreen
              progress={loadingProgress}
              stageLabel={LOADING_STAGES[loadingStageIndex]}
              stages={LOADING_STAGES}
              activeStageIndex={loadingStageIndex}
            />
          </motion.div>
        )}

        {screen === 'app' && (
          <motion.div
            key="app"
            className="flex h-full w-full flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Header
              activeTab={activeTab}
              onTabChange={(tab) => setActiveTab(tab)}
              hasDataset={Boolean(dataset)}
              engineOnline={Boolean(dataset)}
            />

            {/* Viewer tabs: the 3D scene stays mounted across Terrain <-> Analysis
                switches (camera position, mesh, FPS counters survive); it is only
                ever absent from the DOM when there's no dataset yet. */}
            {(() => {
              const isViewerTab = activeTab === 'terrain' || activeTab === 'analysis'
              return (
                <div className="flex min-h-0 flex-1">
                  {dataset && activeTab === 'terrain' && (
                    <Sidebar
                      viewMode={viewMode}
                      onViewModeChange={setViewMode}
                      onOpenDataset={() => setActiveTab('dataset')}
                      onLoadDemo={handleLaunchDemo}
                    />
                  )}

                  <div className="relative min-w-0 flex-1">
                    {dataset && (
                      <div className={isViewerTab ? 'absolute inset-0' : 'absolute inset-0 hidden'}>
                        <TerrainViewer
                          ref={viewerRef}
                          dataset={dataset}
                          viewMode={viewMode}
                          cameraMode={cameraMode}
                          verticalExaggeration={verticalExaggeration}
                          meshResolution={meshResolution}
                          showGrid={showGrid}
                          showLabels={showLabels}
                          fogEnabled={fogEnabled}
                          autoRotate={autoRotate}
                          onHover={handleHover}
                          onHoverEnd={handleHoverEnd}
                        />

                        {cameraMode === 'fly' && (
                          <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full border hairline bg-black/30 px-4 py-1.5 text-[11px] tracking-wide text-violet-200/70 backdrop-blur-xs">
                            WASD Move · Q/E Altitude · Click + Mouse Look · Shift Boost
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'overview' && (
                      dataset ? (
                        <OverviewPanel
                          dataset={dataset}
                          onGoToTerrain={() => setActiveTab('terrain')}
                          onGoToAnalysis={() => setActiveTab('analysis')}
                          onOpenDataset={() => setActiveTab('dataset')}
                          onLoadDemo={handleLaunchDemo}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <UploadPanel
                            onLoadFiles={handleLoadFiles}
                            onLoadDemo={handleLaunchDemo}
                            isLoading={false}
                            error={loadError}
                            onDismissError={() => setLoadError(null)}
                          />
                        </div>
                      )
                    )}

                    {activeTab === 'dataset' && (
                      <div className="flex h-full w-full items-center justify-center">
                        <UploadPanel
                          onLoadFiles={handleLoadFiles}
                          onLoadDemo={handleLaunchDemo}
                          isLoading={false}
                          error={loadError}
                          onDismissError={() => setLoadError(null)}
                        />
                      </div>
                    )}
                  </div>

                  {dataset && activeTab === 'analysis' && (
                    <div className="flex w-[300px] shrink-0 flex-col gap-3 overflow-y-auto border-l hairline p-3.5">
                      <AnalysisPanel hoverInfo={hoverInfo} isGeoreferenced={isGeoreferenced(dataset.metadata)} latLon={latLon} />
                      <StatisticsPanel dataset={dataset} />
                    </div>
                  )}

                  {dataset && activeTab === 'terrain' && (
                    <div className="hidden w-[260px] shrink-0 flex-col gap-3 overflow-y-auto border-l hairline p-3.5 lg:flex">
                      <AnalysisPanel hoverInfo={hoverInfo} isGeoreferenced={isGeoreferenced(dataset.metadata)} latLon={latLon} />
                      <StatisticsPanel dataset={dataset} />
                    </div>
                  )}
                </div>
              )
            })()}

            {dataset && (activeTab === 'terrain' || activeTab === 'analysis') && (
              <TerrainToolbar
                cameraMode={cameraMode}
                onCameraModeChange={setCameraMode}
                onReset={() => viewerRef.current?.resetCamera()}
                onScreenshot={() => downloadScreenshot(viewerRef.current?.screenshot())}
                onFullscreen={() => viewerRef.current?.requestFullscreen()}
                showGrid={showGrid}
                onToggleGrid={() => setShowGrid((v) => !v)}
                showLabels={showLabels}
                onToggleLabels={() => setShowLabels((v) => !v)}
                autoRotate={autoRotate}
                onToggleAutoRotate={() => setAutoRotate((v) => !v)}
                fogEnabled={fogEnabled}
                onToggleFog={() => setFogEnabled((v) => !v)}
                verticalExaggeration={verticalExaggeration}
                onVerticalExaggerationChange={setVerticalExaggeration}
                meshResolution={meshResolution}
                onMeshResolutionChange={setMeshResolution}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function downloadScreenshot(dataUrl) {
  if (!dataUrl) return
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `depthwizard-terrain-${Date.now()}.png`
  a.click()
}
