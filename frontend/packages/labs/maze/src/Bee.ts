import BeeCell from './BeeCell';
import BeeItemDrawer from './BeeItemDrawer';
import type {CellConstructor} from './Cell';
import Gatherer from './Gatherer';
import type MazeController from './MazeController';
import MazeMap from './MazeMap';
import type {Skin} from './skin';
import type {SubtypeConfiguration} from './Subtype';
import {randomValue} from './utils';

const UNLIMITED_HONEY = -99;
const UNLIMITED_NECTAR = 99;

const EMPTY_HONEY = -98; // Hive with 0 honey
const EMPTY_NECTAR = 98; // flower with 0 honey

const HONEY_SOUND = 'honey';
const NECTAR_SOUND = 'nectar';

class Bee extends Gatherer<BeeCell, BeeItemDrawer> {
  userChecks_: {
    checkedForFlower: boolean;
    checkedForHive: boolean;
    checkedForNectar: boolean;
  }[][];
  honey_: number;
  nectars_: {
    row: number;
    col: number;
  }[];
  overrideStepSpeed: number;
  defaultFlowerColor_: string;

  constructor(maze: MazeController, config: SubtypeConfiguration) {
    super(maze, config);

    const {level} = config;

    this.defaultFlowerColor_ =
      level.flowerType === 'redWithNectar' ? 'red' : 'purple';

    // at each location, tracks whether user checked to see if it was a flower or
    // honeycomb using an if block
    this.userChecks_ = [];

    this.overrideStepSpeed = 2;
    this.honey_ = 0;
    this.nectars_ = [];
  }

  private getMap(): MazeMap<BeeCell> | undefined {
    return this.maze_?.map as MazeMap<BeeCell> | undefined;
  }

  /** @override */
  isBee(): boolean {
    return true;
  }

  /** @override */
  getCellClass(): CellConstructor {
    return BeeCell as CellConstructor;
  }

  /** @override */
  loadAudio(skin: Skin) {
    if (skin.beeSound && skin.nectarSound && skin.honeySound) {
      this.maze_.loadAudio(skin.nectarSound, NECTAR_SOUND);
      this.maze_.loadAudio(skin.honeySound, HONEY_SOUND);
    }
  }

  /** @override */
  createDrawer(svg: SVGSVGElement) {
    if (this.maze_?.map) {
      this.drawer = new BeeItemDrawer(
        this.maze_.map as MazeMap<BeeCell>,
        this.skin_,
        svg,
        this,
      );
    }
  }

  /**
   * Resets current state, for easy reexecution of tests
   * @override
   */
  reset() {
    this.honey_ = 0;
    // list of the locations we've grabbed nectar from
    this.nectars_ = [];

    if (this.maze_?.map) {
      for (let i = 0; i < this.maze_.map.currentStaticGrid.length; i++) {
        this.userChecks_[i] = [];
        for (let j = 0; j < this.maze_.map.currentStaticGrid[i].length; j++) {
          this.userChecks_[i][j] = {
            checkedForFlower: false,
            checkedForHive: false,
            checkedForNectar: false,
          };
        }
      }
    }

    super.reset();
  }

  /**
   * Get the total count of all honey collected
   */
  getHoneyCount(): number {
    return this.honey_;
  }

  /**
   * Get the total count of all nectar collected
   */
  getNectarCount(): number {
    return this.nectars_.length;
  }

  /**
   * @param userCheck - Is this being called from user code
   */
  isHive(row: number, col: number, userCheck: boolean = false): boolean {
    if (userCheck) {
      this.userChecks_[row][col].checkedForHive = true;
    }
    const cell = this.getMap()?.currentStaticGrid?.[row]?.[col];
    return !!cell?.isHive();
  }

  /**
   * @param userCheck - Is this being called from user code
   */
  isFlower(row: number, col: number, userCheck: boolean = false): boolean {
    if (userCheck) {
      this.userChecks_[row][col].checkedForFlower = true;
    }
    const cell = this.getMap()?.currentStaticGrid?.[row]?.[col];
    return !!cell?.isFlower();
  }

  /**
   * Returns true if cell should be clovered by a cloud while running
   */
  isCloudable(row: number, col: number): boolean {
    return !!this.getMap()?.currentStaticGrid?.[row]?.[col]?.isStaticCloud();
  }

  /**
   * The only clouds we care about checking are clouds that were defined
   * as static clouds in the original grid; quantum clouds will handle
   * 'requiring' checks through their quantum nature.
   */
  shouldCheckCloud(row: number, col: number) {
    return !!this.getMap()?.getVariableCell(row, col)?.isStaticCloud();
  }

  /**
   * Likewise, the only flowers we care about checking are flowers that
   * were defined as purple flowers without a variable range in the
   * original grid; variable range flowers will handle 'requiring' checks
   * through their quantum nature.
   */
  shouldCheckPurple(row: number, col: number) {
    return (
      this.isPurpleFlower(row, col) &&
      !this.getMap()?.getVariableCell(row, col)?.isVariableRange()
    );
  }

  /**
   * Returns true if cell has been checked for either a flower or a hive
   */
  checkedCloud(row: number, col: number) {
    return (
      this.userChecks_[row][col].checkedForFlower ||
      this.userChecks_[row][col].checkedForHive
    );
  }

  /**
   * Did we check every flower/honey that was covered by a cloud?
   */
  checkedAllClouded() {
    for (
      let row = 0;
      row < (this.getMap()?.currentStaticGrid?.length || 0);
      row++
    ) {
      for (
        let col = 0;
        col < (this.getMap()?.currentStaticGrid?.[row]?.length || 0);
        col++
      ) {
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
    for (
      let row = 0;
      row < (this.getMap()?.currentStaticGrid?.length || 0);
      row++
    ) {
      for (
        let col = 0;
        col < (this.getMap()?.currentStaticGrid?.[row]?.length || 0);
        col++
      ) {
        if (
          this.shouldCheckPurple(row, col) &&
          !this.userChecks_[row][col].checkedForNectar
        ) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Flowers are either red or purple. This function returns true if a flower is red.
   */
  isRedFlower(row: number, col: number) {
    if (!this.isFlower(row, col, false)) {
      return false;
    }

    // If the flower has been overridden to be red, return true.
    // Otherwise, if the flower has been overridden to be purple, return
    // false. If neither of those are true, then the flower is whatever
    // the default flower color is.
    if (this.getMap()?.currentStaticGrid?.[row]?.[col]?.isRedFlower()) {
      return true;
    } else if (
      this.getMap()?.currentStaticGrid?.[row]?.[col]?.isPurpleFlower()
    ) {
      return false;
    } else {
      return this.defaultFlowerColor_ === 'red';
    }
  }

  /**
   * Row, col contains a flower that is purple
   */
  isPurpleFlower(row: number, col: number) {
    return this.isFlower(row, col, false) && !this.isRedFlower(row, col);
  }

  /**
   * How much more honey can the hive at (row, col) produce before it hits the goal
   */
  hiveRemainingCapacity(row: number, col: number) {
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
  flowerRemainingCapacity(row: number, col: number) {
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
  madeHoneyAt(row: number, col: number) {
    if (this.getValue(row, col) !== UNLIMITED_HONEY) {
      this.setValue(row, col, (this.getValue(row, col) || 0) - 1);
    }

    this.honey_ += 1;
  }

  /**
   * Update model to represent gathered nectar. Does no validation
   */
  gotNectarAt(row: number, col: number) {
    if ((this.getValue(row, col) || 0) !== UNLIMITED_NECTAR) {
      this.setValue(row, col, (this.getValue(row, col) || 0) - 1);
    }

    this.nectars_.push({row, col});
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
    const col = this.maze_.getPegmanX() || 0;
    const row = this.maze_.getPegmanY() || 0;

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
    const col = this.maze_.getPegmanX() || 0;
    const row = this.maze_.getPegmanY() || 0;

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

  nectarRemaining(userCheck: boolean = false): number {
    const col = this.maze_.getPegmanX() || 0;
    const row = this.maze_.getPegmanY() || 0;

    if (userCheck) {
      this.userChecks_[row][col].checkedForNectar = true;
    }

    return this.flowerRemainingCapacity(row, col) || 0;
  }

  honeyAvailable(): number {
    const col = this.maze_.getPegmanX() || 0;
    const row = this.maze_.getPegmanY() || 0;

    return this.hiveRemainingCapacity(row, col) || 0;
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
    const col = this.maze_.getPegmanX() || 0;
    const row = this.maze_.getPegmanY() || 0;

    if ((this.getValue(row, col) || 0) <= 0) {
      throw new Error(
        "Shouldn't be able to end up with a nectar animation if " +
          'there was no nectar to be had',
      );
    }

    this.playAudio_(NECTAR_SOUND);
    this.gotNectarAt(row, col);

    this.drawer.updateItemImage(row, col, true);
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
    const col = this.maze_.getPegmanX() || 0;
    const row = this.maze_.getPegmanY() || 0;

    if (!this.isHive(row, col)) {
      throw new Error(
        "Shouldn't be able to end up with a honey animation if " +
          'we arent at a hive or dont have nectar',
      );
    }

    this.playAudio_(HONEY_SOUND);
    this.madeHoneyAt(row, col);

    this.drawer.updateItemImage(row, col, true);
  }

  /** @override */
  getEmptyTile(
    _x: number,
    _y: number,
    adjacentToPath: boolean = false,
    _innerCorner: boolean = false,
  ): string {
    // begin with three trees
    const tileChoices: string[] = ['null3', 'null4', 'null0'];
    const noTree = 'null1';
    // want it to be more likely to have a tree when adjacent to path
    const n = adjacentToPath ? tileChoices.length * 2 : tileChoices.length * 6;
    for (let i = 0; i < n; i++) {
      tileChoices.push(noTree);
    }

    return randomValue(tileChoices);
  }

  /** @override */
  drawTile(
    svg: SVGSVGElement,
    tileSheetLocation: [number, number],
    row: number,
    col: number,
    tileId: string,
  ) {
    super.drawTile(svg, tileSheetLocation, row, col, tileId);

    // Draw checkerboard
    if ((row + col) % 2 === 0) {
      const isPath = !this.isWallOrOutOfBounds_(col, row);
      this.drawer.addCheckerboardTile(row, col, isPath);
    }
  }
}

export default Bee;
