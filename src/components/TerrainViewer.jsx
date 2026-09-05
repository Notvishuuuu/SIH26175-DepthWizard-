import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, Html } from '@react-three/drei'
import * as THREE from 'three'
import TerrainMesh from './TerrainMesh.jsx'
import { OrbitCameraRig, FlyCameraRig } from './CameraControls.jsx'
import HUD from './HUD.jsx'

function FpsAndCameraTracker({ onFps, onCameraPos }) {
  const frames = useRef(0)
  const last = useRef(performance.now())
  const { camera } = useThree()

  useFrame(() => {
    frames.current += 1
    const now = performance.now()
    if (now - last.current >= 500) {
      const fps = Math.round((frames.current * 1000) / (now - last.current))
      onFps(fps)
      frames.current = 0
      last.current = now
      onCameraPos({ x: camera.position.x, y: camera.position.y, z: camera.position.z })
    }
  })
  return null
}

function SceneryLighting({ fogEnabled }) {
  return (
    <>
      <ambientLight intensity={0.55} color="#a48ce8" />
      <directionalLight
        position={[35, 45, 20]}
        intensity={1.4}
        color="#f4ecff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <hemisphereLight args={['#4c2394', '#050308', 0.4]} />
      {fogEnabled && <fog attach="fog" args={['#0a0714', 40, 130]} />}
    </>
  )
}

const TerrainViewer = forwardRef(function TerrainViewer(
  {
    dataset,
    viewMode,
    cameraMode,
    verticalExaggeration,
    meshResolution,
    showGrid,
    showLabels,
    fogEnabled,
    autoRotate,
    onHover,
    onHoverEnd,
    onGeometryReady
  },
  ref
) {
  const [fps, setFps] = useState(0)
  const [cameraPos, setCameraPos] = useState({ x: 0, y: 0, z: 0 })
  const [geometryStats, setGeometryStats] = useState(null)
  const glRef = useRef(null)
  const cameraRef = useRef(null)
  const [resetToken, setResetToken] = useState(0)

  const handleGeometryReady = (stats) => {
    setGeometryStats(stats)
    onGeometryReady?.(stats)
  }

  useImperativeHandle(ref, () => ({
    resetCamera: () => setResetToken((v) => v + 1),
    screenshot: () => {
      if (!glRef.current) return null
      return glRef.current.domElement.toDataURL('image/png')
    },
    requestFullscreen: () => {
      const el = glRef.current?.domElement?.parentElement
      if (el?.requestFullscreen) el.requestFullscreen()
    }
  }))

  const meshResPx = { low: 128, medium: 256, high: 384 }[meshResolution] || 256

  return (
    <div className="relative h-full w-full">
      <Canvas
        id="terrain-canvas"
        shadows
        dpr={[1, 1.8]}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        camera={{ position: [45, 32, 45], fov: 45, near: 0.1, far: 500 }}
        onCreated={({ gl, camera }) => {
          glRef.current = gl
          cameraRef.current = camera
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
          gl.outputColorSpace = THREE.SRGBColorSpace
        }}
      >
        <color attach="background" args={['#050308']} />
        <SceneryLighting fogEnabled={fogEnabled} />
        <Stars radius={140} depth={50} count={1800} factor={2.4} saturation={0} fade speed={0.4} />

        {showGrid && (
          <gridHelper args={[80, 40, '#4c2394', '#1c0e3d']} position={[0, -0.02, 0]} />
        )}

        {showLabels && <CompassLabels />}

        <TerrainMesh
          key={`${dataset.metadata?.sourceName ?? 'dataset'}-${meshResolution}`}
          dataset={dataset}
          viewMode={viewMode}
          meshResolution={meshResPx}
          verticalExaggeration={verticalExaggeration}
          wireframeOverlay={false}
          onHover={onHover}
          onHoverEnd={onHoverEnd}
          onGeometryReady={handleGeometryReady}
        />

        {cameraMode === 'orbit' ? (
          <ResetableOrbit autoRotate={autoRotate} resetToken={resetToken} />
        ) : (
          <FlyCameraRig active={cameraMode === 'fly'} />
        )}

        <FpsAndCameraTracker onFps={setFps} onCameraPos={setCameraPos} />
      </Canvas>

      <HUD dataset={dataset} geometryStats={geometryStats} fps={fps} cameraPos={cameraPos} engineOnline />
    </div>
  )
})

function ResetableOrbit({ autoRotate, resetToken }) {
  const controlsRef = useRef()
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(45, 32, 45)
    controlsRef.current?.target.set(0, 0, 0)
    controlsRef.current?.update()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToken])

  return <OrbitCameraRig autoRotate={autoRotate} target={[0, 0, 0]} ref={controlsRef} />
}

function CompassLabels() {
  const R = 42
  const points = [
    { label: 'N', pos: [0, 1, -R] },
    { label: 'S', pos: [0, 1, R] },
    { label: 'E', pos: [R, 1, 0] },
    { label: 'W', pos: [-R, 1, 0] }
  ]
  return (
    <>
      {points.map((p) => (
        <Html key={p.label} position={p.pos} center distanceFactor={40}>
          <div className="rounded-full border border-violet-400/30 bg-black/40 px-2 py-0.5 text-[10px] font-medium tracking-wide text-cyan-200/90 backdrop-blur-xs">
            {p.label}
          </div>
        </Html>
      ))}
    </>
  )
}

export default TerrainViewer
