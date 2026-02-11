import type Bee from './Bee';
import BeeCell from './BeeCell';
import {SVG_NS} from './constants';
import Drawer, {SQUARE_SIZE} from './Drawer';
import MazeMap from './MazeMap';
import type {Skin} from './skin';

/**
 * Extends Drawer to draw flowers/honeycomb for bee.
 */
class BeeItemDrawer extends Drawer<BeeCell> {
  private skin_: Skin;
  private bee_: Bee;
  private clouded_?: boolean[][];

  constructor(map: MazeMap<BeeCell>, skin: Skin, svg: SVGSVGElement, bee: Bee) {
    super(map, '', svg);
    this.skin_ = skin;
    this.bee_ = bee;

    // is item currently covered by a cloud?
    this.clouded_ = undefined;
    this.resetClouded();
  }

  /**
   * @override
   */
  getAsset(prefix: string, row: number, col: number): string | undefined {
    switch (prefix) {
      case 'cloud':
        return this.skin_.cloud;
      case 'cloudAnimation':
        return this.skin_.cloudAnimation;
      case 'beeItem':
        if (this.bee_.isHive(row, col, false)) {
          return this.skin_.honey;
        } else if (this.bee_.isFlower(row, col, false)) {
          return this.flowerImageHref_(row, col);
        }
    }
  }

  /**
   * Generic reset function, shared by DirtDrawer so that we can call
   * drawer.reset() without regard for the actual implementation.
   * @override
   */
  reset() {
    this.resetClouded();
  }

  /**
   * Resets our tracking of clouded/revealed squares. Used on
   * initialization and also to reset the drawer between randomized
   * conditionals runs.
   */
  resetClouded() {
    this.clouded_ = this.map_.currentStaticGrid.map(_ => []) as boolean[][];
  }

  /**
   * Override DirtDrawer's updateItemImage.
   * @override
   */
  updateItemImage(
    row: number,
    col: number,
    running: boolean,
    _squareSize: number = SQUARE_SIZE,
  ): SVGImageElement | undefined {
    const isCloudable = this.bee_.isCloudable(row, col);
    const isClouded = !running && isCloudable;
    const wasClouded = isCloudable && this.clouded_?.[row]?.[col] === true;

    let counterText;
    const ABS_VALUE_UNLIMITED = 99; // Repesents unlimited nectar/honey.
    const ABS_VALUE_ZERO = 98; // Represents zero nectar/honey.
    const absVal = Math.abs(this.bee_.getValue(row, col) || 0);
    if (isClouded || isNaN(absVal)) {
      counterText = '';
    } else if (!running && this.bee_.isPurpleFlower(row, col)) {
      // Initially, hide counter values of purple flowers.
      counterText = '?';
    } else if (absVal === ABS_VALUE_UNLIMITED) {
      counterText = '';
    } else if (absVal === ABS_VALUE_ZERO) {
      counterText = '0';
    } else {
      counterText = '' + absVal;
    }

    // Display the images.
    const img = this.drawImage_('beeItem', row, col);
    this.updateOrCreateText_('counter', row, col, img ? counterText : '');

    if (isClouded) {
      this.showCloud_(row, col);
      if (this.clouded_) {
        this.clouded_[row][col] = true;
      }
    } else if (wasClouded) {
      this.hideCloud_(row, col);
      if (this.clouded_) {
        this.clouded_[row][col] = false;
      }
    }

    return img;
  }

  flowerImageHref_(row: number, col: number): string | undefined {
    return this.bee_.isRedFlower(row, col)
      ? this.skin_.redFlower
      : this.skin_.purpleFlower;
  }

  /**
   * Show the cloud icon.
   */
  showCloud_(row: number, col: number) {
    this.drawImage_('cloud', row, col);

    // Make sure the animation is cached by the browser.
    this.displayCloudAnimation_(row, col, false /* animate */);
  }

  /**
   * Hide the cloud icon, and display the cloud hiding animation.
   */
  hideCloud_(row: number, col: number) {
    const cloudElement = document.getElementById(
      Drawer.cellId('cloud', row, col),
    );
    if (cloudElement) {
      cloudElement.setAttribute('visibility', 'hidden');
    }

    this.displayCloudAnimation_(row, col, true /* animate */);
  }

  /**
   * Create the cloud animation element, and perform the animation if necessary
   */
  displayCloudAnimation_(row: number, col: number, animate: boolean) {
    const cloudAnimation = this.getOrCreateImage_(
      'cloudAnimation',
      row,
      col,
      false,
    );

    // We want to create the element event if we're not animating yet so that we
    // can make sure it gets loaded.
    cloudAnimation?.setAttribute('visibility', animate ? 'visible' : 'hidden');
  }

  /**
   * Draw our checkerboard tile, making path tiles lighter. For non-path tiles, we
   * want to be sure that the checkerboard square is below the tile element (i.e.
   * the trees).
   */
  addCheckerboardTile(row: number, col: number, isPath: boolean) {
    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('width', SQUARE_SIZE.toString());
    rect.setAttribute('height', SQUARE_SIZE.toString());
    rect.setAttribute('x', (col * SQUARE_SIZE).toString());
    rect.setAttribute('y', (row * SQUARE_SIZE).toString());
    rect.setAttribute('fill', '#78bb29');
    rect.setAttribute('opacity', isPath ? '0.2' : '0.5');
    if (isPath) {
      this.svg_.appendChild(rect);
    } else {
      const tile = this.svg_.querySelector(`#tileElement${row * 8 + col}`);
      this.svg_.insertBefore(rect, tile);
    }
  }
}

export default BeeItemDrawer;
