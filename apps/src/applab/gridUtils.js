/**
 * A couple of utility functions for dealing with our design mode grid.
 */

var GRID_SIZE = 5;

/**
 * @typedef TopLeft
 * @type Object
 * @property {number} top
 * @property {number} left
 */

/**
 * Given an element being dragged, determine the scaled x/y position of the
 * top left corned, scaled to our visualization.
 * @param {jQueryObject} draggedElement
 * @return {TopLeft}
 */
module.exports.scaledDropPoint = function (draggedElement) {
  var div = document.getElementById('designModeViz');

  var boundingRect = div.getBoundingClientRect();
  var draggedOffset = draggedElement.offset();


  var xScale = boundingRect.width / div.offsetWidth;
  var yScale = boundingRect.height / div.offsetHeight;

  var left = (draggedOffset.left - boundingRect.left) / xScale;
  var top = (draggedOffset.top - boundingRect.top) / yScale;

  // snap top-left corner to nearest location in the grid
  left = this.snapToGridSize(left);
  top = this.snapToGridSize(top);

  return {
    left: left,
    top: top
  };
};

/**
 * Given a coordinate on either axis and a grid size, returns a coordinate
 * near the given coordinate that snaps to the given grid size.
 * @param {number} coordinate
 * @returns {number}
 */
module.exports.snapToGridSize = function (coordinate) {
  var halfGrid = GRID_SIZE / 2;
  return coordinate - ((coordinate + halfGrid) % GRID_SIZE - halfGrid);
};
