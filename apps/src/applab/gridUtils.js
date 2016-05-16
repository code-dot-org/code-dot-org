/**
 * A couple of utility functions for dealing with our design mode grid.
 */

const GRID_SIZE = 5;

/**
 * @typedef {Object} TopLeft
 * @property {number} top
 * @property {number} left
 */

/**
 * Given an element being dragged, determine the scaled x/y position of the
 * top left corned, scaled to our visualization.
 * @param {jQuery} draggedElement
 * @return {TopLeft}
 */
export function scaledDropPoint(draggedElement) {
  const div = document.getElementById('designModeViz');

  const boundingRect = div.getBoundingClientRect();
  const draggedOffset = draggedElement.offset();

  const xScale = boundingRect.width / div.offsetWidth;
  const yScale = boundingRect.height / div.offsetHeight;

  let left = (draggedOffset.left - boundingRect.left) / xScale;
  let top = (draggedOffset.top - boundingRect.top) / yScale;

  // snap top-left corner to nearest location in the grid
  left = snapToGridSize(left);
  top = snapToGridSize(top);

  return {
    left: left,
    top: top
  };
}

/**
 * Get jQuery object for the element(s) currently being dragged. Will be empty
 * if no drag is currently underway.
 * @returns {jQuery}
 */
export function getDraggedElement() {
  return $('.ui-draggable-dragging');
}

/**
 * If a drag is underway, returns the target coordinates of the dragged element
 * if they were dropped right now.  If no drag is underway, returns null.
 * @returns {TopLeft|null}
 */
export function draggedElementDropPoint() {
  const draggedElement = getDraggedElement();
  if (!draggedElement.length) {
    return null;
  }
  return scaledDropPoint(draggedElement);
}

/**
 * Given a coordinate on either axis and a grid size, returns a coordinate
 * near the given coordinate that snaps to the given grid size.
 * @param {number} coordinate
 * @returns {number}
 */
export function snapToGridSize(coordinate) {
  const halfGrid = GRID_SIZE / 2;
  return coordinate - ((coordinate + halfGrid) % GRID_SIZE - halfGrid);
}
