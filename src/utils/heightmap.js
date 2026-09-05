// Heightmap resampling + normalization helpers. Terrain data can arrive at
// arbitrary resolution (a 4000x3000 satellite tile is common) so the mesh
// generator always works against a downsampled grid while the RGB texture
// keeps its native resolution.

/**
 * Bilinearly resamples a flat height array from (srcW x srcH) to
 * (dstW x dstH). Works for any source/target size ratio, including upscaling
 * small demo data.
 */
export function resampleHeights(src, srcW, srcH, dstW, dstH) {
  if (srcW === dstW && srcH === dstH) return src

  const out = new Float32Array(dstW * dstH)
  const xRatio = srcW > 1 ? (srcW - 1) / Math.max(dstW - 1, 1) : 0
  const yRatio = srcH > 1 ? (srcH - 1) / Math.max(dstH - 1, 1) : 0

  for (let y = 0; y < dstH; y++) {
    const sy = y * yRatio
    const y0 = Math.floor(sy)
    const y1 = Math.min(y0 + 1, srcH - 1)
    const fy = sy - y0

    for (let x = 0; x < dstW; x++) {
      const sx = x * xRatio
      const x0 = Math.floor(sx)
      const x1 = Math.min(x0 + 1, srcW - 1)
      const fx = sx - x0

      const v00 = src[y0 * srcW + x0]
      const v10 = src[y0 * srcW + x1]
      const v01 = src[y1 * srcW + x0]
      const v11 = src[y1 * srcW + x1]

      const top = v00 + (v10 - v00) * fx
      const bottom = v01 + (v11 - v01) * fx
      out[y * dstW + x] = top + (bottom - top) * fy
    }
  }

  return out
}

/** Returns { min, max } for a flat numeric array. */
export function getRange(arr) {
  let min = Infinity
  let max = -Infinity
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i]
    if (v < min) min = v
    if (v > max) max = v
  }
  return { min, max }
}

/** Normalizes a height array into [0, 1] given an explicit or computed range. */
export function normalizeHeights(arr, range) {
  const { min, max } = range || getRange(arr)
  const span = max - min || 1
  const out = new Float32Array(arr.length)
  for (let i = 0; i < arr.length; i++) {
    out[i] = (arr[i] - min) / span
  }
  return out
}

// Resolution presets for the terrain mesh grid (independent of the
// source data's native resolution).
export const RESOLUTION_PRESETS = {
  low: 128,
  medium: 256,
  high: 384
}
