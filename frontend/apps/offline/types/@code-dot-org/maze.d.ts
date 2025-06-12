declare module '@code-dot-org/maze' {
  export interface ExecutionError {
    err: string;
    lineNumber: number;
  }

  export interface PlayAudioOptions {
    noOverlap?: boolean;
    volume?: number;
  }

  export interface GetTestResultsOptions {
    executionError?: ExecutionError;
    allowTopBlocks?: boolean;
  }

  export interface RebindMethods {
    playAudio?: (sound: string, options: PlayAudioOptions = {}) => void;
    playAudioOnFailure?: () => void;
    loadAudio?: (filenames: string[], name: string) => void;
    getTestResults?: (
      levelComplete: boolean,
      options: GetTestResultsOptions = {},
    ) => number;
  }

  export interface Tiles {
    Direction: {
      NORTH: number;
      EAST: number;
      SOUTH: number;
      WEST: number;
    };

    SquareType: {
      WALL: number;
      OPEN: number;
      START: number;
      FINISH: number;
      OBSTACLE: number;
      STARTANDFINISH: number;
    };

    TurnDirection: {
      LEFT: number;
      RIGHT: number;
    };

    MoveDirection: {
      FORWARD: number;
      RIGHT: number;
      BACKWARD: number;
      LEFT: number;
    };

    directionToDxDy(direction: number): {
      dx: number;
      dy: number;
    };
    directionToFrame(direction4: number): number;
    constrainDirection4(d: number): number;
  }

  export const tiles: Tiles;

  export interface Configuration {
    skin?: Skin;
    skinId?: string;
  }

  export interface Options {
    methods?: RebindMethods;
  }

  /** Describes Maze level tile data in serialized mazes */
  export interface SerializedMazeTileData {
    tileType: number;
  }

  /** Describes maze level initial data. */
  export interface MazeData {
    serializedMaze?: SerializedMazeTileData[][];
    map?: number[][];
    skinId: string;
    startDirection?: number;
  }

  /**
   * This describes an input skin and some animation and sound behaviors.
   */
  export interface SkinData {
    goal?: string;
    collectBlock?: string;
    corners?: string;
    collectSounds?: string[];
    walkSound?: string;
    transparentTileEnding?: boolean;
    nonDisappearingPegmanHittingObstacle?: boolean;
    background?: string;
    look?: string;
    goalIdle?: string;
    obstacleIdle?: string;
    goalAnimation?: string;
    maze_forever?: string;
    largerObstacleAnimationTiles?: string;
    obstacleScale?: number;
    additionalSound?: boolean;
    idlePegmanAnimation?: string;
    idlePegmanAnimationSpeedScale?: number;
    idlePegmanCol?: number;
    idlePegmanRow?: number;
    wallPegmanAnimation?: string;
    movePegmanAnimation?: string;
    movePegmanAnimationSpeedScale?: number;
    movePegmanAnimationFrameNumber?: number;
    hittingWallAnimation?: string;
    hittingWallAnimationFrameNumber?: number;
    hittingWallAnimationSpeedScale?: number;
    hittingWallPegmanCol?: number;
    hittingWallPegmanRow?: number;
    approachingGoalAnimation?: string;
    celebrateAnimation?: string;
    celebratePegmanCol?: number;
    celebratePegmanRow?: number;
    pegmanXOffset?: number;
    pegmanYOffset?: number;
    pegmanHeight?: number;
    pegmanWidth?: number;
    danceOnLoad?: boolean;
    turnAfterVictory?: boolean;
    actionSpeedScale?: {
      [key: string]: number;
    };
  }

  /**
   * Represents a complete skin for a maze level (or derivative).
   */
  export interface Skin extends Omit<SkinData, 'walkSound' | 'collectSounds'> {
    id: string;
    assetUrl: (path: string) => string;
    avatar: string;
    avatar_2x: string;
    goal: string;
    obstacle: string;
    tiles?: string;
    smallStaticAvatar: string;
    staticAvatar: string;
    winAvatar: string;
    failureAvatar: string;
    obstacleAnimation?: string;
    decorationAnimation: string;
    decorationAnimation_2x: string;
    repeatImage: string;
    leftArrow: string;
    downArrow: string;
    upArrow: string;
    rightArrow: string;
    upLeftArrow: string;
    upRightArrow: string;
    downLeftArrow: string;
    downRightArrow: string;
    leftJumpArrow: string;
    downJumpArrow: string;
    upJumpArrow: string;
    rightJumpArrow: string;
    upLeftJumpArrow: string;
    upRightJumpArrow: string;
    downLeftJumpArrow: string;
    downRightJumpArrow: string;
    northLineDraw: string;
    southLineDraw: string;
    eastLineDraw: string;
    westLineDraw: string;
    northwestLineDraw: string;
    northeastLineDraw: string;
    southwestLineDraw: string;
    southeastLineDraw: string;
    shortLineDraw: string;
    longLineDraw: string;
    shortLineDrawRight: string;
    longLineDrawRight: string;
    longLine: string;
    shortLine: string;
    soundIcon: string;
    clickIcon: string;
    clockIcon: string;
    startIcon: string;
    runArrow: string;
    endIcon: string;
    speedFast: string;
    speedMedium: string;
    speedSlow: string;
    scoreCard: string;
    randomPurpleIcon: string;

    // Sounds [mp3, ogg]
    collectSounds?: [string, string][];
    startSound: [string, string];
    winSound: [string, string];
    failureSound: [string, string];
    obstacleSound?: [string, string];
    winGoalSound?: [string, string];
    walkSound?: [string, string];
    wallSound?: [string, string];
    wall0Sound?: [string, string];
    wall1Sound?: [string, string];
    wall2Sound?: [string, string];
    wall3Sound?: [string, string];
    wall4Sound?: [string, string];
  }

  export interface Maze {
    skin: Skin;
  }

  export class AnimationsController {
    constructor(maze: MazeController, svg: SVGSVGElement);

    reset(first: boolean);

    /**
     * Schedule the animations for a move from the current position
     * @param endX X coordinate of the target position
     * @param endY Y coordinate of the target position
     * @param pegmanId Optional id of pegman. If no id is provided,
     *   will schedule move for default pegman.
     */
    scheduleMove(
      endX: number,
      endY: number,
      timeForAnimation: number,
      pegmanId: string,
    );

    /**
     * Schedule the animations for a turn from the current direction
     * @param endDirection The direction we're turning to
     * @param pegmanId Optional id of pegman. If no id is provided,
     *   will schedule turn for default pegman.
     */
    scheduleTurn(endDirection: number, pegmanId: string);

    /**
     * Schedule the animations for a turn to the given direction, without
     * animating any of the intermediate frames.
     * @param endDirection The direction we're turning to
     * @param pegmanId Optional id of pegman. If no id is provided,
     *   will schedule turn for default pegman.
     */
    simpleTurn(endDirection: number, pegmanId: string);

    crackSurroundingIce(targetX: number, targetY: number);
    scheduleWallHit(
      targetX: number,
      targetY: number,
      deltaX: number,
      deltaY: number,
      frame: number,
      pegmanId: string,
    );
    scheduleObstacleHit(
      targetX: number,
      targetY: number,
      deltaX: number,
      deltaY: number,
      frame: number,
      pegmanId: string,
    );
    scheduleLook(x: number, y: number, d: number);
    stopIdling(pegmanId?: string);
    hidePegman(pegmanId?: string);
    showPegman(pegmanId?: string);

    /**
     * Schedule the animations and sound for a dance.
     * @param victoryDance This is a victory dance after completing the
     *   puzzle (vs. dancing on load).
     * @param timeAlloted How much time we have for our animations
     * @param pegmanId Optional id of pegman. If no id is provided, will schedule
     *   dance for default pegman.
     */
    scheduleDance(victoryDance: boolean, timeAlloted: number, pegmanId: string);

    /**
     * Display Pegman at the specified location, facing the specified direction.
     * @param x Horizontal grid (or fraction thereof).
     * @param y Vertical grid (or fraction thereof).
     * @param frame Direction (0 - 15) or dance (16 - 17). *
     * @param id Optional id of pegman. If no id is provided,
     *   will display default pegman.
     */
    displayPegman(x: number, y: number, frame: number, pegmanId: string);

    getPegmanIcon(pegmanId?: string);
    addNewPegman(pegmanId: string, x: number, y: number, d: number);
  }

  export interface CellSerialization {
    tileType: number;
    value: number;
    range: number;
  }

  export class Cell {
    constructor(tileType: number, value: number, range: number);
    clone<T extends this>(): T;
    getTile(): number;
    hasValue(): boolean;
    isDirt(): boolean;
    isVariableRange(): boolean;
    isVariable(): boolean;
    getOriginalValue(): number;
    getCurrentValue(): number;
    setCurrentValue(val: number);
    resetCurrentValue();
    getPossibleGridAssets<T extends this>(): T[];
    serialize(): CellSerialization;
    static deserialize(serialized: CellSerialization): Cell;
    static parseFromOldValues(
      mapCell: string | number,
      initialDirtCell: number | string,
    ): Cell;
  }

  export interface BeeCellSerialization extends CellSerialization {
    featureType?: number;
    cloudType?: number;
    flowerColor?: number;
  }

  export class BeeCell extends Cell {
    constructor(
      tileType: number,
      featureType: number | undefined,
      value: number,
      cloudType: number | undefined,
      flowerColor: number | undefined,
      range: number,
    );
    isFlower(): boolean;
    isHive(): boolean;
    isRedFlower(): boolean;
    isPurpleFlower(): boolean;
    isStaticCloud(): boolean;
    isVariableCloud(): boolean;
    serialize(): BeeCellSerialization;
    static deserialize(serialized: BeeCellSerialization): BeeCell;
    static parseFromOldValues(
      mapCell: string | number,
      initialDirtCell: number | string,
    ): BeeCell;
  }

  export interface HarvesterCellSerialization extends CellSerialization {
    possibleFeatures: number[];
    startsHidden: boolean;
  }

  export class HarvesterCell extends Cell {
    constructor(
      tileType: number,
      value: number,
      range: number,
      possibleFeatures?: number[],
      startsHidden?: boolean,
    );
    startsHidden(): boolean;
    isVariableFeature(): boolean;
    featureType(): number | undefined;
    featureName(): string;
    isCorn(): boolean;
    isPumpkin(): boolean;
    isLettuce(): boolean;
    serialize(): HarvesterCellSerialization;
    static deserialize(serialized: HarvesterCellSerialization): HarvesterCell;
  }

  export interface PlanterCellSerialization extends CellSerialization {
    featureType: number;
  }

  export class PlanterCell extends Cell {
    constructor(tileType: number, featureType: number);
    setFeatureType(type: number);
    featureType(): number;
    originalFeatureType(): number;
    resetCurrentFeature();
    featureName(): string;
    isSoil(): boolean;
    isSprout(): boolean;
    serialize(): PlanterCellSerialization;
    static deserialize(serialized: PlanterCellSerialization): PlanterCell;
  }

  export interface NeighborhoodCellSerialization extends CellSerialization {
    assetId: number;
    color: string;
  }

  export class NeighborhoodCell extends Cell {
    constructor(
      tileType: number,
      value: number,
      assetId: number,
      color: string,
    );
    getColor(): string;
    setColor(color: string);
    getAssetId(): number;
    serialize(): NeighborhoodCellSerialization;
    static deserialize(
      serialized: NeighborhoodCellSerialization,
    ): NeighborhoodCell;
  }

  export interface Cells {
    Cell: new () => Cell;
    BeeCell: new () => BeeCell;
    HarvesterCell: new () => HarvesterCell;
    PlanterCell: new () => PlanterCell;
    NeighborhoodCell: new () => NeighborhoodCell;
  }

  export const cells: Cells;

  export class Subtype {
    finish?: {
      x: number;
      y: number;
    };

    constructor(maze: MazeController, config: Configuration = {});

    getValue(row: number, col: number): number;
    setValue(row: number, col: number, val: number);
    getCell(row: number, col: number): object;
    getCellClass(): new () => Cell;
    loadAudio(skin: Skin);
    createDrawer(svg: SVGSVGElement);
    isFarmer(): boolean {
      return false;
    }
    isCollector(): boolean {
      return false;
    }
    isScrat(): boolean {
      return false;
    }
    isWordSearch(): boolean {
      return false;
    }
    isBee(): boolean {
      return false;
    }
    isNeighborhood(): boolean {
      return false;
    }
    getEmptyTile(
      x: number,
      y: number,
      adjacentToPath: boolean,
      innerCorner: boolean,
    ): string;
    drawMapTiles(svg: SVGSVGElement);
    drawTile(
      svg: SVGSVGElement,
      tileSheetLocation: [number, number],
      row: number,
      col: number,
      tileId: string,
    );
    initWallMap();
    initStartFinish();
    allowMultiplePegmen(): boolean;
  }

  export class Bee extends Subtype {
    isBee(): boolean {
      return true;
    }

    /**
     * Get the total count of all honey collected
     */
    getHoneyCount(): number;

    /**
     * Get the total count of all nectar collected
     */
    getNectarCount(): number;

    /**
     * @param {boolean} userCheck Is this being called from user code
     */
    isHive(row: number, col: number, userCheck: boolean = false): boolean;

    /**
     * @param {boolean} userCheck Is this being called from user code
     */
    isFlower(row: number, col: number, userCheck: boolean = false): boolean;

    /**
     * Returns true if cell should be clovered by a cloud while running
     */
    isCloudable(row: number, col: number): boolean;

    /**
     * The only clouds we care about checking are clouds that were defined
     * as static clouds in the original grid; quantum clouds will handle
     * 'requiring' checks through their quantum nature.
     */
    shouldCheckCloud(row: number, col: number): boolean;

    /**
     * Likewise, the only flowers we care about checking are flowers that
     * were defined as purple flowers without a variable range in the
     * original grid; variable range flowers will handle 'requiring' checks
     * through their quantum nature.
     */
    shouldCheckPurple(row: number, col: number): boolean;

    /**
     * Returns true if cell has been checked for either a flower or a hive
     */
    checkedCloud(row: number, col: number): boolean;

    /**
     * Did we check every flower/honey that was covered by a cloud?
     */
    checkedAllClouded(): boolean;

    /**
     * Did we check every purple flower
     */
    checkedAllPurple(): boolean;

    /**
     * Flowers are either red or purple. This function returns true if a flower is red.
     */
    isRedFlower(row: number, col: number): boolean;

    /**
     * Row, col contains a flower that is purple
     */
    isPurpleFlower(row: number, col: number): boolean;

    /**
     * How much more honey can the hive at (row, col) produce before it hits the goal
     */
    hiveRemainingCapacity(row: number, col: number): number;

    /**
     * How much more nectar can be collected from the flower at (row, col)
     */
    flowerRemainingCapacity(row: number, col: number): number;

    /**
     * Update model to represent made honey.  Does no validation
     */
    madeHoneyAt(row: number, col: number);

    /**
     * Update model to represent gathered nectar. Does no validation
     */
    gotNectarAt(row: number, col: number);

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
    animateGetNectar();

    /**
     * Display the making of honey from the current location; raise a runtime
     * error if the current location is not a valid spot at which to make honey.
     *
     * This method is preferred over tryMakeHoney for live operation (ie when
     * actually displaying something to the user)
     *
     * @throws Will throw an error if the current cell is not a hive.
     */
    animateMakeHoney();

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
    tryGetNectar(): boolean;

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
    tryMakeHoney(): boolean;

    nectarRemaining(): number;
    honeyAvailable(): number;
  }

  export class Farmer extends Subtype {
    isFarmer(): boolean {
      return true;
    }
  }

  export class Scrat extends Subtype {
    isScrat(): boolean {
      return true;
    }

    // Returns true if the tile at x,y is either a water tile or out of bounds
    isWaterOrOutOfBounds(col: number, row: number): boolean;

    // Returns true if the tile at x,y is a water tile that is in bounds.
    isWater(col: number, row: number): boolean;

    // Returns true if the tile at x,y is an obstacle tile that is in bounds.
    isObstacle(col: number, row: number): boolean;
  }

  export class Harvester extends Subtype {
    hasCorn(): boolean;
    hasPumpkin(): boolean;
    hasLettuce(): boolean;
    hasCrop(crop: string): boolean;
    atCorn(): boolean;
    atPumpkin(): boolean;
    atLettuce(): boolean;
    atCrop(crop: string): boolean;
    gotCropAt(row: number, col: number);
    tryGetCorn(): boolean;
    tryGetPumpkin(): boolean;
    tryGetLettuce(): boolean;
    tryGetCrop(crop: string): boolean;
    animateGetCorn();
    animateGetPumpkin();
    animateGetLettuce();
    animateGetCrop(crop: string);
  }

  export class Collector extends Subtype {
    isCollector(): boolean {
      return true;
    }
    scheduleDirtChange(row: number, col: number);

    /**
     * Attempt to collect from the specified location; terminate the execution if
     * there is nothing there to collect.
     *
     * Note that the animation for this action is handled by the default
     * "scheduleDig" operation
     *
     * @fires collectedTooMany
     * @return {boolean} whether or not this attempt was successful
     */
    tryCollect(row: number, col: number): boolean;

    /**
     * @return {number} The number of collectibles collected
     */
    getTotalCollected(): number;

    drawCorners(svg: SVGSVGElement, row: number, col: number, tileId: string);
  }

  export class Neighborhood extends Subtype {
    isNeighborhood(): boolean {
      return true;
    }

    /**
     * Paint the current location of the pegman with id pegmanId.
     * @param {String} pegmanId
     * @param {String} color Color to paint current location.
     *                       Must be hex code or html color.
     **/
    addPaint(pegmanId: string, color: string);

    /**
     * Remove paint from the location of the pegman with id pegmanId.
     * @param {String} pegmanId
     **/
    removePaint(pegmanId: string);

    /**
     * Turns the painter left by one direction.
     * @param {String} pegmanId
     */
    turnLeft(pegmanId: string);

    takePaint(pegmanId: string);
    setBucketVisibility(showBuckets: boolean);
    redrawBucketTiles();
    reset();

    // Sprite map maps asset ids to sprites within a spritesheet.
    getSpriteMap();

    // Get dimensions for spritesheet of static images.
    getDimensionsForSheet(sheet: number): [number, number];

    // Retrieve the asset list
    getAssetList(): string[];
  }

  export class Gatherer extends Subtype {
    reset();
    collectedEverything(): boolean;
    succeeded(): boolean;
  }

  export class Planter extends Subtype {
    reset();
    atSprout(): boolean;
    atSoil(): boolean;
    atType(type: string): boolean;

    /**
     * Attempt to plant a sprout at the current location; terminate the execution
     * if this is not a valid place at which to plant.
     *
     * This method is preferred over animatePlant for "headless" operation (ie
     * when validating quantum levels)
     *
     * @fires plantInNonSoil
     * @return {boolean} whether or not this attempt was successful
     */
    tryPlant(): boolean;

    /**
     * Display the planting of a sprout at the current location; raise a runtime
     * error if the current location is not a valid spot at which to plant.
     *
     * This method is preferred over tryPlant for live operation (ie when actually
     * displaying something to the user)
     *
     * @throws Will throw an error if the current cell has no nectar.
     */
    animatePlant();
  }

  export class WordSearch extends Subtype {
    isWordSearch(): boolean {
      return true;
    }
    getVisited(): number;
    markTileVisited(row: number, col: number, animating: boolean);

    static letterValue(val: string | number): string;
    static randomLetter(restrictions?: string[]): string;
  }

  export interface Subtypes {
    Bee: new () => Bee;
    Farmer: new () => Farmer;
    Scrat: new () => Scrat;
    Harvester: new () => Harvester;
    Collector: new () => Collector;
    Neighborhood: new () => Neighborhood;
    Planter: new () => Planter;
    WordSearch: new () => WordSearch;
  }

  export const subtypes: Subtypes;

  export class MazeMap<T extends Cell> {
    constructor(grid: T[][]);
    resetDirt();
    forEachCell(callback: (cell: T, x: number, y: number) => void);

    /**
     * Returns a flattened list of all cells in this map. Good for
     * situations where we want to map or reduce the cells without caring
     * about their position
     * @return {Cell[]}
     */
    getAllCells(): T[];
    getCell(x: number, y: number): T | undefined;
    isDirt(x: number, y: number): boolean | undefined;
    getTile(x: number, y: number): number | undefined;
    getValue(x: number, y: number): number | undefined;
    setValue(x: number, y: number, val: number);

    /**
     * Some functionality - most notably Bee's shouldCheckCloud and
     * shouldCheckPurple logic - need to be able to make decisions based on
     * details about the original (variable) cell at a coordinate.
     * @returns {Cell}
     */
    getVariableCell(x: number, y: number): T | undefined;

    /**
     * Assigns this.currentStaticGrid to the appropriate grid and resets all
     * current values
     * @param {Number} id
     */
    useGridWithId(id: number);

    clone();
    hasMultiplePossibleGrids(): boolean;

    /**
     * Clones the given grid of Cells by calling Cell.clone
     * @param {Cell[][]} grid
     * @return {Cell[][]} grid
     */
    static cloneGrid(grid: Cell[][]): Cell[][];

    /**
     * Given a single grid of Cells, some of which may be "variable"
     * cells, return a list of grids of non-variable Cells representing
     * all possible variable combinations.
     * @param {Cell[][]} variableGrid
     * @return {Cell[][][]} grids
     */
    static getAllStaticGrids(variableGrid: Cell[][]): Cell[][][];
    static deserialize<T extends Cell>(
      serializedValues: SerializedMazeTileData[][],
      cellClass: new () => T,
    ): MazeMap<T>;
    static parseFromOldValues<T extends Cell>(
      map: number[][],
      initialDirt?: number[][],
      cellClass: new () => T,
    ): MazeMap<T>;
  }

  export class MazeController {
    animationsController: AnimationsController | null;
    subtype: Subtype;
    skin: Skin;
    map: MazeMap;

    constructor(
      level: MazeData,
      skin: Skin,
      config: Configuration,
      options: Options = {},
    );

    rebindMethods(methods: RebindMethods);
    initWithSvg(svg: SVGSVGElement);
    resetDirtImages(running: boolean);
    drawHintPath(svg: SVGSVGElement, coordinates: [number, number][]);
    reset(first: boolean, showDefault: boolean = true);
    destroy();
    animatedFinish(timePerStep: number);
    animatedMove(direction: number, timeForMove: number, id?: string);
    animatedTurn(direction: number, id?: string);
    animatedCardinalTurn(direction: number, id?: string);
    animatedFail(forward: boolean, id?: string);
    animatedLook(direction: number, id?: string);

    /**
     * Schedule to add dirt at pegman's current position.
     */
    scheduleFill();

    /**
     * Schedule to remove dirt at pegman's current location.
     */
    scheduleDig();

    getPegmanX(id?: string): number;
    getPegmanY(id?: string): number;
    getPegmanD(id?: string): number;
    setPegmanX(x: number, id?: string);
    setPegmanY(y: number, id?: string);
    setPegmanD(d: number, id?: string);
    addPegman(id: string, x: number, y: number, d: number);
    createAddDisplayPegman(id: string, x: number, y: number, d: number);
    hideDefaultPegman();
    showPegman(id?: string);
    hidePegman(id?: string);
    getTestResults(
      levelComplete: boolean,
      options: GetTestResultsOptions = {},
    ): number;
  }

  const exports = {
    MazeController,
    subtypes,
    tiles,
    cells,
  };

  export default exports;
}
