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
 * endpoints, that contains the edge's clickable band. The curved and stepped
 * line shapes bow away from that line, so the rectangle grows to cover the bow.
 *
 * Coordinates come back in the path's own user space, which for a React Flow
 * edge is canvas space.
 */
export function computeEdgeSelectionBox(
  path: SVGPathElement,
  bandWidth: number
): EdgeSelectionBox | null {
  // React Flow always renders path data. Without it there is nothing to
  // measure, and getPointAtLength is not safe to call.
  if (!path.getAttribute('d')) return null;

  const length = path.getTotalLength();
  const start = path.getPointAtLength(0);
  const end = path.getPointAtLength(length);
  const spanX = end.x - start.x;
  const spanY = end.y - start.y;
  const span = Math.hypot(spanX, spanY);

  // Unit vector along the endpoint-to-endpoint line, and its 90° rotation.
  // A line dragged down onto itself has both endpoints in the same place, which
  // leaves that direction undefined; fall back to the x axis so the rectangle
  // still covers the band and the selection stays visible.
  const alongX = span ? spanX / span : 1;
  const alongY = span ? spanY / span : 0;
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
  // side. Extending the same distance past the endpoints keeps the rectangle
  // clear of the anchor handles that sit there, rather than cutting through
  // them. Those ends stay grabbable — they drag the anchor, not the whole line.
  const halfBand = bandWidth / 2;
  minAlong -= halfBand;
  maxAlong += halfBand;
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
