/**
 * Straight-line (Haversine) distance between two lat/lng points, in km.
 */
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Typical urban roads add ~30-40% over straight-line distance due to street
// layout, one-ways, and routing around obstacles. This is a rough estimate,
// not a routing engine — the UI labels it as such.
const ROAD_FACTOR = 1.35

/**
 * Estimated road distance (km, 1 decimal place) between two landmarks.
 */
export function estimateDistanceKm(pointA, pointB) {
  if (!pointA || !pointB) return null
  const straightLine = haversineKm(pointA.lat, pointA.lng, pointB.lat, pointB.lng)
  return Math.round(straightLine * ROAD_FACTOR * 10) / 10
}
