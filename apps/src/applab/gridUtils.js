/**
 * A couple of utility functions for dealing with our design mode grid.
 */
module.exports = {
  GRID_SIZE: 5,
  /**
   * Given a dragging
   * @param {jQueryObject} draggingElement
   * @return {object}
   */
  scaledDropPoint: function (draggingElement) {
    var div = document.getElementById('designModeViz');

    var xScale = div.getBoundingClientRect().width / div.offsetWidth;
    var yScale = div.getBoundingClientRect().height / div.offsetHeight;

    var left = (draggingElement.offset().left - $(div).offset().left) / xScale;
    var top = (draggingElement.offset().top - $(div).offset().top) / yScale;

    // snap top-left corner to nearest location in the grid
    left = this.snapToGridSize(left);
    top = this.snapToGridSize(top);

    return {
      left: left,
      top: top
    };
  },

  /**
   * Given a coordinate on either axis and a grid size, returns a coordinate
   * near the given coordinate that snaps to the given grid size.
   * @param {number} coordinate
   * @param {number} GRID_SIZE
   * @returns {number}
   */
  snapToGridSize: function (coordinate) {
    var halfGrid = this.GRID_SIZE / 2;
    return coordinate - ((coordinate + halfGrid) % this.GRID_SIZE - halfGrid);
  }
};
