/**
 * @fileoverview defines a new Maze Level sub-type: Collector.
 * Collector levels are simple Maze levels that define a set of
 * collectible items on the screen which the user can programmatically
 * collect, and which strictly enforce the concept of block limits.
 * Success is primarily determined by remaining within the block limit,
 * and secondarily determined by collecting at least one of the
 * available collectibles.
 */


import Subtype from './subtype';
import CollectorDrawer from './collectorDrawer';

export default class Collector extends Subtype {
  /**
   * @fires collected
   */
  scheduleDirtChange(row, col) {
    super.scheduleDirtChange(row, col);

    // Play one of our various collect sounds, looping through them
    if (this.collectSoundsCount) {
      this.collectSoundsI = this.collectSoundsI || 0;
      this.playAudio_('collect' + this.collectSoundsI);
      this.collectSoundsI += 1;
      this.collectSoundsI %= this.collectSoundsCount;
    }
    this.emit("collected", this.getTotalCollected());
  }

  /**
   * @override
   */
  isCollector() {
    return true;
  }

  /**
   * Attempt to collect from the specified location; terminate the execution if
   * there is nothing there to collect.
   *
   * Note that the animation for this action is handled by the default
   * "scheduleDig" operation
   *
   * @fires collectedTooMany
   * @return {boolean} whether or not this attempt was successful
   */
  tryCollect(row, col) {
    const currVal = this.maze_.map.getValue(row, col);

    if (currVal === undefined || currVal < 1) {
      this.emit('collectedTooMany');
      return false;
    }

    this.maze_.map.setValue(row, col, currVal - 1);
    return true;
  }

  /**
   * @return {number} The number of collectibles collected
   */
  getTotalCollected() {
    let count = 0;
    this.maze_.map.forEachCell((cell, x, y) => {
      if (cell.isDirt()) {
        count += (cell.getOriginalValue() - cell.getCurrentValue());
      }
    });
    return count;
  }

  /**
   * @override
   */
  loadAudio(skin) {
    if (skin.collectSounds) {
      this.collectSoundsCount = skin.collectSounds.length;
      skin.collectSounds.forEach((sound, i) => {
        this.maze_.loadAudio(sound, 'collect' + i);
      });
    }
  }

  /**
   * @override
   */
  createDrawer(svg) {
    this.drawer = new CollectorDrawer(this.maze_.map, this.skin_.goal, svg);
  }

  /**
   * @override
   */
  getEmptyTile() {
    return 'null0';
  }

  /**
   * @override
   */
  drawTile(svg, tileSheetLocation, row, col, tileId) {
    super.drawTile(svg, tileSheetLocation, row, col, tileId);
    this.drawCorners(svg, row, col, tileId);
  }

  drawCorners(svg, row, col, tileId) {
    const corners = {
      'NE': [1, -1],
      'NW': [-1, -1],
      'SE': [1, 1],
      'SW': [-1, 1],
    };

    const SVG_NS = 'http://www.w3.org/2000/svg';
    const SQUARE_SIZE = 50;

    const pegmanElement = svg.getElementsByClassName('pegman-location')[0];

    if (!this.isWallOrOutOfBounds_(col, row)) {
      Object.keys(corners).filter(corner => {
        // we need a corner if there is a wall in the corner direction and open
        // space in the two cardinal directions "surrounding" the corner
        const direction = corners[corner];
        const needsCorner = !this.isWallOrOutOfBounds_(col + direction[0], row) &&
            !this.isWallOrOutOfBounds_(col, row + direction[1]) &&
            this.isWallOrOutOfBounds_(col + direction[0], row + direction[1]);

        return needsCorner;
      }).forEach(corner => {
        const tileClip = document.createElementNS(SVG_NS, 'clipPath');
        tileClip.setAttribute('id', `tileCorner${corner}ClipPath${tileId}`);
        const tileClipRect = document.createElementNS(SVG_NS, 'rect');
        tileClipRect.setAttribute('width', SQUARE_SIZE / 2);
        tileClipRect.setAttribute('height', SQUARE_SIZE / 2);

        // clip the asest to only the quadrant we care about
        const direction = corners[corner];
        tileClipRect.setAttribute('x', col * SQUARE_SIZE + (direction[0] + 1) * SQUARE_SIZE / 4);
        tileClipRect.setAttribute('y', row * SQUARE_SIZE + (direction[1] + 1) * SQUARE_SIZE / 4);
        tileClip.appendChild(tileClipRect);
        svg.appendChild(tileClip);

        // Create image.
        const img = document.createElementNS(SVG_NS, 'image');
        img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', this.skin_.corners);
        img.setAttribute('height', SQUARE_SIZE);
        img.setAttribute('width', SQUARE_SIZE);
        img.setAttribute('x', SQUARE_SIZE * col);
        img.setAttribute('y', SQUARE_SIZE * row);
        img.setAttribute('id', `tileCorner${corner}${tileId}`);
        img.setAttribute('clip-path', `url(#${tileClip.id})`);
        svg.insertBefore(img, pegmanElement);
      });
    }
  }
}
