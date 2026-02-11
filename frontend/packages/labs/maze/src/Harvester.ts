import type {CellConstructor} from './Cell';
import Gatherer from './Gatherer';
import HarvesterCell, {FeatureType} from './HarvesterCell';
import HarvesterDrawer from './HarvesterDrawer';
import MazeMap from './MazeMap';
import type {Skin} from './skin';

const HARVEST_SOUND = 'harvest';

class Harvester extends Gatherer<HarvesterCell, HarvesterDrawer> {
  /** @override */
  getCellClass(): CellConstructor {
    return HarvesterCell as CellConstructor;
  }

  /** @override */
  loadAudio(skin: Skin) {
    if (skin.harvestSound) {
      this.maze_.loadAudio(skin.harvestSound, HARVEST_SOUND);
    }
  }

  /** @override */
  createDrawer(svg: SVGSVGElement) {
    if (this.maze_.map) {
      this.drawer = new HarvesterDrawer(
        this.maze_.map as MazeMap<HarvesterCell>,
        this.skin_,
        svg,
        this,
      );
    }
  }

  hasCorn(): boolean {
    return this.hasCrop(FeatureType.CORN);
  }

  hasPumpkin(): boolean {
    return this.hasCrop(FeatureType.PUMPKIN);
  }

  hasLettuce(): boolean {
    return this.hasCrop(FeatureType.LETTUCE);
  }

  hasCrop(crop: number): boolean {
    const col = this.maze_.getPegmanX() || 0;
    const row = this.maze_.getPegmanY() || 0;

    const cell = this.getCell(row, col) as HarvesterCell;
    return cell?.featureType() === crop && (cell?.getCurrentValue() || 0) > 0;
  }

  atCorn(): boolean {
    return this.atCrop(FeatureType.CORN);
  }

  atPumpkin(): boolean {
    return this.atCrop(FeatureType.PUMPKIN);
  }

  atLettuce(): boolean {
    return this.atCrop(FeatureType.LETTUCE);
  }

  atCrop(crop: number): boolean {
    const col = this.maze_.getPegmanX() || 0;
    const row = this.maze_.getPegmanY() || 0;

    const cell = this.getCell(row, col) as HarvesterCell;

    return cell.featureType() === crop;
  }

  gotCropAt(row: number, col: number) {
    const cell = this.getCell(row, col) as HarvesterCell;
    cell.setCurrentValue((cell.getCurrentValue() || 0) - 1);
  }

  tryGetCorn(): boolean {
    return this.tryGetCrop(FeatureType.CORN);
  }

  tryGetPumpkin(): boolean {
    return this.tryGetCrop(FeatureType.PUMPKIN);
  }

  tryGetLettuce(): boolean {
    return this.tryGetCrop(FeatureType.LETTUCE);
  }

  /**
   * Attempt to harvest the specified crop from the current location; terminate
   * the execution if this is not a valid place at which to get that crop.
   *
   * This method is preferred over animateGetCrop for "headless" operation (ie
   * when validating quantum levels)
   *
   * @fires wrongCrop
   * @fires emptyCrop
   */
  tryGetCrop(crop: number): boolean {
    const col = this.maze_.getPegmanX() || 0;
    const row = this.maze_.getPegmanY() || 0;

    const cell = this.getCell(row, col) as HarvesterCell;

    if (cell.featureType() !== crop) {
      this.emit('wrongCrop');
      return false;
    }

    if (cell.getCurrentValue() === 0) {
      this.emit('emptyCrop');
      return false;
    }

    this.gotCropAt(row, col);
    return true;
  }

  animateGetCorn() {
    this.animateGetCrop(FeatureType.CORN);
  }

  animateGetPumpkin() {
    this.animateGetCrop(FeatureType.PUMPKIN);
  }

  animateGetLettuce() {
    this.animateGetCrop(FeatureType.LETTUCE);
  }

  /**
   * Display the harvesting of the specified from the current location; raise a
   * runtime error if the current location is not a valid spot from which to
   * gather that crop.
   *
   * This method is preferred over tryGetCrop for live operation (ie when actually
   * displaying something to the user)
   *
   * @throws Will throw an error if the current cell does not have that crop
   *         available to harvest.
   */
  animateGetCrop(crop: number) {
    const col = this.maze_.getPegmanX() || 0;
    const row = this.maze_.getPegmanY() || 0;

    const cell = this.getCell(row, col) as HarvesterCell;

    if (cell.featureType() !== crop) {
      throw new Error("Shouldn't be able to harvest the wrong kind of crop");
    }

    if ((cell.getCurrentValue() || 0) <= 0) {
      throw new Error(
        "Shouldn't be able to end up with a harvest animation if " +
          'there was nothing left to harvest',
      );
    }

    this.playAudio_(HARVEST_SOUND);
    this.gotCropAt(row, col);

    this.drawer.updateItemImage(row, col, true);
  }
}

export default Harvester;
