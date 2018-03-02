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

  getCorn(id) {
    this.getCrop(HarvesterCell.FeatureType.CORN, id);
  }

  getPumpkin(id) {
    this.getCrop(HarvesterCell.FeatureType.PUMPKIN, id);
  }

  getLettuce(id) {
    this.getCrop(HarvesterCell.FeatureType.LETTUCE, id);
  }

  getCrop(crop, id) {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    const cell = this.getCell(row, col);

    if (cell.featureType() !== crop) {
      this.maze_.executionInfo.terminateWithValue(HarvesterTerminationValue.WRONG_CROP);
      return;
    }

    if (cell.getCurrentValue() === 0) {
      this.maze_.executionInfo.terminateWithValue(HarvesterTerminationValue.EMPTY_CROP);
      return;
    }

    this.maze_.executionInfo.queueAction('get_' + cell.featureName(), id);
    this.gotCropAt(row, col);
  }

  animateGetCorn(id) {
    this.animateGetCrop(HarvesterCell.FeatureType.CORN);
  }

  animateGetPumpkin(id) {
    this.animateGetCrop(HarvesterCell.FeatureType.PUMPKIN);
  }

  animateGetLettuce(id) {
    this.animateGetCrop(HarvesterCell.FeatureType.LETTUCE);
  }

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
