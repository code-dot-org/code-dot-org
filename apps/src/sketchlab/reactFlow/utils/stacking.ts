// Helpers for "Bring to front" / "Send to back". With React Flow's
// zIndexMode="manual", stacking is driven by each item's explicit zIndex.
// Treat undefined zIndex as 0.
//
// We exclude the target from the max/min comparison so we only bump the
// zIndex when the target isn't already strictly above (or below) the rest.
// If the target already clears the others, return its current value.

interface ZItem {
  id: string;
  zIndex?: number;
}

function zOf(item: ZItem): number {
  return item.zIndex ?? 0;
}

export function nextFrontZIndex(
  items: readonly ZItem[],
  targetId: string
): number {
  let maxOther: number | null = null;
  let targetZ = 0;
  for (const item of items) {
    if (item.id === targetId) {
      targetZ = zOf(item);
      continue;
    }
    const z = zOf(item);
    if (maxOther === null || z > maxOther) {
      maxOther = z;
    }
  }
  if (maxOther === null) return targetZ;
  return targetZ > maxOther ? targetZ : maxOther + 1;
}

export function nextBackZIndex(
  items: readonly ZItem[],
  targetId: string
): number {
  let minOther: number | null = null;
  let targetZ = 0;
  for (const item of items) {
    if (item.id === targetId) {
      targetZ = zOf(item);
      continue;
    }
    const z = zOf(item);
    if (minOther === null || z < minOther) {
      minOther = z;
    }
  }
  if (minOther === null) return targetZ;
  return targetZ < minOther ? targetZ : minOther - 1;
}
