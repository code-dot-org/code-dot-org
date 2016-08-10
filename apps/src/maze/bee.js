import utils from '../utils';
import mazeMsg from './locale';
import BeeCell from './beeCell';
import { TestResults } from '../constants.js';
import { BeeTerminationValue as TerminationValue } from '../constants.js';

const UNLIMITED_HONEY = -99;
const UNLIMITED_NECTAR = 99;

const EMPTY_HONEY = -98; // Hive with 0 honey
const EMPTY_NECTAR = 98; // flower with 0 honey

export default class Bee {
  constructor(maze, studioApp, config) {
    this.maze_ = maze;
    this.studioApp_ = studioApp;
    this.skin_ = config.skin;
    this.defaultFlowerColor_ = (config.level.flowerType === 'redWithNectar' ?
      'red' : 'purple');
    if (this.defaultFlowerColor_ === 'purple' &&
        config.level.flowerType !== 'purpleNectarHidden') {
      throw new Error(`bad flowerType for Bee: ${config.level.flowerType}`);
    }

    this.nectarGoal_ = config.level.nectarGoal || 0;
    this.honeyGoal_ = config.level.honeyGoal || 0;

    // at each location, tracks whether user checked to see if it was a flower or
    // honeycomb using an if block
    this.userChecks_ = [];
  }

  /**
   * Resets current state, for easy reexecution of tests
   */
  reset() {
    this.honey_ = 0;
    // list of the locations we've grabbed nectar from
    this.nectars_ = [];
    for (let i = 0; i < this.maze_.map.currentStaticGrid.length; i++) {
      this.userChecks_[i] = [];
      for (let j = 0; j < this.maze_.map.currentStaticGrid[i].length; j++) {
        this.userChecks_[i][j] = {
          checkedForFlower: false,
          checkedForHive: false,
          checkedForNectar: false
        };
      }
    }
    if (this.maze_.gridItemDrawer) {
      this.maze_.gridItemDrawer.updateNectarCounter(this.nectars_);
      this.maze_.gridItemDrawer.updateHoneyCounter(this.honey_);
    }
    this.maze_.map.resetDirt();
  }

  /**
   * @param {Number} row
   * @param {Number} col
   * @returns {Number} val
   */
  getValue(row, col) {
    return this.maze_.map.currentStaticGrid[row][col].getCurrentValue();
  }

  /**
   * @param {Number} row
   * @param {Number} col
   * @param {Number} val
   */
  setValue(row, col, val) {
    this.maze_.map.currentStaticGrid[row][col].setCurrentValue(val);
  }

  /**
   * Did we reach our total nectar/honey goals?
   * @return {boolean}
   */
  finished() {
    // nectar/honey goals
    if (this.honey_ < this.honeyGoal_ || this.nectars_.length < this.nectarGoal_) {
      return false;
    }

    if (!this.checkedAllClouded() || !this.checkedAllPurple()) {
      return false;
    }

    if (!this.collectedEverything()) {
      return false;
    }

    return true;
  }

  /**
   * @return {boolean}
   */
  collectedEverything() {
    // quantum maps implicity require "collect everything", non-quantum
    // maps don't really care
    if (!this.maze_.map.hasMultiplePossibleGrids()) {
      return true;
    }

    const missedSomething = this.maze_.map.currentStaticGrid.some(
      row => row.some(cell => cell.isDirt() && cell.getCurrentValue() > 0)
    );

    return !missedSomething;
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
    if (this.nectars_.length < this.nectarGoal_) {
      executionInfo.terminateWithValue(TerminationValue.INSUFFICIENT_NECTAR);
    } else if (this.honey_ < this.honeyGoal_) {
      executionInfo.terminateWithValue(TerminationValue.INSUFFICIENT_HONEY);
    } else if (!this.checkedAllClouded()) {
      executionInfo.terminateWithValue(TerminationValue.UNCHECKED_CLOUD);
    } else if (!this.checkedAllPurple()) {
      executionInfo.terminateWithValue(TerminationValue.UNCHECKED_PURPLE);
    } else if (!this.collectedEverything()) {
      executionInfo.terminateWithValue(TerminationValue.DID_NOT_COLLECT_EVERYTHING);
    }
  }

  /**
   * Did we check every flower/honey that was covered by a cloud?
   */
  checkedAllClouded() {
    for (let row = 0; row < this.maze_.map.currentStaticGrid.length; row++) {
      for (let col = 0; col < this.maze_.map.currentStaticGrid[row].length; col++) {
        if (this.shouldCheckCloud(row, col) && !this.checkedCloud(row, col)) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Did we check every purple flower
   */
  checkedAllPurple() {
    for (let row = 0; row < this.maze_.map.currentStaticGrid.length; row++) {
      for (let col = 0; col < this.maze_.map.currentStaticGrid[row].length; col++) {
        if (this.shouldCheckPurple(row, col) && !this.userChecks_[row][col].checkedForNectar) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Get the test results based on the termination value.  If there is
   * no app-specific failure, this returns StudioApp.getTestResults().
   */
  getTestResults(terminationValue) {
    switch (terminationValue) {
      case TerminationValue.NOT_AT_FLOWER:
      case TerminationValue.FLOWER_EMPTY:
      case TerminationValue.NOT_AT_HONEYCOMB:
      case TerminationValue.HONEYCOMB_FULL:
        return TestResults.APP_SPECIFIC_FAIL;

      case TerminationValue.UNCHECKED_CLOUD:
      case TerminationValue.UNCHECKED_PURPLE:
      case TerminationValue.INSUFFICIENT_NECTAR:
      case TerminationValue.INSUFFICIENT_HONEY:
      case TerminationValue.DID_NOT_COLLECT_EVERYTHING:
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
   */
  getMessage(terminationValue) {
    switch (terminationValue) {
      case TerminationValue.NOT_AT_FLOWER:
        return mazeMsg.notAtFlowerError();
      case TerminationValue.FLOWER_EMPTY:
        return mazeMsg.flowerEmptyError();
      case TerminationValue.NOT_AT_HONEYCOMB:
        return mazeMsg.notAtHoneycombError();
      case TerminationValue.HONEYCOMB_FULL:
        return mazeMsg.honeycombFullError();
      case TerminationValue.UNCHECKED_CLOUD:
        return mazeMsg.uncheckedCloudError();
      case TerminationValue.UNCHECKED_PURPLE:
        return mazeMsg.uncheckedPurpleError();
      case TerminationValue.INSUFFICIENT_NECTAR:
        return mazeMsg.insufficientNectar();
      case TerminationValue.INSUFFICIENT_HONEY:
        return mazeMsg.insufficientHoney();
      case TerminationValue.DID_NOT_COLLECT_EVERYTHING:
        return mazeMsg.didNotCollectEverything();
      default:
        return null;
    }
  }

  /**
   * @param {boolean} userCheck Is this being called from user code
   */
  isHive(row, col, userCheck=false) {
    if (userCheck) {
      this.userChecks_[row][col].checkedForHive = true;
    }
    const cell = this.maze_.map.currentStaticGrid[row][col];
    return cell.isHive();
  }

  /**
   * @param {boolean} userCheck Is this being called from user code
   */
  isFlower(row, col, userCheck=false) {
    if (userCheck) {
      this.userChecks_[row][col].checkedForFlower = true;
    }
    const cell = this.maze_.map.currentStaticGrid[row][col];
    return cell.isFlower();
  }

  /**
   * Returns true if cell should be clovered by a cloud while running
   */
  isCloudable(row, col) {
    return this.maze_.map.currentStaticGrid[row][col].isStaticCloud();
  }

  /**
   * The only clouds we care about checking are clouds that were defined
   * as static clouds in the original grid; quantum clouds will handle
   * 'requiring' checks through their quantum nature.
   */
  shouldCheckCloud(row, col) {
    return this.maze_.map.getVariableCell(row, col).isStaticCloud();
  }

  /**
   * Likewise, the only flowers we care about checking are flowers that
   * were defined as purple flowers without a variable range in the
   * original grid; variable range flowers will handle 'requiring' checks
   * through their quantum nature.
   */
  shouldCheckPurple(row, col) {
    return this.isPurpleFlower(row, col) && !this.maze_.map.getVariableCell(row, col).isVariableRange();
  }

  /**
   * Returns true if cell has been checked for either a flower or a hive
   */
  checkedCloud(row, col) {
    return this.userChecks_[row][col].checkedForFlower || this.userChecks_[row][col].checkedForHive;
  }

  /**
   * Flowers are either red or purple. This function returns true if a flower is red.
   */
  isRedFlower(row, col) {
    if (!this.isFlower(row, col, false)) {
      return false;
    }

    // If the flower has been overridden to be red, return true.
    // Otherwise, if the flower has been overridden to be purple, return
    // false. If neither of those are true, then the flower is whatever
    // the default flower color is.
    if (this.maze_.map.currentStaticGrid[row][col].isRedFlower()) {
      return true;
    } else if (this.maze_.map.currentStaticGrid[row][col].isPurpleFlower()) {
      return false;
    } else {
      return this.defaultFlowerColor_ === 'red';
    }
  }

  /**
   * Row, col contains a flower that is purple
   */
  isPurpleFlower(row, col) {
    return this.isFlower(row, col, false) && !this.isRedFlower(row, col);
  }

  /**
   * How much more honey can the hive at (row, col) produce before it hits the goal
   */
  hiveRemainingCapacity(row, col) {
    if (!this.isHive(row, col)) {
      return 0;
    }

    const val = this.getValue(row, col);
    if (val === UNLIMITED_HONEY) {
      return Infinity;
    }
    if (val === EMPTY_HONEY) {
      return 0;
    }
    return val;
  }

  /**
   * How much more nectar can be collected from the flower at (row, col)
   */
  flowerRemainingCapacity(row, col) {
    if (!this.isFlower(row, col)) {
      return 0;
    }

    const val = this.getValue(row, col);
    if (val === UNLIMITED_NECTAR) {
      return Infinity;
    }
    if (val === EMPTY_NECTAR) {
      return 0;
    }
    return val;
  }

  /**
   * Update model to represent made honey.  Does no validation
   */
  madeHoneyAt(row, col) {
    if (this.getValue(row, col) !== UNLIMITED_HONEY) {
      this.setValue(row, col, this.getValue(row, col) - 1);
    }

    this.honey_ += 1;
  }

  /**
   * Update model to represent gathered nectar. Does no validation
   */
  gotNectarAt(row, col) {
    if (this.getValue(row, col) !== UNLIMITED_NECTAR) {
      this.setValue(row, col, this.getValue(row, col) - 1);
    }

    this.nectars_.push({ row, col });
  }

  // API

  getNectar(id) {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    // Make sure we're at a flower.
    if (!this.isFlower(row, col)) {
      this.maze_.executionInfo.terminateWithValue(TerminationValue.NOT_AT_FLOWER);
      return;
    }
    // Nectar is positive.  Make sure we have it.
    if (this.flowerRemainingCapacity(row, col) === 0) {
      this.maze_.executionInfo.terminateWithValue(TerminationValue.FLOWER_EMPTY);
      return;
    }

    this.maze_.executionInfo.queueAction('nectar', id);
    this.gotNectarAt(row, col);
  }

  // Note that this deliberately does not check whether bee has gathered nectar.
  makeHoney(id) {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    if (!this.isHive(row, col)) {
      this.maze_.executionInfo.terminateWithValue(TerminationValue.NOT_AT_HONEYCOMB);
      return;
    }
    if (this.hiveRemainingCapacity(row, col) === 0) {
      this.maze_.executionInfo.terminateWithValue(TerminationValue.HONEYCOMB_FULL);
      return;
    }

    this.maze_.executionInfo.queueAction('honey', id);
    this.madeHoneyAt(row, col);
  }

  nectarRemaining(userCheck=false) {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    if (userCheck) {
      this.userChecks_[row][col].checkedForNectar = true;
    }

    return this.flowerRemainingCapacity(row, col);
  }

  honeyAvailable() {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    return this.hiveRemainingCapacity(row, col);
  }

  // ANIMATIONS
  playAudio_(sound) {
    // Check for StudioApp, which will often be undefined in unit tests
    if (this.studioApp_) {
      this.studioApp_.playAudio(sound);
    }
  }

  animateGetNectar() {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    if (this.getValue(row, col) <= 0) {
      throw new Error("Shouldn't be able to end up with a nectar animation if " +
        "there was no nectar to be had");
    }

    this.playAudio_('nectar');
    this.gotNectarAt(row, col);

    this.maze_.gridItemDrawer.updateItemImage(row, col, true);
    this.maze_.gridItemDrawer.updateNectarCounter(this.nectars_);
  }

  animateMakeHoney() {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    if (!this.isHive(row, col)) {
      throw new Error("Shouldn't be able to end up with a honey animation if " +
        "we arent at a hive or dont have nectar");
    }

    this.playAudio_('honey');
    this.madeHoneyAt(row, col);

    this.maze_.gridItemDrawer.updateItemImage(row, col, true);

    this.maze_.gridItemDrawer.updateHoneyCounter(this.honey_);
  }

}

