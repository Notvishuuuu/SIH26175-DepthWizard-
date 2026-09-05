// Generates a procedural demo heightmap (fractal value noise, several
// octaves, producing hills / ridges / valleys) plus a matching canvas
// texture, entirely client-side. This lets the app run and impress
// immediately after `npm run dev`, with no backend or sample assets.

function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildValueNoiseGrid(size, seed) {
  const rand = mulberry32(seed)
  const grid = new Float32Array(size * size)
  for (let i = 0; i < grid.length; i++) grid[i] = rand()
  return grid
}

function smoothstep(t) {
  return t * t * (3 - 2 * t)
}

function sampleGrid(grid, gridSize, x, y) {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const x1 = (x0 + 1) % gridSize
  const y1 = (y0 + 1) % gridSize
  const fx = smoothstep(x - x0)
  const fy = smoothstep(y - y0)

  const gx0 = x0 % gridSize
  const gy0 = y0 % gridSize

  const v00 = grid[gy0 * gridSize + gx0]
  const v10 = grid[gy0 * gridSize + x1]
  const v01 = grid[y1 * gridSize + gx0]
  const v11 = grid[y1 * gridSize + x1]

  const top = v00 + (v10 - v00) * fx
  const bottom = v01 + (v11 - v01) * fx
  return top + (bottom - top) * fy
}

/**
 * Generates a fractal-noise heightmap of width x height using several
 * octaves of value noise, producing natural-looking terrain rather than
 * pure random static.
 */
export function generateDemoHeightmap(width = 256, height = 256, seed = 1337) {
  const octaves = [
    { gridSize: 4, amplitude: 0.55, seed: seed },
    { gridSize: 8, amplitude: 0.25, seed: seed + 1 },
    { gridSize: 16, amplitude: 0.13, seed: seed + 2 },
    { gridSize: 32, amplitude: 0.07, seed: seed + 3 }
  ]

  const noiseGrids = octaves.map((o) => ({
    grid: buildValueNoiseGrid(o.gridSize, o.seed),
    ...o
  }))

  const heights = new Float32Array(width * height)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let value = 0
      for (const oct of noiseGrids) {
        const nx = (x / width) * oct.gridSize
        const ny = (y / height) * oct.gridSize
        value += sampleGrid(oct.grid, oct.gridSize, nx, ny) * oct.amplitude
      }

      // Gentle central ridge + valley shaping so the demo reads as a
      // recognizable landform rather than uniform noise.
      const cx = x / width - 0.5
      const cy = y / height - 0.5
      const ridge = Math.exp(-Math.pow((cx + cy) * 1.4, 2) * 3) * 0.35
      const basin = Math.exp(-((cx - 0.28) ** 2 + (cy + 0.22) ** 2) * 10) * -0.22

      heights[y * width + x] = value + ridge + basin
    }
  }

  // Normalize to [0, 1]
  let min = Infinity
  let max = -Infinity
  for (let i = 0; i < heights.length; i++) {
    if (heights[i] < min) min = heights[i]
    if (heights[i] > max) max = heights[i]
  }
  const span = max - min || 1
  for (let i = 0; i < heights.length; i++) {
    heights[i] = (heights[i] - min) / span
  }

  return heights
}

/**
 * Renders a matching satellite-style RGB texture for the demo heightmap:
 * low areas render as water/valley greens, mid slopes as terrain browns,
 * peaks as rock/snow, so the "lifted image" effect reads clearly.
 */
export function generateDemoTexture(heights, width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const imgData = ctx.createImageData(width, height)

  const bandColor = (t) => {
    if (t < 0.28) return [24, 58, 74] // deep water
    if (t < 0.36) return [42, 92, 96] // shallow water
    if (t < 0.44) return [86, 122, 70] // lowland green
    if (t < 0.62) return [107, 142, 76] // vegetated slopes
    if (t < 0.78) return [138, 118, 84] // rock / earth
    if (t < 0.9) return [173, 162, 148] // high rock
    return [230, 232, 236] // snow cap
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      const t = heights[i]
      const [r, g, b] = bandColor(t)
      // subtle per-pixel variation so it doesn't look like flat bands
      const jitter = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1
      const n = jitter * 8 - 4

      const p = i * 4
      imgData.data[p] = Math.min(255, Math.max(0, r + n))
      imgData.data[p + 1] = Math.min(255, Math.max(0, g + n))
      imgData.data[p + 2] = Math.min(255, Math.max(0, b + n))
      imgData.data[p + 3] = 255
    }
  }

  ctx.putImageData(imgData, 0, 0)
  return canvas.toDataURL('image/png')
}

/**
 * Produces a complete demo dataset matching the app's internal data
 * contract (see services/api.js), ready to feed straight into the viewer.
 */
export function createDemoDataset() {
  const width = 256
  const height = 200
  const heights = generateDemoHeightmap(width, height, 2024)
  const textureUrl = generateDemoTexture(heights, width, height)

  return {
    imageUrl: textureUrl,
    heights,
    width,
    height,
    heightType: 'relative',
    metadata: {
      model: 'Depth Anything V2 Small (simulated demo)',
      crs: null,
      bounds: null,
      resolution: null,
      sourceName: 'demo-terrain'
    }
  }
}
