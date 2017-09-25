
/**
 * Given a point (in the same coordinate space as container), returns
 * whether or not the point is within the bounds of container
 * @param {number} x
 * @param {number} y
 * @param {number} containerWidth
 * @param {number} containerHeight
 * @returns {boolean} True if the position is within bounds of container. False otherwise.
 */
export function isPointInBounds(x, y, containerWidth, containerHeight) {
  return (x >= 0) && (x <= containerWidth) &&
         (y >= 0) && (y <= containerHeight);
}
