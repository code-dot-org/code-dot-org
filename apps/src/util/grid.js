
/**
 * Given a mouse position (in the same coordinate space as container), returns
 * whether or not the position is within the bounds of container
 * @param {number} mouseX
 * @param {number} mouseY
 * @param {number} containerWidth
 * @param {number} containerHeight
 * @returns {boolean} True if the position is within bounds of container. False otherwise.
 */
export function isMouseInBounds(mouseX, mouseY, containerWidth, containerHeight) {
  return (mouseX >= 0) && (mouseX <= containerWidth) &&
         (mouseY >= 0) && (mouseY <= containerHeight);
}
