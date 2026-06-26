// Shared heat color scale: cold → warm → hot
// Uses sqrt scaling for better perceptual spread across wide value ranges

const DARK_STOPS = [
  [15, 23, 42],    // slate-900 (near-zero)
  [14, 116, 144],  // cyan-700
  [22, 163, 74],   // green-600
  [234, 179, 8],   // yellow-500
  [220, 38, 38],   // red-600
] as const

const LIGHT_STOPS = [
  [226, 232, 240], // slate-200 (near-zero)
  [103, 232, 249], // cyan-300
  [74, 222, 128],  // green-400
  [250, 204, 21],  // yellow-400
  [239, 68, 68],   // red-500
] as const

export function heatColor(val: number, max: number, isDark: boolean): string {
  if (max === 0) return isDark ? '#0f172a' : '#e2e8f0'
  const t = Math.sqrt(Math.min(val / max, 1))
  const stops = isDark ? DARK_STOPS : LIGHT_STOPS
  const scaled = t * (stops.length - 1)
  const lo = Math.floor(scaled)
  const hi = Math.min(lo + 1, stops.length - 1)
  const f = scaled - lo
  const r = Math.round(stops[lo][0] + (stops[hi][0] - stops[lo][0]) * f)
  const g = Math.round(stops[lo][1] + (stops[hi][1] - stops[lo][1]) * f)
  const b = Math.round(stops[lo][2] + (stops[hi][2] - stops[lo][2]) * f)
  return `rgb(${r},${g},${b})`
}

export function heatLegendGradient(isDark: boolean): string {
  return isDark
    ? 'linear-gradient(to right, #0f172a, #0e7490, #16a34a, #eab308, #dc2626)'
    : 'linear-gradient(to right, #e2e8f0, #67e8f9, #4ade80, #facc15, #ef4444)'
}
