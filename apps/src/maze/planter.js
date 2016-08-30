import Subtype from './subtype';
import PlanterCell from './planterCell';
import PlanterDrawer from './planterDrawer';
import mazeMsg from './locale';
import { TestResults } from '../constants.js';

const TerminationValue = {
  PLANT_IN_NON_SOIL: 0,
  DID_NOT_PLANT_EVERYWHERE: 1,
};

export default class Planter extends Subtype {

  reset() {
    this.maze_.map.forEachCell(cell => {
      cell.resetCurrentFeature();
    });
  }

  /**
   * @override
   */
  finished() {
    return this.plantedEverything();
  }

  /**
   * Has the user planted everywhere they can plant? Alternatively, are
   * there zero Soil cells?
   */
  plantedEverything() {
    const anySoilCells = this.maze_.map.getAllCells().some(cell => cell.isSoil());
    return !anySoilCells;
  }

  /**
   * @override
   */
  shouldCheckSuccessOnMove() {
    return false;
  }

  /**
   * @override
   */
  getCellClass() {
    return PlanterCell;
  }

  /**
   * @override
   */
  createDrawer() {
    this.drawer = new PlanterDrawer(this.maze_.map, this.skin_, this);
  }

  atSprout(id) {
    return this.atType(PlanterCell.FeatureType.SPROUT, id);
  }

  atSoil(id) {
    return this.atType(PlanterCell.FeatureType.SOIL, id);
  }

  atType(type, id) {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    const cell = this.getCell(row, col);

    this.maze_.executionInfo.queueAction('at_' + cell.featureName(), id);
    return cell.featureType() === type;
  }

  plant(id) {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    const cell = this.getCell(row, col);

    if (cell.featureType() !== PlanterCell.FeatureType.SOIL) {
      this.maze_.executionInfo.terminateWithValue(TerminationValue.PLANT_IN_NON_SOIL);
      return;
    }

    this.maze_.executionInfo.queueAction('plant', id);
    cell.setFeatureType(PlanterCell.FeatureType.SPROUT);
  }

  animatePlant(id) {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    const cell = this.getCell(row, col);

    if (cell.featureType() !== PlanterCell.FeatureType.SOIL) {
      throw new Error("Shouldn't be able to plant in anything but soil");
    }

    cell.setFeatureType(PlanterCell.FeatureType.SPROUT);
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
    if (!this.plantedEverything()) {
      executionInfo.terminateWithValue(TerminationValue.DID_NOT_PLANT_EVERYWHERE);
    }
  }

  /**
   * Get the test results based on the termination value.  If there is
   * no app-specific failure, this returns StudioApp.getTestResults().
   * @override
   */
  getTestResults(terminationValue) {
    switch (terminationValue) {
      case TerminationValue.PLANT_IN_NON_SOIL:
        return TestResults.APP_SPECIFIC_FAIL;
      case TerminationValue.DID_NOT_PLANT_EVERYWHERE:
        var testResults = this.studioApp_.getTestResults(true);
        // If we have a non-app specific failure, we want that to take precedence.
        // Values over TOO_MANY_BLOCKS_FAIL are not true failures, but indicate
        // a suboptimal solution, so in those cases we want to return our
        // app specific fail
        if (testResults >= TestResults.TOO_MANY_BLOCKS_FAIL) {
          testResults = TestResults.APP_SPECIFIC_FAIL;
        }
        return testResults;
      default:
        return this.studioApp_.getTestResults(false);
    }
  }

  /**
   * @override
   */
  hasMessage(testResults) {
    return testResults === TestResults.APP_SPECIFIC_FAIL;
  }

  /**
   * Get any app-specific message, based on the termination value,
   * or return null if none applies.
   * @override
   */
  getMessage(terminationValue) {
    switch (terminationValue) {
      case TerminationValue.PLANT_IN_NON_SOIL:
        return mazeMsg.plantInNonSoilError();
      case TerminationValue.DID_NOT_PLANT_EVERYWHERE:
        return mazeMsg.didNotPlantEverywhere();
      default:
        return null;
    }
  }
}

Planter.TerminationValue = TerminationValue;
