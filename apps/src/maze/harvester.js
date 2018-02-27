import Gatherer from './gatherer';
import HarvesterCell from './harvesterCell';
import HarvesterDrawer from './harvesterDrawer';
import { HarvesterTerminationValue } from '../constants.js';

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

  hasCorn(id) {
    return this.hasCrop(HarvesterCell.FeatureType.CORN, id);
  }

  hasPumpkin(id) {
    return this.hasCrop(HarvesterCell.FeatureType.PUMPKIN, id);
  }

  hasLettuce(id) {
    return this.hasCrop(HarvesterCell.FeatureType.LETTUCE, id);
  }

  hasCrop(crop, id) {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    const cell = this.getCell(row, col);

    this.maze_.executionInfo.queueAction('has_' + cell.featureName(), id);
    return cell.featureType() === crop && cell.getCurrentValue() > 0;
  }

  atCorn(id) {
    return this.atCrop(HarvesterCell.FeatureType.CORN, id);
  }

  atPumpkin(id) {
    return this.atCrop(HarvesterCell.FeatureType.PUMPKIN, id);
  }

  atLettuce(id) {
    return this.atCrop(HarvesterCell.FeatureType.LETTUCE, id);
  }

  atCrop(crop, id) {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    const cell = this.getCell(row, col);

    this.maze_.executionInfo.queueAction('at_' + cell.featureName(), id);
    return cell.featureType() === crop;
  }

  gotCropAt(row, col) {
    const cell = this.getCell(row, col);
    cell.setCurrentValue(cell.getCurrentValue() - 1);
  }

  getCorn() {
    this.getCrop(HarvesterCell.FeatureType.CORN);
  }

  getPumpkin() {
    this.getCrop(HarvesterCell.FeatureType.PUMPKIN);
  }

  getLettuce() {
    this.getCrop(HarvesterCell.FeatureType.LETTUCE);
  }

  /**
   * Attempt to harvest the specified crop from the current location; terminate
   * the execution if this is not a valid place at which to get that crop.
   *
   * This method is preferred over animateGetCrop for "headless" operation (ie
   * when validating quantum levels)
   *
   * @return {boolean} whether or not this attempt was successful
   */
  getCrop(crop) {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    const cell = this.getCell(row, col);

    if (cell.featureType() !== crop) {
      this.maze_.executionInfo.terminateWithValue(HarvesterTerminationValue.WRONG_CROP);
      return false;
    }

    if (cell.getCurrentValue() === 0) {
      this.maze_.executionInfo.terminateWithValue(HarvesterTerminationValue.EMPTY_CROP);
      return false;
    }

    this.gotCropAt(row, col);
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
   * This method is preferred over getCrop for live operation (ie when actually
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
