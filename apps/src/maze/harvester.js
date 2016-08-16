import Gatherer from './gatherer';
import HarvesterDrawer from './harvesterDrawer';
import HarvesterCell from './harvesterCell';
import { BeeTerminationValue as TerminationValue } from '../constants.js';

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
  createGridItemDrawer() {
    return new HarvesterDrawer(this.maze_.map, this.skin_, this);
  }

  atCorn(id) {
    return this.atHarvest(HarvesterCell.FeatureType.CORN, id);
  }

  atPumpkin(id) {
    return this.atHarvest(HarvesterCell.FeatureType.PUMPKIN, id);
  }

  atWheat(id) {
    return this.atHarvest(HarvesterCell.FeatureType.WHEAT, id);
  }

  atHarvest(crop, id) {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    const cell = this.getCell(row, col);

    this.maze_.executionInfo.queueAction('at_' + cell.featureName(), id);
    return cell.featureType() === crop;
  }

  gotHarvestAt(row, col) {
    const cell = this.getCell(row, col);
    cell.setCurrentValue(cell.getCurrentValue() - 1);
  }

  getCorn(id) {
    this.getHarvest(HarvesterCell.FeatureType.CORN, id);
  }

  getPumpkin(id) {
    this.getHarvest(HarvesterCell.FeatureType.PUMPKIN, id);
  }

  getWheat(id) {
    this.getHarvest(HarvesterCell.FeatureType.WHEAT, id);
  }

  getHarvest(crop, id) {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    const cell = this.getCell(row, col);

    if (cell.featureType() !== crop) {
      this.maze_.executionInfo.terminateWithValue(TerminationValue.NOT_AT_FLOWER);
      return;
    }

    if (cell.getCurrentValue() === 0) {
      this.maze_.executionInfo.terminateWithValue(TerminationValue.FLOWER_EMPTY);
      return;
    }

    this.maze_.executionInfo.queueAction('get_' + cell.featureName(), id);
    this.gotHarvestAt(row, col);
  }

  animateGetCorn(id) {
    this.animateGetHarvest(HarvesterCell.FeatureType.CORN);
  }

  animateGetPumpkin(id) {
    this.animateGetHarvest(HarvesterCell.FeatureType.PUMPKIN);
  }

  animateGetWheat(id) {
    this.animateGetHarvest(HarvesterCell.FeatureType.WHEAT);
  }

  animateGetHarvest(crop) {
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

    this.playAudio_('harvest');
    this.gotHarvestAt(row, col);

    this.maze_.gridItemDrawer.updateItemImage(row, col, true);
  }
}
