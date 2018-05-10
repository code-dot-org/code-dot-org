import { randomValue } from '../utils';
import Gatherer from './gatherer';
import BeeCell from './beeCell';
import BeeItemDrawer from './beeItemDrawer';

const UNLIMITED_HONEY = -99;
const UNLIMITED_NECTAR = 99;

const EMPTY_HONEY = -98; // Hive with 0 honey
const EMPTY_NECTAR = 98; // flower with 0 honey

const HONEY_SOUND = 'honey';
const NECTAR_SOUND = 'nectar';

export default class Bee extends Gatherer {
  constructor(maze, config) {
    super(maze, config);

    this.defaultFlowerColor_ = (config.level.flowerType === 'redWithNectar' ?
      'red' : 'purple');
    if (this.defaultFlowerColor_ === 'purple' &&
        config.level.flowerType !== 'purpleNectarHidden') {
      throw new Error(`bad flowerType for Bee: ${config.level.flowerType}`);
    }

    // at each location, tracks whether user checked to see if it was a flower or
    // honeycomb using an if block
    this.userChecks_ = [];

    this.overrideStepSpeed = 2;
    this.honey_ = undefined;
    this.nectars_ = undefined;
  }

  /**
   * @override
   */
  isBee() {
    return true;
  }

  /**
   * @override
   */
  getCellClass() {
    return BeeCell;
  }

  /**
   * @override
   */
  loadAudio(skin) {
    if (skin.beeSound) {
      this.maze_.loadAudio(skin.nectarSound, NECTAR_SOUND);
      this.maze_.loadAudio(skin.honeySound, HONEY_SOUND);
    }
  }

  /**
   * @override
   */
  createDrawer(svg) {
    this.drawer = new BeeItemDrawer(this.maze_.map, this.skin_, svg, this);
  }

  /**
   * Resets current state, for easy reexecution of tests
   * @override
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
    if (this.drawer) {
      this.drawer.updateNectarCounter(this.nectars_);
      this.drawer.updateHoneyCounter(this.honey_);
    }
    super.reset();
  }

  /**
   * Get the total count of all honey collected
   */
  getHoneyCount() {
    return this.honey_;
  }

  /**
   * Get the total count of all nectar collected
   */
  getNectarCount() {
    return this.nectars_.length;
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

  /**
   * Attempt to harvest nectar from the current location; terminate the
   * execution if this is not a valid place at which to get nectar.
   *
   * This method is preferred over animateGetNectar for "headless" operation (ie
   * when validating quantum levels)
   *
   * @fires notAtFlower
   * @fires flowerEmpty
   * @return {boolean} whether or not this attempt was successful
   */
  tryGetNectar() {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    // Make sure we're at a flower.
    if (!this.isFlower(row, col)) {
      this.emit('notAtFlower');
      return false;
    }
    // Nectar is positive.  Make sure we have it.
    if (this.flowerRemainingCapacity(row, col) === 0) {
      this.emit('flowerEmpty');
      return false;
    }

    this.gotNectarAt(row, col);
    return true;
  }

  /**
   * Attempt to make honey at the current location; terminate the execution if
   * this is not a valid place at which to make honey.
   * Note that this deliberately does not check whether bee has gathered nectar.
   *
   * This method is preferred over animateGetHoney for "headless" operation (ie
   * when validating quantum levels)
   *
   * @fires notAtHive
   * @fires hiveFull
   * @return {boolean} whether or not this attempt was successful
   */
  tryMakeHoney() {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    if (!this.isHive(row, col)) {
      this.emit('notAtHive');
      return false;
    }
    if (this.hiveRemainingCapacity(row, col) === 0) {
      this.emit('hiveFull');
      return false;
    }

    this.madeHoneyAt(row, col);
    return true;
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

  /**
   * Display the harvesting of nectar from the current location; raise a runtime
   * error if the current location is not a valid spot from which to gather
   * nectar.
   *
   * This method is preferred over tryGetNectar for live operation (ie when
   * actually displaying something to the user)
   *
   * @throws Will throw an error if the current cell has no nectar.
   */
  animateGetNectar() {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    if (this.getValue(row, col) <= 0) {
      throw new Error("Shouldn't be able to end up with a nectar animation if " +
        "there was no nectar to be had");
    }

    this.playAudio_(NECTAR_SOUND);
    this.gotNectarAt(row, col);

    this.drawer.updateItemImage(row, col, true);
    this.drawer.updateNectarCounter(this.nectars_);
  }

  /**
   * Display the making of honey from the current location; raise a runtime
   * error if the current location is not a valid spot at which to make honey.
   *
   * This method is preferred over tryMakeHoney for live operation (ie when
   * actually displaying something to the user)
   *
   * @throws Will throw an error if the current cell is not a hive.
   */
  animateMakeHoney() {
    const col = this.maze_.pegmanX;
    const row = this.maze_.pegmanY;

    if (!this.isHive(row, col)) {
      throw new Error("Shouldn't be able to end up with a honey animation if " +
        "we arent at a hive or dont have nectar");
    }

    this.playAudio_(HONEY_SOUND);
    this.madeHoneyAt(row, col);

    this.drawer.updateItemImage(row, col, true);
    this.drawer.updateHoneyCounter(this.honey_);
  }

  /**
   * @override
   */
  getEmptyTile(x, y, adjacentToPath, wallMap) {
    // begin with three trees
    var tileChoices = ['null3', 'null4', 'null0'];
    var noTree = 'null1';
    // want it to be more likely to have a tree when adjacent to path
    var n = adjacentToPath ? tileChoices.length * 2 : tileChoices.length * 6;
    for (var i = 0; i < n; i++) {
      tileChoices.push(noTree);
    }

    return randomValue(tileChoices);
  }

  /**
   * @override
   */
  drawTile(svg, tileSheetLocation, row, col, tileId) {
    super.drawTile(svg, tileSheetLocation, row, col, tileId);

    // Draw checkerboard
    if ((row + col) % 2 === 0) {
      const isPath = !this.isWallOrOutOfBounds_(col, row);
      this.drawer.addCheckerboardTile(row, col, isPath);
    }
  }

}

