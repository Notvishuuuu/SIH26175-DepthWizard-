import { resampleHeights, getRange } from './heightmap.js'

/**
 * Builds flat typed arrays (positions, uvs, indices) for a terrain mesh
 * grid, ready to hand to a Three.js BufferGeometry. Uses a downsampled
 * grid (meshWidth x meshHeight) independent of the source heightmap's
 * native resolution, per the SIH brief's performance requirements.
 *
 * Coordinate convention: the mesh spans [-planeSize/2, planeSize/2] on X
 * and Z, with Y as up (elevation). UVs follow U = x/(w-1), V = z/(h-1),
 * matching the RGB texture's pixel grid so image and terrain stay aligned.
 */
export function buildTerrainGeometryData({
  rawHeights,
  srcWidth,
  srcHeight,
  meshResolution,
  planeSize = 100,
  verticalExaggeration = 2,
  heightType = 'relative',
  referenceElevation = null
}) {
  // Aspect-correct mesh grid so non-square source images aren't stretched.
  const aspect = srcWidth / srcHeight
  let meshW = meshResolution
  let meshH = meshResolution
  if (aspect >= 1) {
    meshH = Math.max(2, Math.round(meshResolution / aspect))
  } else {
    meshW = Math.max(2, Math.round(meshResolution * aspect))
  }

  const heights = resampleHeights(rawHeights, srcWidth, srcHeight, meshW, meshH)
  const { min, max } = getRange(heights)
  const span = max - min || 1

  // For absolute elevation, subtract a reference so world-space Y values
  // stay small and centered rather than sitting at e.g. y=1800.
  const reference = heightType === 'absolute'
    ? (referenceElevation ?? min)
    : min

  const vertexCount = meshW * meshH
  const positions = new Float32Array(vertexCount * 3)
  const uvs = new Float32Array(vertexCount * 2)
  const normalizedHeights = new Float32Array(vertexCount) // 0..1, for colour ramps

  const halfW = planeSize / 2
  const halfD = (planeSize * (meshH / meshW)) / 2
  // A gentle world-unit scale so the vertical axis reads naturally next
  // to the horizontal plane regardless of source units (meters vs relative).
  const heightWorldScale = (planeSize / 6) * verticalExaggeration

  for (let z = 0; z < meshH; z++) {
    for (let x = 0; x < meshW; x++) {
      const i = z * meshW + x
      const rawH = heights[i]
      const normalized = (rawH - min) / span

      const worldX = (x / (meshW - 1)) * planeSize - halfW
      const worldZ = (z / (meshH - 1)) * (planeSize * (meshH / meshW)) - halfD
      const worldY = ((rawH - reference) / span) * heightWorldScale

      positions[i * 3] = worldX
      positions[i * 3 + 1] = worldY
      positions[i * 3 + 2] = worldZ

      uvs[i * 2] = x / (meshW - 1)
      uvs[i * 2 + 1] = 1 - z / (meshH - 1) // flip V to match image top-left origin

      normalizedHeights[i] = normalized
    }
  }

  const indexCount = (meshW - 1) * (meshH - 1) * 6
  const indices = vertexCount > 65535 ? new Uint32Array(indexCount) : new Uint16Array(indexCount)
  let idx = 0
  for (let z = 0; z < meshH - 1; z++) {
    for (let x = 0; x < meshW - 1; x++) {
      const a = z * meshW + x
      const b = z * meshW + x + 1
      const c = (z + 1) * meshW + x
      const d = (z + 1) * meshW + x + 1

      indices[idx++] = a
      indices[idx++] = c
      indices[idx++] = b
      indices[idx++] = b
      indices[idx++] = c
      indices[idx++] = d
    }
  }

  return {
    positions,
    uvs,
    indices,
    normalizedHeights,
    meshW,
    meshH,
    min,
    max,
    reference,
    planeSize,
    depthWorld: planeSize * (meshH / meshW),
    heightWorldScale
  }
}
