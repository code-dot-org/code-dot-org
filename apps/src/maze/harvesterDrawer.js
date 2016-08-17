import Drawer from './drawer';
import { cellId } from './mazeUtils';
import { SVG_NS } from '../constants';
const SQUARE_SIZE = 50;

export default class HarvesterDrawer extends Drawer {
  constructor(map, skin, subtype) {
    super(map, '');
    this.skin_ = skin;
    this.subtype_ = subtype;
  }

  /**
   * @override
   */
  getAsset(prefix, row, col) {
    switch (prefix) {
      case 'sprout':
        return this.skin_.sprout;
      case 'crop':
        var crop = this.subtype_.getCell(row, col).featureName();
        return this.skin_[crop];
    }
  }

  /**
   * Override DirtDrawer's updateItemImage.
   * @override
   * @param {number} row
   * @param {number} col
   * @param {boolean} running Is user code currently running
   */
  updateItemImage(row, col, running) {
    let variableCell = this.map_.getVariableCell(row, col);
    let cell = this.map_.getCell(row, col);

    if (!variableCell.hasValue()) {
      return;
    }

    if (cell.startsHidden() && !running) {
      this.show('sprout', row, col);
      this.hide('crop', row, col);
      this.hide('counter', row, col);
    } else {
      if (cell.getCurrentValue() > 0) {
        this.show('crop', row, col);
        this.updateCounter(row, col, cell.getCurrentValue());
      } else {
        this.hide('crop', row, col);
        this.hide('counter', row, col);
      }
      this.hide('sprout', row, col);
    }
  }

  hide(prefix, row, col) {
    var element = document.getElementById(cellId(prefix, row, col));
    if (element) {
      element.setAttribute('visibility', 'hidden');
    }
  }

  show(prefix, row, col) {
    this.updateImageWithIndex_(prefix, row, col);
  }

  /**
   * @override
   */
  updateCounter(row, col, counterText) {
    var counterElement = document.getElementById(cellId('counter', row, col));
    if (!counterElement) {
      // we want an element, so let's create one
      counterElement = this.createText('counter', row, col, counterText);
    }
    counterElement.firstChild.nodeValue = counterText;
    counterElement.setAttribute('visibility', 'visible');
  }

  /**
   * @override
   */
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
    text.setAttribute('id', cellId('counter', row, col));
    text.setAttribute('class', 'bee-counter-text');
    text.appendChild(document.createTextNode(counterText));
    svg.insertBefore(text, pegmanElement);

    return text;
  }

}
