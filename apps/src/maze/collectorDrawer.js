import Drawer from './drawer';
let SVG_NS = require('../constants').SVG_NS;
let cellId = require('./mazeUtils').cellId;

const SQUARE_SIZE = 50;

export default class CollectorDrawer extends Drawer {
  shouldUpdateItemImage(row, col, running) {
    return this.map_.currentStaticGrid[row][col].getOriginalValue();
  }

  updateItemImage(row, col, running) {
    if (this.shouldUpdateItemImage(row, col, running)) {
      super.updateItemImage(row, col, running);
      this.updateCounter_(row, col);
    }
  }

  updateCounter_(row, col) {
    let prefix = 'counter';
    let counterText = this.map_.getValue(row, col) || null;
    var counterElement = document.getElementById(cellId(prefix, row, col));
    if (!counterElement) {
      // we want an element, so let's create one
      counterElement = this.createText(prefix, row, col, counterText);
    }
    counterElement.firstChild.nodeValue = counterText;
  }

  updateImageWithIndex_(prefix, row, col) {
    let img = super.updateImageWithIndex_(prefix, row, col);
    let val = this.map_.getValue(row, col);
    img.setAttribute('visibility', val ? 'visible' : 'hidden');
    return img;
  }

  createText(prefix, row, col, counterText) {
    var pegmanElement = document.getElementsByClassName('pegman-location')[0];
    var svg = document.getElementById('svgMaze');

    // Create text.
    var hPadding = 2;
    var vPadding = 2;
    var text = document.createElementNS(SVG_NS, 'text');
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
