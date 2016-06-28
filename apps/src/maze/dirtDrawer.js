import Drawer from './drawer';

// The number line is [-inf, min, min+1, ... no zero ..., max-1, max, +inf]
const DIRT_MAX = 10;
const DIRT_COUNT = DIRT_MAX * 2 + 2;

const SQUARE_SIZE = 50;

/**
 * Extends Drawer to draw dirt piles for Farmer.
 */
export default class DirtDrawer extends Drawer {
  constructor(map, dirtAsset) {
    super(map, dirtAsset);
    this.assetUnclippedWidth = SQUARE_SIZE * DIRT_COUNT;
  }

  /**
   * @override
   */
  updateItemImage(row, col, running) {
    let val = this.map_.getValue(row, col) || 0;

    // If the cell is a variable cell and we are not currently running,
    // draw it as either a max-height pile or a max-depth pit.
    if (this.map_.getVariableCell(row, col).isVariable() && !running) {
      val = (val < 0) ? -11 : 11;
    }

    this.updateImageWithIndex_('dirt', row, col, this.spriteIndexForDirt_(val));
  }

  /**
   * @override
   */
  updateImageWithIndex_(prefix, row, col, spriteIndex) {
    let img = super.updateImageWithIndex_(prefix, row, col);
    if (!img) {
      return;
    }

    let hiddenImage = spriteIndex < 0;
    img.setAttribute('visibility', hiddenImage ? 'hidden' : 'visible');
    if (!hiddenImage) {
      img.setAttribute('x', SQUARE_SIZE * (col - spriteIndex));
    }
    return img;
  }

  /**
   * @override
   */
  createImage_(prefix, row, col) {
    let img = super.createImage_(prefix, row, col);
    img.setAttribute('width', this.assetUnclippedWidth);
    return img;
  }

  /**
   * Given a dirt value, returns the index of the sprite to use in our spritesheet.
   * Returns -1 if we want to display no sprite.
   * @param {number} val
   * @return {number}
   */
  spriteIndexForDirt_(val) {
    let spriteIndex;

    if (val === 0) {
      spriteIndex = -1;
    } else if (val < -DIRT_MAX) {
      spriteIndex = 0;
    } else if (val < 0) {
      spriteIndex = DIRT_MAX + val + 1;
    } else if (val > DIRT_MAX) {
      spriteIndex = DIRT_COUNT - 1;
    } else if (val > 0) {
      spriteIndex = DIRT_MAX + val;
    }

    return spriteIndex;
  }

}
