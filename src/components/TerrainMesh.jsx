import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useLoader } from '@react-three/fiber'
import { buildTerrainGeometryData } from '../utils/terrainMesh.js'
import { computeSlopeDegrees, elevationToColor, slopeToColor } from '../utils/slope.js'

export default function TerrainMesh({
  dataset,
  viewMode,
  meshResolution,
  verticalExaggeration,
  wireframeOverlay,
  onHover,
  onHoverEnd,
  onGeometryReady
}) {
  const meshRef = useRef()
  const texture = useLoader(THREE.TextureLoader, dataset.imageUrl)

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
    texture.needsUpdate = true
  }, [texture])

  const built = useMemo(() => {
    return buildTerrainGeometryData({
      rawHeights: dataset.heights,
      srcWidth: dataset.width,
      srcHeight: dataset.height,
      meshResolution,
      planeSize: 60,
      verticalExaggeration,
      heightType: dataset.heightType
    })
  }, [dataset, meshResolution, verticalExaggeration])

  const slopeDeg = useMemo(() => {
    return computeSlopeDegrees(
      built.normalizedHeights,
      built.meshW,
      built.meshH,
      built.planeSize,
      built.depthWorld,
      built.heightWorldScale
    )
  }, [built])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(built.positions, 3))
    geo.setAttribute('uv', new THREE.BufferAttribute(built.uvs, 2))
    geo.setIndex(new THREE.BufferAttribute(built.indices, 1))

    const colors = new Float32Array(built.normalizedHeights.length * 3)
    for (let i = 0; i < built.normalizedHeights.length; i++) {
      const [r, g, b] =
        viewMode === 'slope' ? slopeToColor(slopeDeg[i]) : elevationToColor(built.normalizedHeights[i])
      colors[i * 3] = r
      colors[i * 3 + 1] = g
      colors[i * 3 + 2] = b
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.computeVertexNormals()
    return geo
  }, [built, slopeDeg, viewMode])

  useEffect(() => {
    return () => {
      geometry.dispose()
    }
  }, [geometry])

  useEffect(() => {
    onGeometryReady?.({
      vertexCount: built.normalizedHeights.length,
      triCount: built.indices.length / 3,
      min: built.min,
      max: built.max,
      meshW: built.meshW,
      meshH: built.meshH
    })
  }, [built, onGeometryReady])

  const usesTexture = viewMode === 'rgb'
  const isWireframeMode = viewMode === 'wireframe'

  const handlePointerMove = (e) => {
    e.stopPropagation()
    if (!e.uv) return
    const gx = Math.round(e.uv.x * (built.meshW - 1))
    const gy = Math.round((1 - e.uv.y) * (built.meshH - 1))
    const idx = Math.max(0, Math.min(built.meshW * built.meshH - 1, gy * built.meshW + gx))

    const normalized = built.normalizedHeights[idx]
    const elevation = built.min + normalized * (built.max - built.min)
    const slope = slopeDeg[idx]

    const pxNative = Math.round((gx / (built.meshW - 1)) * (dataset.width - 1))
    const pyNative = Math.round((gy / (built.meshH - 1)) * (dataset.height - 1))

    onHover?.({
      pixelX: pxNative,
      pixelY: pyNative,
      normalizedHeight: normalized,
      elevation,
      slope,
      isAbsolute: dataset.heightType === 'absolute'
    })
  }

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      onPointerMove={handlePointerMove}
      onPointerOut={() => onHoverEnd?.()}
      receiveShadow
      castShadow
    >
      {isWireframeMode ? (
        <meshBasicMaterial
          color="#8f6ff0"
          wireframe
          transparent
          opacity={0.85}
        />
      ) : (
        <meshStandardMaterial
          map={usesTexture ? texture : null}
          vertexColors={!usesTexture}
          roughness={0.85}
          metalness={0.05}
          wireframe={wireframeOverlay}
        />
      )}
    </mesh>
  )
}
