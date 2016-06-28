import Drawer from './drawer';
const SQUARE_SIZE = 50;
let SVG_NS = require('../constants').SVG_NS;
let cellId = require('./mazeUtils').cellId;

/**
 * Extends Drawer to draw collectables for Collector
 */
export default class CollectorDrawer extends Drawer {

  /**
   * @override
   */
  updateImageWithIndex_(prefix, row, col) {
    let img = super.updateImageWithIndex_(prefix, row, col);
    let val = this.map_.getValue(row, col);
    img.setAttribute('visibility', val ? 'visible' : 'hidden');
    return img;
  }

  /**
   * @override
   */
  updateItemImage(row, col, running) {
    if (this.shouldUpdateItemImage(row, col, running)) {
      super.updateItemImage(row, col);
      this.updateCounter_(row, col);
    }
  }

  /**
   * Should the specified row and column be updated?
   * @param {number} row
   * @param {number} col
   * @return {boolean}
   */
  shouldUpdateItemImage(row, col) {
    let cell = this.map_.getCell(row, col);
    return cell && cell.getOriginalValue();
  }

  /**
   * Update the counter at the given row, col with the appropriate value
   * @param {number} row
   * @param {number} col
   */
  updateCounter_(row, col) {
    let prefix = 'counter';
    let counterText = this.map_.getValue(row, col) || null;
    // get or create the appropriate counter element
    let counterElement = document.getElementById(cellId(prefix, row, col))
        || this.createText(prefix, row, col, counterText);
    counterElement.firstChild.nodeValue = counterText;
  }

  /**
   * Create a new text element at the specified row and column with the
   * appropriate text
   * @param {string} prefix
   * @param {number} row
   * @param {number} col
   * @param {string} counterText
   */
  createText(prefix, row, col, counterText) {
    let pegmanElement = document.getElementsByClassName('pegman-location')[0];
    let svg = document.getElementById('svgMaze');

    // Create text.
    let hPadding = 2;
    let vPadding = 2;
    let text = document.createElementNS(SVG_NS, 'text');
    // Position text just inside the bottom right corner.
    text.setAttribute('x', (col + 1) * SQUARE_SIZE - hPadding);
    text.setAttribute('y', (row + 1) * SQUARE_SIZE - vPadding);
    text.setAttribute('id', cellId(prefix, row, col));
    text.setAttribute('class', 'bee-counter-text');
    text.appendChild(document.createTextNode(counterText));
    svg.insertBefore(text, pegmanElement);

    return text;
  }
}
