/**
 * Returns the viewport-relative offset needed to bring `element` fully
 * into view within its enclosing `.react-flow` container. Returns null
 * if the element is already fully visible or no container is found.
 *
 * Positive dx/dy mean "shift the viewport by this amount" to place the
 * element inside the visible area.
 */
export function getViewportOverflow(
  element: HTMLElement
): {dx: number; dy: number} | null {
  const container = element.closest<HTMLElement>('.react-flow');
  if (!container) return null;
  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  let dx = 0;
  let dy = 0;
  if (elementRect.left < containerRect.left) {
    dx = containerRect.left - elementRect.left;
  } else if (elementRect.right > containerRect.right) {
    dx = containerRect.right - elementRect.right;
  }
  if (elementRect.top < containerRect.top) {
    dy = containerRect.top - elementRect.top;
  } else if (elementRect.bottom > containerRect.bottom) {
    dy = containerRect.bottom - elementRect.bottom;
  }
  if (dx === 0 && dy === 0) return null;
  return {dx, dy};
}
