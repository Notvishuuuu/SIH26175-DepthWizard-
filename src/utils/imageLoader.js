// Loads an image File/Blob/URL into an HTMLImageElement, and can extract
// raw pixel data via an offscreen canvas. Used for both the RGB texture
// and 8-bit grayscale heightmap images (PNG/JPG).

export function loadImageElement(source) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not decode image data. The file may be corrupt or in an unsupported format.'))

    if (source instanceof File || source instanceof Blob) {
      const reader = new FileReader()
      reader.onload = (e) => { img.src = e.target.result }
      reader.onerror = () => reject(new Error('Could not read the uploaded file.'))
      reader.readAsDataURL(source)
    } else if (typeof source === 'string') {
      img.src = source
    } else {
      reject(new Error('Unsupported image source.'))
    }
  })
}

// Extracts raw RGBA pixel data from a loaded image, at its native resolution
// (or an optional target width/height, in which case it is resampled).
export function getImagePixelData(img, targetWidth, targetHeight) {
  const width = targetWidth || img.naturalWidth || img.width
  const height = targetHeight || img.naturalHeight || img.height

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, width, height)
  const imageData = ctx.getImageData(0, 0, width, height)

  return { data: imageData.data, width, height }
}

// Converts a grayscale-style image (heightmap render) into a Float32Array
// of normalized height values in [0, 1], using perceptual luminance so
// colour heightmaps still degrade sensibly.
export function imageToHeightArray(img, targetWidth, targetHeight) {
  const { data, width, height } = getImagePixelData(img, targetWidth, targetHeight)
  const out = new Float32Array(width * height)

  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    // Rec. 601 luma approximation, robust for both true grayscale and
    // false-color 8-bit renders of 16-bit depth data.
    out[p] = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  }

  return { heights: out, width, height }
}

// Attempts to parse a minimal subset of the .npy format (float32 or
// float64, C-order, 1 or 2 dimensional) purely client-side, for
// development/testing without a backend. Falls back with a clear error
// for unsupported dtypes/layouts rather than silently producing garbage.
export async function parseNpyFile(file) {
  const buffer = await file.arrayBuffer()
  return parseNpyArrayBuffer(buffer)
}

// Same parser as above, but for a .npy file already reachable at a URL
// (e.g. a pipeline output copied into public/data/) instead of a
// user-uploaded File — used to load real depth-model output without a
// backend, via a plain fetch.
export async function parseNpyFromUrl(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Could not fetch "${url}" (HTTP ${response.status}).`)
  }
  const buffer = await response.arrayBuffer()
  return parseNpyArrayBuffer(buffer)
}

// Core .npy parsing logic, shared by parseNpyFile and parseNpyFromUrl —
// both just get the raw bytes by a different route (FileReader vs fetch)
// and hand them here.
function parseNpyArrayBuffer(buffer) {
  const bytes = new Uint8Array(buffer)

  const magic = String.fromCharCode(...bytes.slice(1, 6))
  if (magic !== 'NUMPY') {
    throw new Error('File is not a valid .npy array.')
  }

  const majorVersion = bytes[6]
  let headerLen, headerStart
  if (majorVersion === 1) {
    headerLen = bytes[8] | (bytes[9] << 8)
    headerStart = 10
  } else {
    headerLen = bytes[8] | (bytes[9] << 8) | (bytes[10] << 16) | (bytes[11] << 24)
    headerStart = 12
  }

  const headerText = String.fromCharCode(...bytes.slice(headerStart, headerStart + headerLen))
  const shapeMatch = headerText.match(/'shape':\s*\(([^)]*)\)/)
  const dtypeMatch = headerText.match(/'descr':\s*'([^']*)'/)
  const fortranMatch = headerText.match(/'fortran_order':\s*(True|False)/)

  if (!shapeMatch || !dtypeMatch) {
    throw new Error('Could not parse .npy header.')
  }
  if (fortranMatch && fortranMatch[1] === 'True') {
    throw new Error('Fortran-ordered .npy arrays are not supported. Please export in C order.')
  }

  const shape = shapeMatch[1]
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)

  const dtype = dtypeMatch[1]
  const dataStart = headerStart + headerLen
  const dataBuffer = buffer.slice(dataStart)

  let values
  if (dtype === '<f4' || dtype === '=f4') {
    values = new Float32Array(dataBuffer)
  } else if (dtype === '<f8' || dtype === '=f8') {
    values = Float32Array.from(new Float64Array(dataBuffer))
  } else {
    throw new Error(`Unsupported .npy dtype "${dtype}". Expected float32 or float64.`)
  }

  const height = shape.length >= 2 ? shape[0] : 1
  const width = shape.length >= 2 ? shape[1] : shape[0]

  if (values.length !== width * height) {
    throw new Error('Parsed .npy data length does not match its declared shape.')
  }

  return { heights: values, width, height }
}
