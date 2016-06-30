/**
 * @fileoverview Base class for drawing the various Maze Skins (Bee,
 * Farmer, Collector). Intended to be inherited from to provide
 * skin-specific functionality.
 */

import { SVG_NS } from '../constants';
import { cellId } from './mazeUtils';

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
   * call Maze.gridItemDrawer.reset() blindly. Overridden by BeeItemDrawer
   */
  reset() {}

  /**
   * Update the image at the given row,col
   * @param {number} row
   * @param {number} col
   * @param {boolean} running
   */
  updateItemImage(row, col, running) {
    this.updateImageWithIndex_('', row, col);
  }

  /**
   * Creates/Update the image at the given row,col with the given prefix
   * @param {string} prefix
   * @param {number} row
   * @param {number} col
   * @return {Element} img
   */
  updateImageWithIndex_(prefix, row, col) {
    let img = document.getElementById(cellId(prefix, row, col));
    let href = this.getAsset(prefix, row, col);

    // if we have not already created this image and don't want one,
    // return
    if (!img && !href) {
      return;
    }

    // otherwise create the image if we don't already have one, update
    // the href to whatever we want it to be, and hide it if we don't
    // have one
    img = img || this.createImage_(prefix, row, col);
    img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', href);
    img.setAttribute('visibility', href ? 'visible' : 'hidden');

    return img;
  }

  /**
   * Creates a new image and clipPath
   * @param {string} prefix
   * @param {number} row
   * @param {number} col
   * @return {Element} img
   */
  createImage_(prefix, row, col) {
    let href = this.getAsset(prefix, row, col);

    // Don't create an empty image
    if (!href) {
      return;
    }

    // Don't create an image if one with this identifier already exists
    if (document.getElementById(cellId(prefix, row, col))) {
      return;
    }

    let pegmanElement = document.getElementsByClassName('pegman-location')[0];
    let svg = document.getElementById('svgMaze');

    let clipId = cellId(prefix + 'Clip', row, col);
    let imgId = cellId(prefix, row, col);

    // Create clip path.
    let clip = document.createElementNS(SVG_NS, 'clipPath');
    clip.setAttribute('id', clipId);
    let rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('x', col * SQUARE_SIZE);
    rect.setAttribute('y', row * SQUARE_SIZE);
    rect.setAttribute('width', SQUARE_SIZE);
    rect.setAttribute('height', SQUARE_SIZE);
    clip.appendChild(rect);
    svg.insertBefore(clip, pegmanElement);

    // Create image.
    let img = document.createElementNS(SVG_NS, 'image');
    img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', href);
    img.setAttribute('height', SQUARE_SIZE);
    img.setAttribute('width', SQUARE_SIZE);
    img.setAttribute('x', SQUARE_SIZE * col);
    img.setAttribute('y', SQUARE_SIZE * row);
    img.setAttribute('clip-path', 'url(#' + clipId + ')');
    img.setAttribute('id', imgId);
    svg.insertBefore(img, pegmanElement);

    return img;
  }
}
