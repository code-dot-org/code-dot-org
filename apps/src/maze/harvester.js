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

  hasCorn(id) {
    return this.hasHarvest(HarvesterCell.FeatureType.CORN, id);
  }

  hasPumpkin(id) {
    return this.hasHarvest(HarvesterCell.FeatureType.PUMPKIN, id);
  }

  hasBean(id) {
    return this.hasHarvest(HarvesterCell.FeatureType.BEAN, id);
  }

  hasHarvest(crop, id) {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    const cell = this.getCell(row, col);

    this.maze_.executionInfo.queueAction('has_' + cell.featureName(), id);
    return cell.featureType() === crop && cell.getCurrentValue() > 0;
  }

  atCorn(id) {
    return this.atHarvest(HarvesterCell.FeatureType.CORN, id);
  }

  atPumpkin(id) {
    return this.atHarvest(HarvesterCell.FeatureType.PUMPKIN, id);
  }

  atBean(id) {
    return this.atHarvest(HarvesterCell.FeatureType.BEAN, id);
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

  getBean(id) {
    this.getHarvest(HarvesterCell.FeatureType.BEAN, id);
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

  animateGetBean(id) {
    this.animateGetHarvest(HarvesterCell.FeatureType.BEAN);
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
