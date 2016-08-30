import Gatherer from './gatherer';
import HarvesterCell from './harvesterCell';
import HarvesterDrawer from './harvesterDrawer';
import mazeMsg from './locale';
import { HarvesterTerminationValue, TestResults } from '../constants.js';

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
  createDrawer() {
    this.drawer = new HarvesterDrawer(this.maze_.map, this.skin_, this);
  }

  hasCorn(id) {
    return this.hasCrop(HarvesterCell.FeatureType.CORN, id);
  }

  hasPumpkin(id) {
    return this.hasCrop(HarvesterCell.FeatureType.PUMPKIN, id);
  }

  hasBean(id) {
    return this.hasCrop(HarvesterCell.FeatureType.BEAN, id);
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

  atBean(id) {
    return this.atCrop(HarvesterCell.FeatureType.BEAN, id);
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

  getBean(id) {
    this.getCrop(HarvesterCell.FeatureType.BEAN, id);
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

  animateGetBean(id) {
    this.animateGetCrop(HarvesterCell.FeatureType.BEAN);
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

    this.playAudio_('harvest');
    this.gotCropAt(row, col);

    this.drawer.updateItemImage(row, col, true);
  }

  /**
   * Called after user's code has finished executing. Gives us a chance to
   * terminate with app-specific values, such as unchecked cloud/purple flowers.
   */
  onExecutionFinish() {
    const executionInfo = this.maze_.executionInfo;
    if (executionInfo.isTerminated()) {
      return;
    }
    if (this.finished()) {
      return;
    }

    // we didn't finish. look to see if we need to give an app specific error
    if (!this.collectedEverything()) {
      executionInfo.terminateWithValue(HarvesterTerminationValue.DID_NOT_COLLECT_EVERYTHING);
    }
  }

  /**
   * Get the test results based on the termination value.  If there is
   * no app-specific failure, this returns StudioApp.getTestResults().
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
        // app specific fail
        if (testResults >= TestResults.TOO_MANY_BLOCKS_FAIL) {
          testResults = TestResults.APP_SPECIFIC_FAIL;
        }
        return testResults;
    }

    return this.studioApp_.getTestResults(false);
  }

  /**
   * Get any app-specific message, based on the termination value,
   * or return null if none applies.
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
        return null;
    }
  }
}
