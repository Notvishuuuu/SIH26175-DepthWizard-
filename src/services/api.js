// Central data-loading abstraction. The Three.js viewer never touches
// File objects, npy parsing, or fetch calls directly — it only ever
// consumes the normalized "TerrainDataset" shape below. This means the
// upload UI, the demo generator, and (later) a real Flask/FastAPI backend
// can all feed the same viewer without changes downstream.
//
// TerrainDataset shape:
// {
//   imageUrl: string (data URL or remote URL),
//   heights: Float32Array,
//   width: number,
//   height: number,
//   heightType: 'relative' | 'absolute',
//   metadata: { model, crs, bounds, resolution, sourceName }
// }

import { loadImageElement, imageToHeightArray, parseNpyFile, parseNpyFromUrl } from '../utils/imageLoader.js'
import { createDemoDataset } from '../data/demoTerrain.js'

export class DatasetError extends Error {}

/**
 * Loads a TerrainDataset from a pair of user-provided files (RGB image +
 * heightmap). Heightmap may be a rendered PNG/JPG (8-bit grayscale) or a
 * raw .npy array (float32/float64) for development/testing.
 */
export async function terrainDataLoader({ imageFile, heightmapFile, heightType = 'relative' }) {
  if (!imageFile) {
    throw new DatasetError('An RGB image is required. Please upload the source satellite image.')
  }
  if (!heightmapFile) {
    throw new DatasetError('A depth or elevation map is required. Please upload the heightmap.')
  }

  const imageEl = await loadImageElement(imageFile)
  const imageWidth = imageEl.naturalWidth
  const imageHeight = imageEl.naturalHeight

  if (!imageWidth || !imageHeight) {
    throw new DatasetError('The RGB image appears to be empty or unreadable.')
  }
  if (imageWidth * imageHeight > 40_000_000) {
    throw new DatasetError('This image is very large. Please downscale it before uploading (max ~40MP).')
  }

  let heightResult
  const isNpy = heightmapFile.name && heightmapFile.name.toLowerCase().endsWith('.npy')

  if (isNpy) {
    heightResult = await parseNpyFile(heightmapFile)
  } else {
    const heightImg = await loadImageElement(heightmapFile)
    if (!heightImg.naturalWidth || !heightImg.naturalHeight) {
      throw new DatasetError('The heightmap image appears to be empty or unreadable.')
    }
    heightResult = imageToHeightArray(heightImg)
  }

  const { heights, width: hmWidth, height: hmHeight } = heightResult

  // The mesh builder resamples internally, so exact pixel-for-pixel
  // matching isn't required — but wildly different aspect ratios usually
  // indicate a mismatched pair, so warn clearly rather than silently
  // producing a distorted terrain.
  const imageAspect = imageWidth / imageHeight
  const hmAspect = hmWidth / hmHeight
  if (Math.abs(imageAspect - hmAspect) / imageAspect > 0.15) {
    throw new DatasetError(
      'Heightmap and RGB image dimensions do not match. Please upload aligned datasets.'
    )
  }

  const dataUrl = await blobToDataUrl(imageFile)

  return {
    imageUrl: dataUrl,
    heights,
    width: hmWidth,
    height: hmHeight,
    heightType,
    metadata: {
      model: 'Depth Anything V2 Small',
      crs: heightType === 'absolute' ? 'user-provided DEM calibration' : null,
      bounds: null,
      resolution: null,
      sourceName: imageFile.name
    }
  }
}

/** Loads the built-in procedural demo dataset — no network, no files. */
export async function loadDemoDataset() {
  return createDemoDataset()
}

// Where the Role 1/2 pipeline output lives — files copied into
// public/data/ are served as-is at this path by Vite, both in dev and
// in the production build, so a plain fetch is all that's needed.
const REAL_DATA_DIR = '/data'

/**
 * Loads the real depth-estimation pipeline output from public/data/
 * (depth.npy + depth_visual.png, with metadata.json as optional extra
 * info) as a TerrainDataset. Throws if depth.npy is missing or fails to
 * parse — callers that want a graceful demo fallback should use
 * loadDefaultDataset() instead of calling this directly.
 */
export async function loadRealDataset() {
  const { heights, width, height } = await parseNpyFromUrl(`${REAL_DATA_DIR}/depth.npy`)

  let metadata = {}
  try {
    const res = await fetch(`${REAL_DATA_DIR}/metadata.json`)
    if (res.ok) metadata = await res.json()
  } catch {
    // metadata.json is optional supplementary info — proceed without it.
  }

  const heightType = metadata.heightType || metadata.height_type || 'relative'

  return {
    imageUrl: `${REAL_DATA_DIR}/depth_visual.png`,
    heights,
    width,
    height,
    heightType,
    metadata: {
      model: metadata.model || 'Depth Anything V2',
      crs: heightType === 'absolute' ? (metadata.crs || 'DEM-calibrated') : null,
      bounds: metadata.bounds || null,
      resolution: metadata.resolution || null,
      sourceName: metadata.sourceName || metadata.source_name || 'depth.npy (pipeline output)'
    }
  }
}

/**
 * Default dataset used by the "Launch"/"Load Demo Terrain" actions
 * throughout the UI: tries the real pipeline output in public/data/
 * first, and transparently falls back to the procedural demo terrain if
 * those files are missing or fail to parse, so the app still runs
 * standalone without the pipeline output present.
 */
export async function loadDefaultDataset() {
  try {
    return await loadRealDataset()
  } catch (err) {
    console.warn('[DepthWizard] Falling back to demo terrain — could not load real dataset:', err)
    return createDemoDataset()
  }
}

/**
 * Backend integration point for Role 4. Currently unused by the UI (which
 * defaults to local upload / demo data), but kept as a ready-made service
 * call so wiring up a real Flask/FastAPI endpoint later is a one-line
 * change in UploadPanel rather than a rewrite.
 */
export async function uploadToBackend(files, baseUrl = '/api') {
  const formData = new FormData()
  if (files.imageFile) formData.append('image', files.imageFile)
  if (files.heightmapFile) formData.append('heightmap', files.heightmapFile)

  const response = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new DatasetError(`Backend upload failed (${response.status}).`)
  }

  const payload = await response.json()
  return {
    imageUrl: payload.image_url,
    heightmapUrl: payload.heightmap_url,
    heightType: payload.height_type || 'relative',
    metadata: payload.metadata || {}
  }
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Could not read image file.'))
    reader.readAsDataURL(blob)
  })
}
