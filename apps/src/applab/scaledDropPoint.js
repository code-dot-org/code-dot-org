/**
 * @param {HTMLElement} parent
 * @param {jQueryObject} draggingElement
 * @param {number} gridSize
 * @return {object}
 */
module.exports = function scaledDropPoint(parent, draggingElement, gridSize) {
  var xScale = parent.getBoundingClientRect().width / parent.offsetWidth;
  var yScale = parent.getBoundingClientRect().height / parent.offsetHeight;

  var left = (draggingElement.offset().left - $(parent).offset().left) / xScale;
  var top = (draggingElement.offset().top - $(parent).offset().top) / yScale;

  // snap top-left corner to nearest location in the grid
  left -= (left + gridSize / 2) % gridSize - gridSize / 2;
  top -= (top + gridSize / 2) % gridSize - gridSize / 2;

  return {
    left: left,
    top: top
  };
};
