import Cell from './Cell';
import Drawer, {SQUARE_SIZE} from './Drawer';

/**
 * Extends Drawer to draw collectibles for Collector
 */
class CollectorDrawer<T extends Cell> extends Drawer<T> {
  /** @override */
  drawImage_(
    prefix: string,
    row: number,
    col: number,
  ): SVGImageElement | undefined {
    const img = super.drawImage_(prefix, row, col);
    const val = this.map_.getValue(row, col);
    if (img) {
      img.setAttribute('visibility', val ? 'visible' : 'hidden');
    }
    return img;
  }

  /** @override */
  updateItemImage(
    row: number,
    col: number,
    running: boolean = false,
    squareSize: number = SQUARE_SIZE,
  ): SVGImageElement | undefined {
    if (this.shouldUpdateItemImage(row, col)) {
      // update image
      const ret = super.updateItemImage(row, col, running, squareSize);

      // update counter
      const counterText = this.map_.getValue(row, col)?.toString() || '';
      this.updateOrCreateText_('counter', row, col, counterText);
      return ret;
    }
  }

  /**
   * Should the specified row and column be updated?
   */
  shouldUpdateItemImage(row: number, col: number): boolean {
    const cell = this.map_.getCell(row, col);
    return !!(cell && cell.getOriginalValue());
  }
}

export default CollectorDrawer;
