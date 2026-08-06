// Samples taken along a path when fitting its selection rectangle. Enough to
// track the bow of the curved and stepped line shapes to within a pixel.
const PATH_SAMPLES = 64;

export interface EdgeSelectionBox {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  angleDegrees: number;
}

/**
 * The tightest rectangle, oriented along the straight line joining an edge's
 * endpoints, that contains the edge's clickable band. For the straight line
 * shape this is the band exactly; the curved and stepped shapes bow away from
 * that line, so the rectangle grows to cover the bow.
 *
 * Coordinates come back in the path's own user space, which for a React Flow
 * edge is canvas space.
 */
export function computeEdgeSelectionBox(
  path: SVGPathElement,
  bandWidth: number
): EdgeSelectionBox | null {
  const length = path.getTotalLength();
  if (!length) return null;

  const start = path.getPointAtLength(0);
  const end = path.getPointAtLength(length);
  const spanX = end.x - start.x;
  const spanY = end.y - start.y;
  const span = Math.hypot(spanX, spanY);
  // Both endpoints in the same place leaves the rectangle's angle undefined.
  if (!span) return null;

  // Unit vector along the endpoint-to-endpoint line, and its 90° rotation.
  const alongX = spanX / span;
  const alongY = spanY / span;
  const acrossX = -alongY;
  const acrossY = alongX;

  let minAlong = Infinity;
  let maxAlong = -Infinity;
  let minAcross = Infinity;
  let maxAcross = -Infinity;
  for (let sample = 0; sample <= PATH_SAMPLES; sample++) {
    const point = path.getPointAtLength((length * sample) / PATH_SAMPLES);
    const offsetX = point.x - start.x;
    const offsetY = point.y - start.y;
    const along = offsetX * alongX + offsetY * alongY;
    const across = offsetX * acrossX + offsetY * acrossY;
    minAlong = Math.min(minAlong, along);
    maxAlong = Math.max(maxAlong, along);
    minAcross = Math.min(minAcross, across);
    maxAcross = Math.max(maxAcross, across);
  }

  // The band is centered on the path, so it reaches half its width to either
  // side. Its ends are square, so it doesn't reach past the endpoints.
  const halfBand = bandWidth / 2;
  minAcross -= halfBand;
  maxAcross += halfBand;

  const alongCenter = (minAlong + maxAlong) / 2;
  const acrossCenter = (minAcross + maxAcross) / 2;
  return {
    centerX: start.x + alongX * alongCenter + acrossX * acrossCenter,
    centerY: start.y + alongY * alongCenter + acrossY * acrossCenter,
    width: maxAlong - minAlong,
    height: maxAcross - minAcross,
    angleDegrees: (Math.atan2(alongY, alongX) * 180) / Math.PI,
  };
}
