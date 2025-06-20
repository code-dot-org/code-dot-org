/**
 * Implements a classic Code.org 'Studio' level.
 *
 * Originally this was entirely within `apps/src/studio/studio.js` from 2014!
 */

import {SoundBoard} from '@/audio';
import {BlocklyLevelEnvironment} from '@/levels/blockly/components/BlocklyLevel';

import Cell, {CellSerialization} from './Cell';
import CollisionMaskWalls from './CollisionMaskWalls';
import * as constants from './constants';
import ObstacleZoneWalls from './ObstacleZoneWalls';
import ParamLists from './ParamLists';
import TileWalls from './TileWalls';
import Walls from './Walls';

const {SquareType} = constants;

/**
 * Describes level data for Studio levels.
 */
export interface StudioData {
  map?: (number | string | CellSerialization)[][];
  skinId: string;
}

/** Describes the arrow button ids */
export enum ArrowIds {
  LEFT = 'leftButton',
  UP = 'upButton',
  RIGHT = 'rightButton',
  DOWN = 'downButton',
}

/** Describes button pressed states */
export enum ButtonState {
  UP = 0,
  DOWN = 1,
}

/** Describes button states for all possible buttons */
export type ButtonStates = {
  [key: ArrowIds]: ButtonState;
};

/** Various game states */
export enum GameStates {
  WAITING = 0,
  ACTIVE = 1,
  OVER = 2,
}

class Studio extends EventTarget {
  private keyState = {};
  private gesturesObserved = {};
  /** Maintains the button states for the different action buttons */
  private btnState: ButtonStates = {
    [ArrowIds.LEFT]: ButtonState.UP,
    [ArrowIds.UP]: ButtonState.UP,
    [ArrowIds.RIGHT]: ButtonState.UP,
    [ArrowIds.DOWN]: ButtonState.UP,
  };
  private wallMapCollisions: boolean = false;
  private level: BlocklyData;
  private skin: Skin;
  private map: Cell[][];
  private walls?: Walls;
  private projectiles: object[] = [];
  private items: object[] = [];
  private itemSpeed = {};
  private itemActivity = {};
  private tiles = [];
  private tilesDrawn: boolean = false;
  private paramLists: ParamLists;
  private background: object;

  private allowSpritesOutsidePlayspace: boolean = false;
  private timeoutFailureTick: number = Infinity;
  private slowExecutionFactor: number = 1;
  private gridAlignedExtraPauseSteps: number = 0;
  private ticksBeforeFaceSouth: number = 0;
  private minWorkspaceHeight?: number;
  private protagonistSpriteIndex: number = 0;

  private spriteCount: number = 0;
  private spriteStart: number[] = [];
  private sprite: number[] = [];
  private startTime?: number;
  private spriteGoals: number[] = [];
  private dynamicSpriteGoals: number[] = [];

  private cloudStep: number = 0;

  /** Number of tiles down */
  private ROWS: number = 8;
  /** Number of tiles across */
  private COLS: number = 8;
  /** Pixel height and width of each maze square (i.e. tile) */
  private SQUARE_SIZE: number = 50;
  private HALF_SQUARE: number = 25;
  /** Height of the goal / obstacles */
  private MARKER_HEIGHT: number = 100;
  /** Width of the goal / obstacles */
  private MARKER_WIDTH: number = 100;
  /** Pixel width of the level's drawn area */
  private MAZE_WIDTH: number = 400;
  /** Pixel height of the level's drawn area */
  private MAZE_HEIGHT: number = 400;
  /** Retaining a reference to the blockly environment */
  private environment: BlocklyLevelEnvironment;

  constructor(
    level: StudioData,
    skin: Skin,
    environment: BlocklyLevelEnvironment,
  ) {
    super();

    // Create a sound device
    this.soundBoard = new SoundBoard();

    // Create a music controller
    //this.musicController = new MusicController();

    this.level = level;
    this.skin = skin;
    this.environment = environment;

    this.background = level.coordinateGridBackground
      ? 'grid'
      : level.background || skin.defaultBackground;

    // Load sound lists
    this.paramLists = new ParamLists(level, skin, this.soundBoard);

    // Load level data
    this.loadLevel();

    // Load the walls
    this.loadWalls();

    // Initialize sprites
    this.initSprites();

    console.log('SKIN', skin, environment);
  }

  /**
   * Deconstruct the level state.
   */
  uninitialize() {}

  loadLevel() {
    this.map = this.level.map.map(row =>
      row.map(cell => {
        // Each cell should be either an integer (in which case we are
        // dealing with the legacy format and should treat that value as
        // the tileType for the cell) or an object (in which case we are
        // dealing with the new format and should treat that value as a
        // serialization of the cell).
        const value: Cell = isNaN(parseInt(cell))
          ? Cell.deserialize(cell)
          : new Cell(cell);
        if (value.tileType & constants.WallCoordsMask) {
          this.wallMapCollisions = true;
        }
        return value;
      }),
    );

    // Hard-coded custom game logic hmm
    /*
    if (level.customGameType === 'Big Game') {
    } else if (level.customGameType === 'Rocket Height') {
    } else if (level.customGameType === 'Sam the Bat') {
    } else if (level.customGameType === 'Ninja Cat') {
    }*/

    this.allowSpritesOutsidePlayspace = this.level.allowSpritesOutsidePlayspace;

    if (this.level.avatarList) {
      // Duplicate the avatar list into the game application
      this.startAvatars = [...this.level.avatarList];
    } else {
      // Just use the avatar list but respect the chosen starting avatar for the level
      this.startAvatars = Studio.reorderedStartAvatars(
        this.skin.avatarList || [],
        this.level.firstSpriteIndex,
      );
    }

    // Override scalars
    for (const [key, scale] of Object.entries(this.level.scale || {})) {
      this.scale[key] = scale;
    }

    // Determine the level map's logical dimensions
    this.ROWS = this.map.length;
    this.COLS = this.map[0]?.length || 0;

    // Pixel dimensions for the square tiles of the map
    this.SQUARE_SIZE = 50;
    this.HALF_SQUARE = this.SQUARE_SIZE / 2;

    // Height and width of the goal and obstacles.
    this.MARKER_HEIGHT = this.level.markerHeight || 100;
    this.MARKER_WIDTH = this.level.markerWidth || 100;

    // Get real level dimensions
    this.MAZE_WIDTH = this.SQUARE_SIZE * this.COLS;
    this.MAZE_HEIGHT = this.SQUARE_SIZE * this.ROWS;
  }

  loadWalls() {
    if (this.skin.customObstacleZones) {
      this.walls = new ObstacleZoneWalls(
        this.level,
        this.skin,
        Studio.drawDebugRect,
      );
    } else if (this.skin.wallMaps) {
      this.walls = new CollisionMaskWalls(
        this.level,
        this.skin,
        Studio.drawDebugRect,
        Studio.drawDebugOverlay,
        Studio.MAZE_WIDTH,
        Studio.MAZE_HEIGHT,
      );
    } else {
      this.walls = new TileWalls(
        this.level,
        this.skin,
        Studio.drawDebugRect,
        this.SQUARE_SIZE,
        this.ROWS,
        this.COLS,
        this.getWallValue.bind(this),
      );
    }
  }

  initSprites() {
    this.spriteCount = 0;
    this.sprite = [];
    this.startTime = undefined;
    this.spriteGoals = [];

    const spriteOverrides = {};

    // Locate the start and finish positions.
    for (let row = 0; row < this.map.length; row++) {
      for (let col = 0; col < this.map[row].length; col++) {
        if (this.map[row][col].tileType & SquareType.SPRITEFINISH) {
          this.spriteGoals.push({
            x: col * this.SQUARE_SIZE,
            y: row * this.SQUARE_SIZE,
            finished: false,
          });
        } else if (this.map[row][col].tileType & SquareType.SPRITESTART) {
          const cell = this.map[row][col].serialize();
          if (0 === this.spriteCount) {
            this.spriteStart = [];
          }
          if (cell.sprite !== undefined) {
            let adjustedSprite =
              cell.sprite - (this.level.firstSpriteIndex || 0);
            if (adjustedSprite < 0) {
              adjustedSprite += this.startAvatars.length;
            }
            spriteOverrides[this.spriteCount] =
              this.startAvatars[adjustedSprite];
          }
          this.spriteStart[this.spriteCount] = {
            ...cell,
            x: col * this.SQUARE_SIZE,
            y: row * this.SQUARE_SIZE,
          };
          this.spriteCount++;
        }
      }
    }

    this.startAvatars = Object.values({
      ...this.startAvatars,
      ...spriteOverrides,
    });

    // Update the sprite count in the blocks:
    // TODO: use the environment for this
    /*blocks.setSpriteCount(Blockly, Studio.spriteCount);
    blocks.setStartAvatars(Studio.startAvatars);

    if (this.level.projectileCollisions) {
      blocks.enableProjectileCollisions(Blockly);
    }*/
  }

  /**
   * Get a wall value (either a SquareType.WALL value or a specific row/col tile
   * from a 16x16 grid shifted into bits 16-23).
   */
  getWallValue(row: number, col: number): number {
    if (row < 0 || row >= this.ROWS || col < 0 || col >= this.COLS) {
      return 0;
    }

    if (this.wallMap) {
      return this.skin[this.wallMap]
        ? this.skin[this.wallMap][row][col] << constants.WallCoordsShift
        : 0;
    } else {
      return this.map[row][col].tileType & constants.WallAnyMask;
    }
  }

  /**
   * Returns a list of avatars, reordered such that firstSpriteIndex comes first
   * (and is now at index 0).
   */
  static reorderedStartAvatars(
    avatarList: string[],
    firstSpriteIndex?: number,
  ) {
    firstSpriteIndex ||= 0;
    return [
      ...avatarList.slice(firstSpriteIndex),
      ...avatarList.slice(0, firstSpriteIndex),
    ];
  }
}

export default Studio;
