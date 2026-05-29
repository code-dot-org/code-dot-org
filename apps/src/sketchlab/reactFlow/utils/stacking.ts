// Helpers for "Bring to front" / "Send to back". With React Flow's
// zIndexMode="manual", stacking is driven by each item's explicit zIndex.
// Treat undefined zIndex as 0.
//
// We exclude the target from the max/min comparison so we only bump the
// zIndex when the target isn't already strictly above (or below) the rest.

interface ZItem {
  id: string;
  zIndex?: number;
}

function getZIndex(item: ZItem): number {
  return item.zIndex ?? 0;
}

export function newFrontZIndex(
  items: readonly ZItem[],
  targetId: string
): number {
  let maxOtherZIndex: number | null = null;
  let targetZIndex = 0;
  for (const item of items) {
    if (item.id === targetId) {
      targetZIndex = getZIndex(item);
      continue;
    }
    const zIndex = getZIndex(item);
    if (maxOtherZIndex === null || zIndex > maxOtherZIndex) {
      maxOtherZIndex = zIndex;
    }
  }
  if (maxOtherZIndex === null) return targetZIndex;
  return targetZIndex > maxOtherZIndex ? targetZIndex : maxOtherZIndex + 1;
}

export function newBackZIndex(
  items: readonly ZItem[],
  targetId: string
): number {
  let minOtherZIndex: number | null = null;
  let targetZIndex = 0;
  for (const item of items) {
    if (item.id === targetId) {
      targetZIndex = getZIndex(item);
      continue;
    }
    const zIndex = getZIndex(item);
    if (minOtherZIndex === null || zIndex < minOtherZIndex) {
      minOtherZIndex = zIndex;
    }
  }
  if (minOtherZIndex === null) return targetZIndex;
  return targetZIndex < minOtherZIndex ? targetZIndex : minOtherZIndex - 1;
}
