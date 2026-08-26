/**
 * Defines a new Maze Level sub-type: Collector.
 *
 * Collector levels are simple Maze levels that define a set of
 * collectible items on the screen which the user can programmatically
 * collect, and which strictly enforce the concept of block limits.
 *
 * Success is primarily determined by remaining within the block limit,
 * and secondarily determined by collecting at least one of the
 * available collectibles.
 */

import Cell from './Cell';
import CollectorDrawer from './CollectorDrawer';
import type {Skin} from './skin';
import Subtype from './Subtype';

class Collector<T extends Cell> extends Subtype<T, CollectorDrawer<T>> {
  collectSoundsCount?: number;
  collectSoundsI?: number;

  /** @fires collected */
  scheduleDirtChange(row: number, col: number) {
    super.scheduleDirtChange(row, col);

    // Play one of our various collect sounds, looping through them
    if (this.collectSoundsCount) {
      this.collectSoundsI = this.collectSoundsI || 0;
      this.playAudio_('collect' + this.collectSoundsI);
      this.collectSoundsI += 1;
      this.collectSoundsI %= this.collectSoundsCount;
    }
    this.emit('collected', this.getTotalCollected());
  }

  /** @override */
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
   * @return Whether or not this attempt was successful
   */
  tryCollect(row: number, col: number): boolean {
    const currVal = this.maze_.map?.getValue(row, col);

    if (currVal === undefined || currVal < 1) {
      this.emit('collectedTooMany');
      return false;
    }

    this.maze_.map?.setValue(row, col, currVal - 1);
    return true;
  }

  /**
   * @return The number of collectibles collected
   */
  getTotalCollected(): number {
    let count = 0;
    this.maze_.map?.forEachCell((cell: Cell, _x: number, _y: number) => {
      if (cell.isDirt()) {
        count += (cell.getOriginalValue() || 0) - (cell.getCurrentValue() || 0);
      }
    });
    return count;
  }

  /** @override */
  loadAudio(skin: Skin) {
    if (skin.collectSounds) {
      this.collectSoundsCount = skin.collectSounds.length;
      skin.collectSounds.forEach((sounds: string[], i: number) => {
        this.maze_.loadAudio(sounds, 'collect' + i);
      });
    }
  }

  /** @override */
  createDrawer(svg: SVGSVGElement) {
    if (this.maze_.map) {
      this.drawer = new CollectorDrawer(this.maze_.map, this.skin_.goal, svg);
    }
  }

  /** @override */
  getEmptyTile() {
    return 'null0';
  }

  /** @override */
  drawTile(
    svg: SVGSVGElement,
    tileSheetLocation: [number, number],
    row: number,
    col: number,
    tileId: string,
  ) {
    super.drawTile(svg, tileSheetLocation, row, col, tileId);
    this.drawCorners(svg, row, col, tileId);
  }

  drawCorners(svg: SVGSVGElement, row: number, col: number, tileId: string) {
    const corners: {
      [key: string]: [number, number];
    } = {
      NE: [1, -1],
      NW: [-1, -1],
      SE: [1, 1],
      SW: [-1, 1],
    };

    const SVG_NS = 'http://www.w3.org/2000/svg';
    const SQUARE_SIZE = 50;

    const pegmanElement = svg.getElementsByClassName('pegman-location')[0];

    if (!this.isWallOrOutOfBounds_(col, row)) {
      Object.keys(corners)
        .filter((corner: keyof typeof corners) => {
          // we need a corner if there is a wall in the corner direction and open
          // space in the two cardinal directions "surrounding" the corner
          const direction: [number, number] = corners[corner];
          const needsCorner =
            !this.isWallOrOutOfBounds_(col + direction[0], row) &&
            !this.isWallOrOutOfBounds_(col, row + direction[1]) &&
            this.isWallOrOutOfBounds_(col + direction[0], row + direction[1]);

          return needsCorner;
        })
        .forEach(corner => {
          const tileClip = document.createElementNS(SVG_NS, 'clipPath');
          tileClip.setAttribute('id', `tileCorner${corner}ClipPath${tileId}`);
          const tileClipRect = document.createElementNS(SVG_NS, 'rect');
          tileClipRect.setAttribute('width', (SQUARE_SIZE / 2).toString());
          tileClipRect.setAttribute('height', (SQUARE_SIZE / 2).toString());

          // clip the asest to only the quadrant we care about
          const direction = corners[corner];
          tileClipRect.setAttribute(
            'x',
            (
              col * SQUARE_SIZE +
              ((direction[0] + 1) * SQUARE_SIZE) / 4
            ).toString(),
          );
          tileClipRect.setAttribute(
            'y',
            (
              row * SQUARE_SIZE +
              ((direction[1] + 1) * SQUARE_SIZE) / 4
            ).toString(),
          );
          tileClip.appendChild(tileClipRect);
          svg.appendChild(tileClip);

          // Create image.
          const img = document.createElementNS(SVG_NS, 'image');
          img.setAttributeNS(
            'http://www.w3.org/1999/xlink',
            'xlink:href',
            this.skin_.corners || '',
          );
          img.setAttribute('height', SQUARE_SIZE.toString());
          img.setAttribute('width', SQUARE_SIZE.toString());
          img.setAttribute('x', (SQUARE_SIZE * col).toString());
          img.setAttribute('y', (SQUARE_SIZE * row).toString());
          img.setAttribute('id', `tileCorner${corner}${tileId}`);
          img.setAttribute('clip-path', `url(#${tileClip.id})`);
          svg.insertBefore(img, pegmanElement);
        });
    }
  }
}

export default Collector;
