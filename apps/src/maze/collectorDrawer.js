import Drawer from './drawer';

/**
 * Extends Drawer to draw collectibles for Collector
 */
export default class CollectorDrawer extends Drawer {

  /**
   * @override
   */
  drawImage_(prefix, row, col) {
    const img = super.drawImage_(prefix, row, col);
    const val = this.map_.getValue(row, col);
    img.setAttribute('visibility', val ? 'visible' : 'hidden');
    return img;
  }

  /**
   * @override
   */
  updateItemImage(row, col, running) {
    if (this.shouldUpdateItemImage(row, col, running)) {
      // update image
      super.updateItemImage(row, col);

      // update counter
      const counterText = this.map_.getValue(row, col) || null;
      this.updateOrCreateText_('counter', row, col, counterText);
    }
  }

  /**
   * Should the specified row and column be updated?
   * @param {number} row
   * @param {number} col
   * @return {boolean}
   */
  shouldUpdateItemImage(row, col) {
    const cell = this.map_.getCell(row, col);
    return cell && cell.getOriginalValue();
  }
}
