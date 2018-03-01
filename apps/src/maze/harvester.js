import Gatherer from './gatherer';
import HarvesterCell from './harvesterCell';
import HarvesterDrawer from './harvesterDrawer';

const HARVEST_SOUND = 'harvest';

export default class Harvester extends Gatherer {

  /**
   * @override
   */
  getCellClass() {
    return HarvesterCell;
  }

  /**
   * @override
   */
  loadAudio(skin) {
    if (skin.harvestSound) {
      this.maze_.loadAudio(skin.harvestSound, HARVEST_SOUND);
    }
  }

  /**
   * @override
   */
  createDrawer(svg) {
    this.drawer = new HarvesterDrawer(this.maze_.map, this.skin_, svg, this);
  }

  hasCorn() {
    return this.hasCrop(HarvesterCell.FeatureType.CORN);
  }

  hasPumpkin() {
    return this.hasCrop(HarvesterCell.FeatureType.PUMPKIN);
  }

  hasLettuce() {
    return this.hasCrop(HarvesterCell.FeatureType.LETTUCE);
  }

  hasCrop(crop) {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    const cell = this.getCell(row, col);

    return cell.featureType() === crop && cell.getCurrentValue() > 0;
  }

  atCorn() {
    return this.atCrop(HarvesterCell.FeatureType.CORN);
  }

  atPumpkin() {
    return this.atCrop(HarvesterCell.FeatureType.PUMPKIN);
  }

  atLettuce() {
    return this.atCrop(HarvesterCell.FeatureType.LETTUCE);
  }

  atCrop(crop) {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    const cell = this.getCell(row, col);

    return cell.featureType() === crop;
  }

  gotCropAt(row, col) {
    const cell = this.getCell(row, col);
    cell.setCurrentValue(cell.getCurrentValue() - 1);
  }

  tryGetCorn() {
    return this.tryGetCrop(HarvesterCell.FeatureType.CORN);
  }

  tryGetPumpkin() {
    return this.tryGetCrop(HarvesterCell.FeatureType.PUMPKIN);
  }

  tryGetLettuce() {
    return this.tryGetCrop(HarvesterCell.FeatureType.LETTUCE);
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
   * @return {boolean} whether or not this attempt was successful
   */
  tryGetCrop(crop) {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    const cell = this.getCell(row, col);

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
    this.animateGetCrop(HarvesterCell.FeatureType.CORN);
  }

  animateGetPumpkin() {
    this.animateGetCrop(HarvesterCell.FeatureType.PUMPKIN);
  }

  animateGetLettuce() {
    this.animateGetCrop(HarvesterCell.FeatureType.LETTUCE);
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
  animateGetCrop(crop) {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    const cell = this.getCell(row, col);

    if (cell.featureType() !== crop) {
      throw new Error("Shouldn't be able to harvest the wrong kind of crop");
    }

    if (cell.getCurrentValue() <= 0) {
      throw new Error("Shouldn't be able to end up with a harvest animation if " +
        "there was nothing left to harvest");
    }

    this.playAudio_(HARVEST_SOUND);
    this.gotCropAt(row, col);

    this.drawer.updateItemImage(row, col, true);
  }
}
