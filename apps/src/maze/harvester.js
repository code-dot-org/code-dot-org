import Gatherer from './gatherer';
import HarvesterCell from './harvesterCell';
import HarvesterDrawer from './harvesterDrawer';
import mazeMsg from './locale';
import { HarvesterTerminationValue, TestResults } from '../constants.js';

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
      this.studioApp_.loadAudio(skin.harvestSound, HARVEST_SOUND);
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

  /**
   * @override
   */
  succeeeded() {
    return this.collectedEverything();
  }

  /**
   * @override
   */
  terminateWithAppSpecificValue() {
    const executionInfo = this.maze_.executionInfo;

    if (!this.collectedEverything()) {
      executionInfo.terminateWithValue(HarvesterTerminationValue.DID_NOT_COLLECT_EVERYTHING);
    }
  }

  /**
   * @override
   */
  getTestResults(terminationValue) {
    switch (terminationValue) {
      case HarvesterTerminationValue.WRONG_CROP:
      case HarvesterTerminationValue.EMPTY_CROP:
        return TestResults.APP_SPECIFIC_FAIL;

      case HarvesterTerminationValue.DID_NOT_COLLECT_EVERYTHING:
        var testResults = this.studioApp_.getTestResults(true);
        // If we have a non-app specific failure, we want that to take precedence.
        // Values over TOO_MANY_BLOCKS_FAIL are not true failures, but indicate
        // a suboptimal solution, so in those cases we want to return our
        // app specific fail. Same goes for BLOCK_LIMIT_FAIL.
        if (testResults >= TestResults.TOO_MANY_BLOCKS_FAIL || testResults === TestResults.BLOCK_LIMIT_FAIL) {
          testResults = TestResults.APP_SPECIFIC_FAIL;
        }
        return testResults;
    }

    return super.getTestResults(terminationValue);
  }

  /**
   * @override
   */
  getMessage(terminationValue) {
    switch (terminationValue) {
      case HarvesterTerminationValue.WRONG_CROP:
        return mazeMsg.wrongCropError();
      case HarvesterTerminationValue.EMPTY_CROP:
        return mazeMsg.emptyCropError();
      case HarvesterTerminationValue.DID_NOT_COLLECT_EVERYTHING:
        return mazeMsg.didNotCollectAllCrops();
      default:
        return super.getMessage(terminationValue);
    }
  }
}
