import {ContentBounds} from './computeExportDimensions';

// Screen-space rectangle — the subset of DOMRect we need. Accepting a plain
// shape lets callers pass the result of getBoundingClientRect() directly and
// lets tests pass plain objects without touching the DOM.
export interface ScreenRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

// Returns the bounding box for all nodes and edges in a React Flow canvas.
// Rects with zero width and height are skipped (unrendered SVG groups, detached elements, etc.).
// Returns null if no rects are provided or all provided rects are empty.
export function getCanvasBounds(
  rects: ScreenRect[],
  rootRect: Pick<ScreenRect, 'left' | 'top'>,
  viewport: Viewport
): ContentBounds | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const rect of rects) {
    if (rect.width === 0 && rect.height === 0) {
      continue;
    }
    const flowLeft = (rect.left - rootRect.left - viewport.x) / viewport.zoom;
    const flowTop = (rect.top - rootRect.top - viewport.y) / viewport.zoom;
    const flowRight = (rect.right - rootRect.left - viewport.x) / viewport.zoom;
    const flowBottom =
      (rect.bottom - rootRect.top - viewport.y) / viewport.zoom;
    if (flowLeft < minX) minX = flowLeft;
    if (flowTop < minY) minY = flowTop;
    if (flowRight > maxX) maxX = flowRight;
    if (flowBottom > maxY) maxY = flowBottom;
  }
  if (!Number.isFinite(minX)) {
    return null;
  }
  return {minX, minY, maxX, maxY};
}
