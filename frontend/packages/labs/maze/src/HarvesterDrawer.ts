import Drawer, {SQUARE_SIZE} from './Drawer';
import HarvesterCell from './HarvesterCell';
import MazeMap from './MazeMap';
import type {Skin} from './skin';
import Subtype from './Subtype';

class HarvesterDrawer extends Drawer<HarvesterCell> {
  private skin_: Skin;
  private subtype_: Subtype<HarvesterCell, HarvesterDrawer>;

  constructor(
    map: MazeMap<HarvesterCell>,
    skin: Skin,
    svg: SVGSVGElement,
    subtype: Subtype<HarvesterCell, HarvesterDrawer>,
  ) {
    super(map, '', svg);
    this.skin_ = skin;
    this.subtype_ = subtype;
  }

  /** @override */
  getAsset(prefix: string, row: number, col: number): string | undefined {
    switch (prefix) {
      case 'sprout':
        return this.skin_.sprout;
      case 'crop': {
        const crop =
          (this.subtype_.getCell(row, col) as HarvesterCell)?.featureName() ||
          'unknown';
        return (
          this.skin_ as unknown as {
            [key: string]: string;
          }
        )[crop];
      }
    }
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
    const variableCell = this.map_.getVariableCell(row, col);
    const cell = this.map_.getCell(row, col) as HarvesterCell;

    if (!variableCell?.hasValue()) {
      return;
    }

    // Image
    if (cell.startsHidden() && !running) {
      this.show('sprout', row, col);
      this.hide('crop', row, col);
    } else {
      if ((cell.getCurrentValue() || 0) > 0) {
        this.show('crop', row, col);
      } else {
        this.hide('crop', row, col);
      }
      this.hide('sprout', row, col);
    }

    // Counter
    if (running) {
      if ((cell.getCurrentValue() || 0) > 0) {
        this.updateOrCreateText_(
          'counter',
          row,
          col,
          (cell.getCurrentValue() || 0).toString(),
        );
      } else {
        this.updateOrCreateText_('counter', row, col, '');
      }
    } else {
      if (cell.startsHidden()) {
        this.updateOrCreateText_('counter', row, col, '');
      } else if (variableCell.isVariableRange()) {
        this.updateOrCreateText_('counter', row, col, '?');
      } else {
        this.updateOrCreateText_(
          'counter',
          row,
          col,
          (cell.getCurrentValue() || 0).toString(),
        );
      }
    }
  }

  hide(prefix: string, row: number, col: number) {
    const element = this.getOrCreateImage_(prefix, row, col);
    if (element) {
      element.setAttribute('visibility', 'hidden');
    }
  }

  show(prefix: string, row: number, col: number) {
    this.drawImage_(prefix, row, col);
  }
}

export default HarvesterDrawer;
