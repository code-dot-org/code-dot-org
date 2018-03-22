import Drawer, { SQUARE_SIZE } from './drawer';

// The number line is [-inf, min, min+1, ... no zero ..., max-1, max, +inf]
const DIRT_MAX = 10;
const DIRT_COUNT = DIRT_MAX * 2 + 2;
const ASSET_UNCLIPPED_WIDTH = SQUARE_SIZE * DIRT_COUNT;

/**
 * Extends Drawer to draw dirt piles for Farmer.
 */
export default class DirtDrawer extends Drawer {
  constructor(map, dirtAsset, svg) {
    super(map, dirtAsset, svg);
  }

  getAsset(prefix, row, col) {
    let val = this.map_.getValue(row, col) || 0;
    return (val === 0) ? undefined : super.getAsset(prefix, row, col);
  }

  /**
   * @override
   */
  updateItemImage(row, col, running) {
    let img = super.updateItemImage(row, col, running);

    if (!img) {
      return;
    }

    let val = this.map_.getValue(row, col) || 0;

    // If the cell is a variable cell and we are not currently running,
    // draw it as either a max-height pile or a max-depth pit.
    // Also draw a "?"; other numbers are automatically included in the image
    if (this.map_.getVariableCell(row, col).isVariable()) {
      if (running) {
        this.updateOrCreateText_('counter', row, col, '');
      } else {
        val = (val < 0) ? -11 : 11;
        this.updateOrCreateText_('counter', row, col, '?');
      }
    }

    let spriteIndex = DirtDrawer.spriteIndexForDirt(val);
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
  getOrCreateImage_(prefix, row, col) {
    let img = super.getOrCreateImage_(prefix, row, col);
    img && img.setAttribute('width', ASSET_UNCLIPPED_WIDTH);
    return img;
  }

  /**
   * Given a dirt value, returns the index of the sprite to use in our spritesheet.
   * Returns -1 if we want to display no sprite.
   * @param {number} val
   * @return {number}
   */
  static spriteIndexForDirt(val) {
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
