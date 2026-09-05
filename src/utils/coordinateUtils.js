// Converts a pixel coordinate into geographic coordinates when the dataset
// carries georeferencing metadata (bounds in lat/lon). For non-georeferenced
// data, callers should not invoke this and should show relative pixel/height
// info instead — see TerrainViewer's hover panel logic.

/**
 * @param {number} px pixel x (column)
 * @param {number} py pixel y (row)
 * @param {number} width image width in pixels
 * @param {number} height image height in pixels
 * @param {{north:number, south:number, east:number, west:number}} bounds
 */
export function pixelToLatLon(px, py, width, height, bounds) {
  const lon = bounds.west + (px / Math.max(width - 1, 1)) * (bounds.east - bounds.west)
  const lat = bounds.north - (py / Math.max(height - 1, 1)) * (bounds.north - bounds.south)
  return { lat, lon }
}

export function isGeoreferenced(metadata) {
  return Boolean(
    metadata &&
    metadata.bounds &&
    Number.isFinite(metadata.bounds.north) &&
    Number.isFinite(metadata.bounds.south) &&
    Number.isFinite(metadata.bounds.east) &&
    Number.isFinite(metadata.bounds.west)
  )
}
