/**
 * @fileoverview Base class for drawing the various Maze Skins (Bee,
 * Farmer, Collector). Intended to be inherited from to provide
 * skin-specific functionality.
 */

export const SQUARE_SIZE = 50;
export const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * @param {MaseMap} map The map from the maze, which shows the current
 *        state of the dirt, flowers/honey, or treasure.
 * @param {string} asset the asset url to draw
 */
export default class Drawer {
  constructor(map, asset, svg) {
    this.map_ = map;
    this.asset_ = asset;
    this.svg_ = svg;
  }

  /**
  * Generalized function for generating ids for cells in a table
  */
  static cellId(prefix, row, col) {
    return prefix + '_' + row + '_' + col;
  }

  /**
   * Return the appropriate asset url for the given location. Overridden
   * by child classes to do much more interesting things.
   * @param {string} prefix
   * @param {number} row
   * @param {number} col
   * @return {string} asset url
   */
  getAsset(prefix, row, col) {
    return this.asset_;
  }

  /**
   * Intentional noop function; BeeItemDrawer needs to be able to reset
   * between runs, so we implement a shared reset function so that we can
   * call drawer.reset() blindly. Overridden by BeeItemDrawer
   */
  reset() {}

  /**
   * Update the image at the given row,col
   * @param {number} row
   * @param {number} col
   * @param {boolean} running
   */
  updateItemImage(row, col, running) {
    return this.drawImage_('', row, col);
  }

  /**
   * Creates/Update the image at the given row,col with the given prefix
   * @param {string} prefix
   * @param {number} row
   * @param {number} col
   * @return {Element} img
   */
  drawImage_(prefix, row, col) {
    let img = this.svg_.querySelector('#' + Drawer.cellId(prefix, row, col));
    let href = this.getAsset(prefix, row, col);

    // if we have not already created this image and don't want one,
    // return
    if (!img && !href) {
      return;
    }

    // otherwise create the image if we don't already have one, update
    // the href to whatever we want it to be, and hide it if we don't
    // have one
    img = this.getOrCreateImage_(prefix, row, col);
    if (img) {
      img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', href || '');
      img.setAttribute('visibility', href ? 'visible' : 'hidden');
    }

    return img;
  }

  /**
   * Creates a new image and optional clipPath, or returns the image if
   * it already exists
   * @param {string} prefix
   * @param {number} row
   * @param {number} col
   * @param {boolean} createClipPath
   * @return {Element} img
   */
  getOrCreateImage_(prefix, row, col, createClipPath=true) {
    let href = this.getAsset(prefix, row, col);

    let imgId = Drawer.cellId(prefix, row, col);

    // Don't create an image if one with this identifier already exists
    let img = this.svg_.querySelector('#' + imgId);
    if (img) {
      return img;
    }

    // Don't create an empty image
    if (!href) {
      return;
    }

    let pegmanElement = this.svg_.getElementsByClassName('pegman-location')[0];

    let clipId;
    // Create clip path.
    if (createClipPath) {
      clipId = Drawer.cellId(prefix + 'Clip', row, col);
      let clip = document.createElementNS(SVG_NS, 'clipPath');
      clip.setAttribute('id', clipId);
      let rect = document.createElementNS(SVG_NS, 'rect');
      rect.setAttribute('x', col * SQUARE_SIZE);
      rect.setAttribute('y', row * SQUARE_SIZE);
      rect.setAttribute('width', SQUARE_SIZE);
      rect.setAttribute('height', SQUARE_SIZE);
      clip.appendChild(rect);
      this.svg_.insertBefore(clip, pegmanElement);
    }

    // Create image.
    img = document.createElementNS(SVG_NS, 'image');
    img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', href);
    img.setAttribute('height', SQUARE_SIZE);
    img.setAttribute('width', SQUARE_SIZE);
    img.setAttribute('x', SQUARE_SIZE * col);
    img.setAttribute('y', SQUARE_SIZE * row);
    img.setAttribute('id', imgId);
    if (createClipPath) {
      img.setAttribute('clip-path', 'url(#' + clipId + ')');
    }
    this.svg_.insertBefore(img, pegmanElement);

    return img;
  }

  /**
   * Create SVG text element for given cell
   * @param {string} prefix
   * @param {number} row
   * @param {number} col
   * @param {string} text
   */
  updateOrCreateText_(prefix, row, col, text) {
    const pegmanElement = this.svg_.getElementsByClassName('pegman-location')[0];
    let textElement = this.svg_.querySelector('#' + Drawer.cellId(prefix, row, col));

    if (!textElement) {
      // Create text.
      const hPadding = 2;
      const vPadding = 2;
      textElement = document.createElementNS(SVG_NS, 'text');
      textElement.setAttribute('class', 'karel-counter-text');

      // Position text just inside the bottom right corner.
      textElement.setAttribute('x', (col + 1) * SQUARE_SIZE - hPadding);
      textElement.setAttribute('y', (row + 1) * SQUARE_SIZE - vPadding);
      textElement.setAttribute('id', Drawer.cellId(prefix, row, col));
      textElement.appendChild(document.createTextNode(''));
      this.svg_.insertBefore(textElement, pegmanElement);
    }

    textElement.firstChild.nodeValue = text;
    return textElement;
  }

  /**
   * Draw the given tile at row, col
   */
  drawTile(svg, tileSheetLocation, row, col, tileId, tileSheetHref) {
    const [left, top] = tileSheetLocation;

    const tileSheetWidth = SQUARE_SIZE * 5;
    const tileSheetHeight = SQUARE_SIZE * 4;

    // Tile's clipPath element.
    const tileClip = document.createElementNS(SVG_NS, 'clipPath');
    tileClip.setAttribute('id', 'tileClipPath' + tileId);
    const tileClipRect = document.createElementNS(SVG_NS, 'rect');
    tileClipRect.setAttribute('width', SQUARE_SIZE);
    tileClipRect.setAttribute('height', SQUARE_SIZE);

    tileClipRect.setAttribute('x', col * SQUARE_SIZE);
    tileClipRect.setAttribute('y', row * SQUARE_SIZE);
    tileClip.appendChild(tileClipRect);
    svg.appendChild(tileClip);

    // Tile sprite.
    const tileElement = document.createElementNS(SVG_NS, 'image');
    tileElement.setAttribute('id', 'tileElement' + tileId);
    tileElement.setAttributeNS('http://www.w3.org/1999/xlink',
                              'xlink:href', tileSheetHref);
    tileElement.setAttribute('height', tileSheetHeight);
    tileElement.setAttribute('width', tileSheetWidth);
    tileElement.setAttribute('clip-path',
                            'url(#tileClipPath' + tileId + ')');
    tileElement.setAttribute('x', (col - left) * SQUARE_SIZE);
    tileElement.setAttribute('y', (row - top) * SQUARE_SIZE);
    svg.appendChild(tileElement);

    // Tile animation
    const tileAnimation = document.createElementNS(SVG_NS, 'animate');
    tileAnimation.setAttribute('id', 'tileAnimation' + tileId);
    tileAnimation.setAttribute('attributeType', 'CSS');
    tileAnimation.setAttribute('attributeName', 'opacity');
    tileAnimation.setAttribute('from', 1);
    tileAnimation.setAttribute('to', 0);
    tileAnimation.setAttribute('dur', '1s');
    tileAnimation.setAttribute('begin', 'indefinite');
    tileElement.appendChild(tileAnimation);
  }
}
