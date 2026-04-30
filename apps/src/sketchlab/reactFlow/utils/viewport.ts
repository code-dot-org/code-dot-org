interface VisibleAreaInsets {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

/**
 * Returns the viewport-relative offset needed to bring `element` fully
 * into view within its enclosing `.react-flow` container. Returns null
 * if the element is already fully visible or no container is found.
 *
 * Positive dx/dy mean "shift the viewport by this amount" to place the
 * element inside the visible area.
 *
 * `insets` shrinks the visible area from each edge — e.g. pass
 * `{left: 36}` to reserve 36px on the left edge.
 */
export function getViewportOverflow(
  element: HTMLElement,
  insets: VisibleAreaInsets = {}
): {dx: number; dy: number} | null {
  const container = element.closest<HTMLElement>('.react-flow');
  if (!container) return null;
  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const leftBound = containerRect.left + (insets.left ?? 0);
  const rightBound = containerRect.right - (insets.right ?? 0);
  const topBound = containerRect.top + (insets.top ?? 0);
  const bottomBound = containerRect.bottom - (insets.bottom ?? 0);
  let dx = 0;
  let dy = 0;
  if (elementRect.left < leftBound) {
    dx = leftBound - elementRect.left;
  } else if (elementRect.right > rightBound) {
    dx = rightBound - elementRect.right;
  }
  if (elementRect.top < topBound) {
    dy = topBound - elementRect.top;
  } else if (elementRect.bottom > bottomBound) {
    dy = bottomBound - elementRect.bottom;
  }
  if (dx === 0 && dy === 0) return null;
  return {dx, dy};
}
