// Presentation relief derived only from authoritative tile kinds. No terrain,
// movement costs, resources or crossings are created. Units: tile half-widths.
// Equal-height adjacent tiles share an edge; only exposed drops have faces.
export const RELIEF_VERSION = 1;
export const MAX_RELIEF = 1.35;
export function terrainHeight(tile) {
  if ([1, 2, 3, 10].includes(tile) || tile < 0) return 0;
  if (tile === 7) return MAX_RELIEF;
  if (tile === 5) return 0.42;
  if (tile === 6) return 0.26;
  if (tile === 9) return 0.32;
  return 0.18;
}
export function exposedFaces(height, east, south) {
  return [height > east ? height - east : 0, height > south ? height - south : 0];
}
