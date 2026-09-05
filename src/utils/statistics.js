// Elevation and slope summary statistics, computed once per dataset load
// and memoized by the caller (React.useMemo) rather than every frame.

export function computeElevationStatistics(rawHeights, heightType) {
  let min = Infinity
  let max = -Infinity
  let sum = 0

  for (let i = 0; i < rawHeights.length; i++) {
    const v = rawHeights[i]
    if (v < min) min = v
    if (v > max) max = v
    sum += v
  }

  const mean = sum / rawHeights.length
  const relief = max - min

  return {
    min,
    max,
    mean,
    relief,
    isAbsolute: heightType === 'absolute',
    unit: heightType === 'absolute' ? 'm' : ''
  }
}

export function computeSlopeStatistics(slopeArray) {
  let min = Infinity
  let max = -Infinity
  let sum = 0

  for (let i = 0; i < slopeArray.length; i++) {
    const v = slopeArray[i]
    if (v < min) min = v
    if (v > max) max = v
    sum += v
  }

  return {
    min,
    max,
    mean: sum / slopeArray.length
  }
}
