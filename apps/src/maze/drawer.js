/**
 * @fileoverview Base class for drawing the various Maze Skins (Bee,
 * Farmer, Collector). Intended to be inherited from to provide
 * skin-specific functionality.
 */

import { SVG_NS } from '../constants';

const SQUARE_SIZE = 50;

/**
 * @param {MaseMap} map The map from the maze, which shows the current
 *        state of the dirt, flowers/honey, or treasure.
 * @param {string} asset the asset url to draw
 */
export default class Drawer {
  constructor(map, asset) {
    this.map_ = map;
    this.asset_ = asset;
  }

  /**
  * Generalized function for generating ids for cells in a table
  */
  static cellId(row, col, prefix='') {
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
  getAsset(row, col, prefix='') {
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
    return this.drawImage_(row, col);
  }

  /**
   * Creates/Update the image at the given row,col with the given prefix
   * @param {number} row
   * @param {number} col
   * @param {string} prefix
   * @return {Element} img
   */
  drawImage_(row, col, prefix='') {
    let img = document.getElementById(Drawer.cellId(row, col, prefix));
    let href = this.getAsset(row, col, prefix);

    // if we have not already created this image and don't want one,
    // return
    if (!img && !href) {
      return;
    }

    // otherwise create the image if we don't already have one, update
    // the href to whatever we want it to be, and hide it if we don't
    // have one
    img = this.getOrCreateImage_(row, col, prefix);
    img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', href || '');
    img.setAttribute('visibility', href ? 'visible' : 'hidden');

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
  getOrCreateImage_(row, col, prefix='', createClipPath=true) {
    let href = this.getAsset(row, col, prefix);

    // Don't create an empty image
    if (!href) {
      return;
    }

    let imgId = Drawer.cellId(row, col, prefix);

    // Don't create an image if one with this identifier already exists
    if (document.getElementById(imgId)) {
      return document.getElementById(imgId);
    }

    let pegmanElement = document.getElementsByClassName('pegman-location')[0];
    let svg = document.getElementById('svgMaze');

    let clipId;
    // Create clip path.
    if (createClipPath) {
      clipId = Drawer.cellId(row, col, prefix + 'Clip');
      let clip = document.createElementNS(SVG_NS, 'clipPath');
      clip.setAttribute('id', clipId);
      let rect = document.createElementNS(SVG_NS, 'rect');
      rect.setAttribute('x', col * SQUARE_SIZE);
      rect.setAttribute('y', row * SQUARE_SIZE);
      rect.setAttribute('width', SQUARE_SIZE);
      rect.setAttribute('height', SQUARE_SIZE);
      clip.appendChild(rect);
      svg.insertBefore(clip, pegmanElement);
    }

    // Create image.
    let img = document.createElementNS(SVG_NS, 'image');
    img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', href);
    img.setAttribute('height', SQUARE_SIZE);
    img.setAttribute('width', SQUARE_SIZE);
    img.setAttribute('x', SQUARE_SIZE * col);
    img.setAttribute('y', SQUARE_SIZE * row);
    img.setAttribute('id', imgId);
    if (createClipPath) {
      img.setAttribute('clip-path', 'url(#' + clipId + ')');
    }
    svg.insertBefore(img, pegmanElement);

    return img;
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

Drawer.SVG_NS = SVG_NS;
Drawer.SQUARE_SIZE = SQUARE_SIZE;
