// Helpers for "Bring to front" / "Send to back". With React Flow's
// zIndexMode="manual", stacking is driven by each item's explicit zIndex,
// not array order. We pick a value one above the current max (front) or
// one below the current min (back). Treat undefined zIndex as 0.

interface ZItem {
  zIndex?: number;
}

export function nextFrontZIndex(items: readonly ZItem[]): number {
  let max = 0;
  for (const item of items) {
    if (typeof item.zIndex === 'number' && item.zIndex > max) {
      max = item.zIndex;
    }
  }
  return max + 1;
}

export function nextBackZIndex(items: readonly ZItem[]): number {
  let min = 0;
  for (const item of items) {
    if (typeof item.zIndex === 'number' && item.zIndex < min) {
      min = item.zIndex;
    }
  }
  return min - 1;
}
