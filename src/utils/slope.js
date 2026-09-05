// Slope derivation from a heightmap grid, using a central-difference
// gradient. Operates on real-world units when a metersPerPixel + vertical
// range is supplied, otherwise falls back to normalized (0-1) units so
// relative-depth data still produces a sensible, comparable gradient.

/**
 * Computes a per-vertex slope array (degrees) from a flat height grid.
 * @param {Float32Array} heights flat array, row-major, length = width*height
 * @param {number} width grid width
 * @param {number} height grid height
 * @param {number} worldWidth physical width the grid spans (arbitrary units)
 * @param {number} worldHeight physical height the grid spans
 * @param {number} elevationSpan physical span of the height values (max-min), same units as worldWidth
 */
export function computeSlopeDegrees(heights, width, height, worldWidth, worldHeight, elevationSpan) {
  const out = new Float32Array(width * height)
  const dx = worldWidth / Math.max(width - 1, 1)
  const dy = worldHeight / Math.max(height - 1, 1)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const xL = Math.max(x - 1, 0)
      const xR = Math.min(x + 1, width - 1)
      const yU = Math.max(y - 1, 0)
      const yD = Math.min(y + 1, height - 1)

      const hL = heights[y * width + xL] * elevationSpan
      const hR = heights[y * width + xR] * elevationSpan
      const hU = heights[yU * width + x] * elevationSpan
      const hD = heights[yD * width + x] * elevationSpan

      const dzdx = (hR - hL) / (2 * dx || 1)
      const dzdy = (hD - hU) / (2 * dy || 1)

      const slopeRad = Math.atan(Math.sqrt(dzdx * dzdx + dzdy * dzdy))
      out[y * width + x] = slopeRad * (180 / Math.PI)
    }
  }

  return out
}

/** Maps a slope in degrees [0, 90] to a color on a scientific blue -> red ramp. */
export function slopeToColor(slopeDeg) {
  const t = Math.min(Math.max(slopeDeg / 60, 0), 1)
  // Blue (flat) -> cyan -> yellow -> red (steep)
  const stops = [
    { t: 0.0, c: [0.13, 0.25, 0.55] },
    { t: 0.35, c: [0.15, 0.55, 0.6] },
    { t: 0.65, c: [0.85, 0.72, 0.25] },
    { t: 1.0, c: [0.82, 0.2, 0.2] }
  ]
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i]
    const b = stops[i + 1]
    if (t >= a.t && t <= b.t) {
      const localT = (t - a.t) / (b.t - a.t || 1)
      return [
        a.c[0] + (b.c[0] - a.c[0]) * localT,
        a.c[1] + (b.c[1] - a.c[1]) * localT,
        a.c[2] + (b.c[2] - a.c[2]) * localT
      ]
    }
  }
  return stops[stops.length - 1].c
}

/** Maps a normalized elevation [0,1] to the DepthWizard topographic ramp. */
export function elevationToColor(t) {
  const stops = [
    { t: 0.0, c: [0.06, 0.05, 0.16] },
    { t: 0.25, c: [0.17, 0.09, 0.38] },
    { t: 0.5, c: [0.42, 0.22, 0.68] },
    { t: 0.75, c: [0.86, 0.55, 0.26] },
    { t: 1.0, c: [0.98, 0.92, 0.75] }
  ]
  const clamped = Math.min(Math.max(t, 0), 1)
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i]
    const b = stops[i + 1]
    if (clamped >= a.t && clamped <= b.t) {
      const localT = (clamped - a.t) / (b.t - a.t || 1)
      return [
        a.c[0] + (b.c[0] - a.c[0]) * localT,
        a.c[1] + (b.c[1] - a.c[1]) * localT,
        a.c[2] + (b.c[2] - a.c[2]) * localT
      ]
    }
  }
  return stops[stops.length - 1].c
}
