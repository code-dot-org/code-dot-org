import Drawer, { SQUARE_SIZE, SVG_NS } from './drawer';

/**
 * Extends Drawer to draw flowers/honeycomb for bee.
 * @param {MaseMap} map
 * @param {Object} skin The app's skin, used to get URLs for our images
 * @param {Bee} bee The maze's Bee object.
 */
export default class BeeItemDrawer extends Drawer {
  constructor(map, skin, svg, bee) {
    super(map, '', svg);
    this.skin_ = skin;
    this.bee_ = bee;

    this.honeyImages_ = [];
    this.nectarImages_ = [];
    this.pegman_ = null;

    // is item currently covered by a cloud?
    this.clouded_ = undefined;
    this.resetClouded();
  }

  /**
   * @override
   */
  getAsset(prefix, row, col) {
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
   * drawer.reset() blindly.
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
    this.clouded_ = this.map_.currentStaticGrid.map(row => []);
  }

  /**
   * Override DirtDrawer's updateItemImage.
   * @override
   * @param {number} row
   * @param {number} col
   * @param {boolean} running Is user code currently running
   */
  updateItemImage(row, col, running) {

    var isCloudable = this.bee_.isCloudable(row, col);
    var isClouded = !running && isCloudable;
    var wasClouded = isCloudable && (this.clouded_[row][col] === true);

    var counterText;
    var ABS_VALUE_UNLIMITED = 99;  // Repesents unlimited nectar/honey.
    var ABS_VALUE_ZERO = 98;  // Represents zero nectar/honey.
    var absVal = Math.abs(this.bee_.getValue(row, col));
    if (isClouded || isNaN(absVal)) {
      counterText = "";
    } else if (!running && this.bee_.isPurpleFlower(row, col)) {
      // Initially, hide counter values of purple flowers.
      counterText = "?";
    } else if (absVal === ABS_VALUE_UNLIMITED) {
      counterText = "";
    } else if (absVal === ABS_VALUE_ZERO) {
      counterText = "0";
    } else {
      counterText = "" + absVal;
    }

    // Display the images.
    let img = this.drawImage_('beeItem', row, col);
    this.updateOrCreateText_('counter', row, col, img ? counterText : '');

    if (isClouded) {
      this.showCloud_(row, col);
      this.clouded_[row][col] = true;
    } else if (wasClouded) {
      this.hideCloud_(row, col);
      this.clouded_[row][col] = false;
    }
  }

  createCounterImage_(prefix, i, row, href) {
    var id = prefix + (i + 1);
    var image = document.createElementNS(SVG_NS, 'image');
    image.setAttribute('id', id);
    image.setAttribute('width', SQUARE_SIZE);
    image.setAttribute('height', SQUARE_SIZE);
    image.setAttribute('y', row * SQUARE_SIZE);

    image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', href);

    this.svg_.insertBefore(image, this.getPegmanElement_());

    return image;
  }

  flowerImageHref_(row, col) {
    return this.bee_.isRedFlower(row, col) ? this.skin_.redFlower :
      this.skin_.purpleFlower;
  }

  updateHoneyCounter(honeyCount) {
    for (var i = 0; i < honeyCount; i++) {
      if (!this.honeyImages_[i]) {
        this.honeyImages_[i] = this.createCounterImage_('honey', i, 1,
          this.skin_.honey);
      }

      var deltaX = SQUARE_SIZE;
      if (honeyCount > 8) {
        deltaX = (8 - 1) * SQUARE_SIZE / (honeyCount - 1);
      }
      this.honeyImages_[i].setAttribute('x', i * deltaX);
    }

    for (i = 0; i < this.honeyImages_.length; i++) {
      this.honeyImages_[i].setAttribute('display', i < honeyCount ? 'block' : 'none');
    }
  }

  updateNectarCounter(nectars) {
    var nectarCount = nectars.length;
    // create any needed images
    for (var i = 0; i < nectarCount; i++) {
      var href = this.flowerImageHref_(nectars[i].row, nectars[i].col);

      if (!this.nectarImages_[i]) {
        this.nectarImages_[i] = this.createCounterImage_('nectar', i, 0, href);
      }

      var deltaX = SQUARE_SIZE;
      if (nectarCount > 8) {
        deltaX = (8 - 1) * SQUARE_SIZE / (nectarCount - 1);
      }
      this.nectarImages_[i].setAttribute('x', i * deltaX);
      this.nectarImages_[i].setAttributeNS('http://www.w3.org/1999/xlink',
        'xlink:href', href);
    }

    for (i = 0; i < this.nectarImages_.length; i++) {
      this.nectarImages_[i].setAttribute('display', i < nectarCount ? 'block' : 'none');
    }
  }

  /**
   * Cache pegman element
   */
  getPegmanElement_() {
    if (!this.pegman_) {
      this.pegman_ = document.getElementsByClassName('pegman-location')[0];
    }
    return this.pegman_;
  }

  /**
   * Show the cloud icon.
   */
  showCloud_(row, col) {
    this.drawImage_('cloud', row, col);

    // Make sure the animation is cached by the browser.
    this.displayCloudAnimation_(row, col, false /* animate */);
  }

  /**
   * Hide the cloud icon, and display the cloud hiding animation.
   */
  hideCloud_(row, col) {
    var cloudElement = document.getElementById(Drawer.cellId('cloud', row, col));
    if (cloudElement) {
      cloudElement.setAttribute('visibility', 'hidden');
    }

    this.displayCloudAnimation_(row, col, true /* animate */);
  }

  /**
   * Create the cloud animation element, and perform the animation if necessary
   */
  displayCloudAnimation_(row, col, animate) {
    let cloudAnimation = this.getOrCreateImage_('cloudAnimation', row, col, false);

    // We want to create the element event if we're not animating yet so that we
    // can make sure it gets loaded.
    cloudAnimation.setAttribute('visibility', animate ? 'visible' : 'hidden');
  }

  /**
   * Draw our checkerboard tile, making path tiles lighter. For non-path tiles, we
   * want to be sure that the checkerboard square is below the tile element (i.e.
   * the trees).
   */
  addCheckerboardTile(row, col, isPath) {
    var rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('width', SQUARE_SIZE);
    rect.setAttribute('height', SQUARE_SIZE);
    rect.setAttribute('x', col * SQUARE_SIZE);
    rect.setAttribute('y', row * SQUARE_SIZE);
    rect.setAttribute('fill', '#78bb29');
    rect.setAttribute('opacity', isPath ? 0.2 : 0.5);
    if (isPath) {
      this.svg_.appendChild(rect);
    } else {
      var tile = this.svg_.querySelector(`#tileElement${row * 8 + col}`);
      this.svg_.insertBefore(rect, tile);
    }
  }
}
