/**
 * @param {HTMLElement} parent
 * @param {jQueryObject} child
 * @param {number} gridSize
 * @return {object}
 */
module.exports = function scaledDropPoint(parent, child, gridSize) {
  var xScale = parent.getBoundingClientRect().width / parent.offsetWidth;
  var yScale = parent.getBoundingClientRect().height / parent.offsetHeight;

  var left = (child.offset().left - $('#designModeViz').offset().left) / xScale;
  var top = (child.offset().top - $('#designModeViz').offset().top) / yScale;

  // snap top-left corner to nearest location in the grid
  left -= (left + gridSize / 2) % gridSize - gridSize / 2;
  top -= (top + gridSize / 2) % gridSize - gridSize / 2;

  return {
    left: left,
    top: top
  };
};
