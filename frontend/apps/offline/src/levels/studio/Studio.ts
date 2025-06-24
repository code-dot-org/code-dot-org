/**
 * Implements a classic Code.org 'Studio' level.
 *
 * Originally this was entirely within `apps/src/studio/studio.js` from 2014!
 */

import type {InteractEvent} from '@interactjs/core/InteractEvent';
import interact from 'interactjs';

import Interpreter from '@code-dot-org/js-interpreter';

import {SoundBoard, MusicController, ThreeSliceAudio} from '@/audio';
import {BlocklyLevelEnvironment} from '@/levels/blockly/components/BlocklyLevel';

import Cell, {CellSerialization} from './Cell';
import CollisionMaskWalls from './CollisionMaskWalls';
import {
  Direction,
  Behavior,
  Emotions,
  NextTurn,
  SquareType,
  WallType,
  SVG_NS,
} from './constants';
import * as constants from './constants';
import GlowFilter from './GlowFilter';
import ImageFilter from './ImageFilter';
import Item, {ItemSerialization} from './Item';
import ObstacleZoneWalls from './ObstacleZoneWalls';
import ParamLists from './ParamLists';
import type {Skin, AvatarDefinition, ItemDefinition} from './skin';
import Sprite, {SpriteSerialization} from './Sprite';
import TileWalls from './TileWalls';
import Walls from './Walls';

// The threshold to move items on drag
const DRAG_DISTANCE_TO_MOVE_RATIO = 25;

// Radius of the rounded corners of the speech bubble
const SPEECH_BUBBLE_RADIUS = 20;

// Properties that define how to draw the speech bubble
const SPEECH_BUBBLE_LINE_HEIGHT = 20;
const SPEECH_BUBBLE_MIN_WIDTH = 180;
const SPEECH_BUBBLE_MAX_WIDTH = 380;
const SPEECH_BUBBLE_H_OFFSET = 50;
const SPEECH_BUBBLE_PADDING = 5;
const SPEECH_BUBBLE_SIDE_MARGIN = 10;
const SPEECH_BUBBLE_TOP_MARGIN = 5;

export interface Tile {
  bottomY: number;
}

export interface SvgTextOptions {
  svgText: SVGTextElement;
  text: string;
  width: number;
  maxWidth: number;
  fullHeight: number;
  maxLines: number;
  lineHeight: number;
  topMargin: number;
  sideMargin: number;
}

/**
 * Describes level data for Studio levels.
 */
export interface StudioData {
  map?: (number | string | CellSerialization)[][];
  skinId: string;
  /** Different restrictions to truncate possible options to certain functions */
  paramRestrictions?: {
    /** Disallow access to these given sounds as possible parameters */
    playSound?: {
      [key: string]: boolean;
    };
  };
  /** Whether or not to impose a grid for the background. */
  coordinateGridBackground?: boolean;
  /** The level override for the background. */
  background?: string;
  /** Do we allow sprites to exist outside of the playfield. */
  allowSpritesOutsidePlayspace?: boolean;
  /** Whether or not some sprites are hidden to begin with */
  spritesHiddenToStart?: boolean;
  /** The override for the possible avatars */
  avatarList?: string[];
  /** The override to decide which avatar should be listed first in options */
  firstSpriteIndex?: number;
  /** Scale overrides */
  scale?: {
    [key: string]: number;
  };
  markerHeight?: number;
  markerWidth?: number;
  /** The set of names of known music tracks to use */
  music?: string[];
  tapSvgToRunAndReset?: boolean;
  floatingScore?: boolean;
  goal?: {
    successState: object;
  };
  defaultEmotion?: Emotions;
  wallMap?: string;
  goalOverride?: {
    goalImage?: string;
    goalAnimation?: string;
    imageWidth?: number;
    imageHeight?: number;
    goalRenderOffsetX?: number;
    goalRenderOffsetY?: number;
  };
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
  [key in ArrowIds]: ButtonState;
};

/** Various game states */
export enum GameStates {
  WAITING = 0,
  ACTIVE = 1,
  OVER = 2,
}

export interface Goal {
  x: number;
  y: number;
  finished: boolean;
  clipPath?: SVGClipPathElement;
  clipRect?: SVGRectElement;
  marker?: SVGImageElement;
  startFadeTime?: number;
}

function isMobile(): boolean {
  const reg = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/;
  return reg.test(window.navigator.userAgent);
}

function isWindowsTouch(): boolean {
  const reg = /MSIE.*Touch/;
  return reg.test(window.navigator.userAgent);
}

class Studio extends EventTarget {
  private svg: SVGSVGElement;
  private keyState = {};
  private gesturesObserved: {
    [key: string]: number;
  } = {};
  /** Maintains the button states for the different action buttons */
  private btnState: ButtonStates = {
    [ArrowIds.LEFT]: ButtonState.UP,
    [ArrowIds.UP]: ButtonState.UP,
    [ArrowIds.RIGHT]: ButtonState.UP,
    [ArrowIds.DOWN]: ButtonState.UP,
  };
  private wallMap?: string;
  private wallMapCollisions: boolean = false;
  private wallMapRequested?: string;
  private level: StudioData;
  private skin: Skin;
  private map: Cell[][] = [];
  private wallColor: string = '#ffffff';
  private walls?: Walls;
  private projectiles: object[] = [];
  private tiles: Tile[] = [];
  private items: Item[] = [];
  private itemSpeed: {
    [key: string]: number;
  } = {};
  private itemActivity: {
    [key: string]: Behavior;
  } = {};
  private tilesDrawn: boolean = false;
  private paramLists: ParamLists;
  private background?: string;
  private scale: {
    [key: string]: number;
  } = {};
  private goalFilterEffect?: ImageFilter;
  private gameState: GameStates = GameStates.WAITING;
  private playerScore: number = 0;
  private scoreText?: string;
  private victoryText: string = '';
  private lastMoveSingleDir?: Direction;
  private levelRestarted: boolean = false;
  private succeededTime?: number;

  private startAvatars: string[] = [];

  private allowSpritesOutsidePlayspace: boolean = false;
  private timeoutFailureTick: number = Infinity;
  private slowExecutionFactor: number = 1;
  private gridAlignedExtraPauseSteps: number = 0;
  private ticksBeforeFaceSouth: number = 0;
  private minWorkspaceHeight?: number;
  protagonistSpriteIndex: number = 0;

  private spriteCount: number = 0;
  private spriteStart: SpriteSerialization[] = [];
  sprite: Sprite[] = [];
  private startTime?: number;
  private spriteGoals: Goal[] = [];
  private dynamicSpriteGoals: Goal[] = [];
  tickCount: number = 0;
  private touchAllGoalsEventFired: boolean = false;

  private currentCmdQueue?: number[];
  private sayComplete: number = 0;
  private playSoundCount: number = 0;

  private Globals: object = {};
  private yieldExecutionTicks: number = 0;
  private executionError?: number;
  private JSInterpreter?: Interpreter;

  trackedBehavior: {
    createdItems: {
      [key: string]: number;
    };
    removedItemCount: number;
    removedItems: {
      [key: string]: number;
    };
    touchedHazardCount: number;
    setActivityRecord?: number;
    hasSetSprite?: boolean;
    hasSetDroidSpeed?: boolean;
    hasSetBackground?: boolean;
    hasSetMap?: boolean;
    hasAddedItem?: boolean;
    hasWonGame?: boolean;
    hasLostGame?: boolean;
    allGoalsVisited?: boolean;
    timedOut?: boolean;
    gotAllItems?: boolean;
    hasSetEmotion?: boolean;
    hasThrownProjectile?: boolean;
  } = {
    createdItems: {},
    removedItemCount: 0,
    removedItems: {},
    touchedHazardCount: 0,
  };

  private cloudStep: number = 0;

  /** Number of tiles down */
  ROWS: number = 8;
  /** Number of tiles across */
  COLS: number = 8;
  /** Pixel height and width of each maze square (i.e. tile) */
  SQUARE_SIZE: number = 50;
  HALF_SQUARE: number = 25;
  /** Height of the goal / obstacles */
  MARKER_HEIGHT: number = 100;
  /** Width of the goal / obstacles */
  MARKER_WIDTH: number = 100;
  /** Pixel width of the level's drawn area */
  MAZE_WIDTH: number = 400;
  /** Pixel height of the level's drawn area */
  MAZE_HEIGHT: number = 400;
  /** Retaining a reference to the blockly environment */
  private environment: BlocklyLevelEnvironment;
  /** The audio mixer */
  private soundBoard: SoundBoard;
  /** The music player */
  private musicController: MusicController;
  /** Whether or not to show debug info */
  private showDebugInfo: boolean = false;
  private movementAudioEffects: {
    [key: string]: ThreeSliceAudio[];
  } = {};
  private currentSpriteMovementAudioEffects: ThreeSliceAudio[] = [];
  private currentMovementAudio?: ThreeSliceAudio;
  private moveAudioState: boolean = false;

  constructor(
    level: StudioData,
    skin: Skin,
    environment: BlocklyLevelEnvironment,
    svg: SVGSVGElement,
  ) {
    super();

    // Retain access to the visualization element
    this.svg = svg;

    // Create a sound device
    this.soundBoard = new SoundBoard();

    // Create a music controller
    const levelTracks = (skin.musicMetadata || []).filter(
      trackMetadata => level.music?.indexOf(trackMetadata.name) !== -1,
    );
    this.musicController = new MusicController(this.soundBoard, levelTracks);
    this.movementAudioEffects = {};

    this.level = level;
    this.skin = skin;
    this.environment = environment;

    this.background = level.coordinateGridBackground
      ? 'grid'
      : level.background || skin.defaultBackground || 'grid';

    // Load sound lists
    this.paramLists = new ParamLists(level, skin, this.soundBoard);

    // Load level data
    this.loadLevel();

    // Load the walls
    this.loadWalls();

    // Initialize sprites
    this.initSprites();

    // Draw the map
    this.drawMap();

    // Force a reset
    this.reset();

    console.log('SKIN', skin, environment);
  }

  /**
   * Deconstruct the level state.
   */
  uninitialize() {}

  reset() {
    // Reset game state
    this.gameState = GameStates.WAITING;

    // Reset the score and title screen.
    this.playerScore = 0;
    this.scoreText = undefined;
    this.victoryText = '';
    document.getElementById('score')?.setAttribute('visibility', 'hidden');
    document
      .getElementById('victoryText')
      ?.setAttribute('visibility', 'hidden');
    if (isMobile() || isWindowsTouch()) {
      const resetTextA = document.getElementById('resetTextA');
      const resetTextB = document.getElementById('resetTextB');
      if (this.level.tapSvgToRunAndReset) {
        if (resetTextA) {
          resetTextA.textContent = 'Tap to play';
          resetTextA.setAttribute('visibility', 'visible');
        }
        if (resetTextB) {
          resetTextB.textContent = 'Swipe to move';
          resetTextB.setAttribute('visibility', 'visible');
        }
        Array.from(document.querySelectorAll('#overlayGroup *')).forEach(el =>
          el.setAttribute('visibility', 'visible'),
        );
      } else {
        resetTextA?.setAttribute('visibility', 'hidden');
        resetTextB?.setAttribute('visibility', 'hidden');
        Array.from(document.querySelectorAll('#overlayGroup *')).forEach(el =>
          el.setAttribute('visibility', 'hidden'),
        );
      }
    } else {
      const resetText = document.getElementById('resetText');
      if (this.level.tapSvgToRunAndReset) {
        if (resetText) {
          resetText.textContent = 'Top or click to play';
          resetText.setAttribute('visibility', 'visible');
        }
      } else {
        resetText?.setAttribute('visibility', 'hidden');
      }
    }

    if (this.level.floatingScore) {
      document
        .getElementById('floatingScore')
        ?.setAttribute('visibility', 'hidden');
    }

    document
      .getElementById('titleScreenTitle')
      ?.setAttribute('visibility', 'hidden');
    document
      .getElementById('titleScreenTextGroup')
      ?.setAttribute('visibility', 'hidden');

    // Reset configurable variables
    this.background = undefined;
    this.wallMap = undefined;
    this.wallMapRequested = undefined;
    this.walls?.setWallMapRequested();
    this.setBackground({
      value: this.level.coordinateGridBackground
        ? 'grid'
        : this.level.background || this.skin.defaultBackground || 'grid',
    });
    const wallOverlay = document.getElementById('wallOverlay');
    wallOverlay?.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'xlink:href',
      '',
    );

    // Reset currentCmdQueue and various counts:
    this.gesturesObserved = {};
    this.currentCmdQueue = undefined;
    // Number of things that have been said.  Used to validate level completion.
    this.sayComplete = 0;
    this.playSoundCount = 0;

    // More things used to validate level completion.
    this.trackedBehavior = {
      removedItemCount: 0,
      touchedHazardCount: 0,
      hasSetSprite: false,
      hasSetDroidSpeed: false,
      hasSetBackground: false,
      hasSetMap: false,
      hasAddedItem: false,
      hasWonGame: false,
      hasLostGame: false,
      allGoalsVisited: false,
      timedOut: false,
      gotAllItems: false,
      removedItems: {},
      createdItems: {},
      hasSetEmotion: false,
      hasThrownProjectile: false,
    };

    // Reset goal successState:
    if (this.level.goal) {
      this.level.goal.successState = {};
    }

    // Reset the Globals object used to contain program variables:
    this.Globals = {};

    // Reset execution state:
    this.yieldExecutionTicks = 0;
    this.executionError = undefined;
    if (this.JSInterpreter) {
      //this.JSInterpreter.deinitialize();
      this.JSInterpreter = undefined;
    }

    const renderOffset = {
      x: 0,
      y: 0,
    };
    if (this.skin.gridAlignedMovement) {
      renderOffset.x = this.skin.gridSpriteRenderOffsetX || 0;
      renderOffset.y = this.skin.gridSpriteRenderOffsetY || 0;
    }

    // Move sprites into position.
    for (let i = 0; i < this.spriteCount; i++) {
      if (this.sprite[i]) {
        this.sprite[i].removeElement();
      }

      const spriteStart = this.spriteStart[i];
      this.sprite[i] = new Sprite(this, {
        x: spriteStart.x,
        y: spriteStart.y,
        displayX: 0,
        displayY: 0,
        loop: true,
        speed: spriteStart.speed || constants.DEFAULT_SPRITE_SPEED,
        size: spriteStart.size || constants.DEFAULT_SPRITE_SIZE,
        dir: spriteStart.direction || Direction.NONE,
        displayDir: spriteStart.direction || Direction.NONE,
        emotion:
          spriteStart.emotion || this.level.defaultEmotion || Emotions.NORMAL,
        renderOffset: renderOffset,
        // tickCount of last time sprite moved,
        lastMove: Infinity,
        // overridden as soon as we call setSprite
        visible: !this.level.spritesHiddenToStart,
      });
      this.lastMoveSingleDir = spriteStart.direction;

      const sprite = i % this.startAvatars.length;

      const opts = {
        spriteIndex: i,
        value: this.startAvatars[sprite],
        forceHidden: this.level.spritesHiddenToStart,
      };

      this.setSprite(opts);
      this.displaySprite(i);
      document
        .getElementById('speechBubble' + i)
        ?.setAttribute('visibility', 'hidden');

      this.sprite[i].setOpacity(1);

      const explosion = document.getElementById('explosion' + i);
      explosion?.setAttribute('visibility', 'hidden');
    }

    this.itemSpeed = {};
    for (const className in this.skin.specialItemProperties) {
      this.itemSpeed[className] =
        this.skin.specialItemProperties[className]?.speed || 0;
    }
    this.itemActivity = {};
    for (const className in this.skin.specialItemProperties) {
      this.itemActivity[className] =
        this.skin.specialItemProperties[className]?.activity || Behavior.STOP;
    }
    // Create Items that are specified on the map:
    this.createLevelItems();

    // Now that sprites are in place, we can set up a map, which might move
    // sprites around.
    const defaultMap = this.wallMapCollisions ? this.level.wallMap : undefined;
    if (defaultMap) {
      this.setMap({value: defaultMap});
    }

    // Setting up walls might have moved the sprites, so draw them once more.
    for (let i = 0; i < this.spriteCount; i++) {
      this.displaySprite(i);
    }
    this.resetGoalSprites();
    this.sortDrawOrder();

    // A little flag for script-based code to consume.
    this.levelRestarted = true;

    // Reset whether level has succeeded.
    this.succeededTime = undefined;

    // Stop any current movement sounds
    this.movementAudioOff();
  }

  run() {}

  step() {}

  loadLevel() {
    this.map = (this.level.map || []).map(row =>
      row.map(cell => {
        // Each cell should be either an integer (in which case we are
        // dealing with the legacy format and should treat that value as
        // the tileType for the cell) or an object (in which case we are
        // dealing with the new format and should treat that value as a
        // serialization of the cell).
        const value: Cell =
          typeof cell !== 'number' && typeof cell !== 'string'
            ? Cell.deserialize(cell)
            : new Cell(
                typeof cell === 'string' ? parseInt(cell) : cell,
                0,
                0,
                0,
                0,
                0,
              );
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

    this.allowSpritesOutsidePlayspace =
      !!this.level.allowSpritesOutsidePlayspace;

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
        this.drawDebugRect.bind(this),
      );
    } else if (this.skin.wallMaps) {
      this.walls = new CollisionMaskWalls(
        this.level,
        this.skin,
        this.drawDebugRect.bind(this),
        this.drawDebugOverlay.bind(this),
        this.MAZE_WIDTH,
        this.MAZE_HEIGHT,
      );
    } else {
      this.walls = new TileWalls(
        this.level,
        this.skin,
        this.drawDebugRect.bind(this),
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
    this.spriteStart = [];

    const spriteOverrides: string[] = [];

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

          // If the cell defines its own sprite for a 'start', take care to map
          // it to our internal sprite array. Such sprites occur after startAvatars.
          if (cell.sprite !== undefined) {
            let adjustedSprite =
              cell.sprite - (this.level.firstSpriteIndex || 0);
            if (adjustedSprite < 0) {
              // We re-index the sprite
              adjustedSprite += this.startAvatars.length;
            }

            // The cell sprite overrides the start sprite that it is referring to
            spriteOverrides.push(this.startAvatars[adjustedSprite]);
          } else {
            spriteOverrides.push(this.startAvatars[this.spriteCount] || '');
          }

          this.spriteStart.push({
            ...cell,
            displayX: 0, // cell.x?
            displayY: 0, // TODO cell.y?
            x: col * this.SQUARE_SIZE,
            y: row * this.SQUARE_SIZE,
          });
          this.spriteCount++;
        }
      }
    }

    this.startAvatars = spriteOverrides;

    // Update the sprite count in the blocks:
    // TODO: use the environment for this

    //this.environment.spriteCount = this.spriteCount;
    //this.environment.startAvatars = this.startAvatars;
    //this.environment.enableProjectileCollisions = true;

    /*
    blocks.setSpriteCount(Blockly, this.spriteCount);
    blocks.setStartAvatars(Studio.startAvatars);

    if (this.level.projectileCollisions) {
      blocks.enableProjectileCollisions(Blockly);
    }
    */
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
      return this.skin.walls?.[this.wallMap]
        ? this.skin.walls?.[this.wallMap][row][col] << constants.WallCoordsShift
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

  /**
   * Draw a debug rectangle centered on the given location, using the given
   * CSS class name.
   */
  drawDebugRect(
    _className: string,
    _x: number,
    _y: number,
    _width: number,
    _height: number,
  ) {
    if (!this.showDebugInfo) {
      return;
    }

    /*
    const svg = document.getElementById('svgStudio');
    const group = document.createElementNS(SVG_NS, 'g');
    group.setAttribute('class', className + ' debugRect');
    const background = document.createElementNS(SVG_NS, 'rect');
    background.setAttribute('width', width);
    background.setAttribute('height', height);
    background.setAttribute('x', x - width / 2);
    background.setAttribute('y', y - height / 2);
    background.setAttribute('fill', 'rgba(255, 255, 255, 0.5)');
    background.setAttribute('stroke', '#000000');
    background.setAttribute('stroke-width', 1);
    group.appendChild(background);
    svg.appendChild(group);
    */
  }

  /**
   * Draw an image with 0.5 opacity over the entire play area. Only allow one
   * at a time.
   */
  drawDebugOverlay(_src: string) {
    /*
    if (showDebugInfo && $('.debugImage').length === 0) {
      const svg = document.getElementById('svgStudio');
      const group = document.createElementNS(SVG_NS, 'g');
      group.setAttribute('class', 'walls debugImage');
      const mapImage = document.createElementNS(SVG_NS, 'image');
      mapImage.setAttribute('width', Studio.MAZE_WIDTH);
      mapImage.setAttribute('height', Studio.MAZE_HEIGHT);
      mapImage.setAttribute('x', 0);
      mapImage.setAttribute('y', 0);
      mapImage.setAttribute('opacity', '0.5');
      mapImage.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', src);
      group.appendChild(mapImage);
      svg.appendChild(group);
    }*/
  }

  drawMap() {
    // Adjust outer element size.
    this.svg.setAttribute(
      'viewBox',
      `0 0 ${this.MAZE_WIDTH} ${this.MAZE_HEIGHT}`,
    );
    this.svg.style.width = '100%';

    // Attach click handler.
    const interactSvg = interact(this.svg);
    interactSvg.on('tap', this.onSvgClicked.bind(this));
    interactSvg.draggable({
      onmove: this.onSvgDrag.bind(this),
    });

    const backgroundLayer = document.createElementNS(SVG_NS, 'g');
    backgroundLayer.setAttribute('id', 'backgroundLayer');
    this.svg.appendChild(backgroundLayer);

    if (
      this.background &&
      this.skin.backgrounds?.[this.background]?.background
    ) {
      const background = this.skin.backgrounds?.[this.background];
      const tile = document.createElementNS(SVG_NS, 'image');
      tile.setAttributeNS(
        'http://www.w3.org/1999/xlink',
        'xlink:href',
        background.background,
      );
      tile.setAttribute('id', 'background');
      tile.setAttribute('height', this.MAZE_HEIGHT.toString());
      tile.setAttribute('width', this.MAZE_WIDTH.toString());
      tile.setAttribute('x', '0');
      tile.setAttribute('y', '0');
      backgroundLayer.appendChild(tile);
    }

    if (this.skin.showGrid) {
      const tile = document.createElementNS(SVG_NS, 'image');
      tile.setAttributeNS(
        'http://www.w3.org/1999/xlink',
        'xlink:href',
        '/skins/studio/grid.svg',
      );
      tile.setAttribute('height', this.MAZE_HEIGHT.toString());
      tile.setAttribute('width', this.MAZE_WIDTH.toString());
      tile.setAttribute('x', '0');
      tile.setAttribute('y', '0');
      backgroundLayer.appendChild(tile);
    }

    if (this.level.coordinateGridBackground) {
      this.createCoordinateGridBackground({
        origin: 0,
        firstLabel: 100,
        lastLabel: 300,
        increment: 100,
      });
    }

    const spriteLayer = document.createElementNS(SVG_NS, 'g');
    spriteLayer.setAttribute('id', 'spriteLayer');
    this.svg.appendChild(spriteLayer);

    if (this.wallMapCollisions) {
      this.drawMapTiles();
    }

    if (this.spriteStart) {
      for (let i = 0; i < this.spriteCount; i++) {
        const spriteSpeechBubble = document.createElementNS(SVG_NS, 'g');
        spriteSpeechBubble.setAttribute('id', 'speechBubble' + i);
        spriteSpeechBubble.setAttribute('visibility', 'hidden');

        const speechRect = document.createElementNS(SVG_NS, 'path');
        speechRect.setAttribute('id', 'speechBubblePath' + i);
        speechRect.setAttribute('class', 'studio-speech-bubble-path');

        const speechText = document.createElementNS(SVG_NS, 'text');
        speechText.setAttribute('id', 'speechBubbleText' + i);
        speechText.setAttribute('class', 'studio-speech-bubble');

        spriteSpeechBubble.appendChild(speechRect);
        spriteSpeechBubble.appendChild(speechText);
        this.svg.appendChild(spriteSpeechBubble);
      }
    }

    if (this.spriteGoals) {
      for (let i = 0; i < this.spriteGoals.length; i++) {
        this.createGoalElements(i, this.spriteGoals[i]);
      }
    }
    this.applyGoalEffect();

    // Create cloud elements.
    const cloudGroup = document.createElementNS(SVG_NS, 'g');
    cloudGroup.setAttribute('id', 'cloudLayer');
    for (let i = 0; i < constants.MAX_NUM_CLOUDS; i++) {
      const cloud = document.createElementNS(SVG_NS, 'image');
      cloud.setAttribute('id', 'cloud' + i);
      cloudGroup.appendChild(cloud);
    }
    this.svg.appendChild(cloudGroup);

    const gameTextGroup = document.createElementNS(SVG_NS, 'g');
    gameTextGroup.setAttribute('id', 'gameTextGroup');
    this.svg.appendChild(gameTextGroup);

    const overlayGroup = document.createElementNS(SVG_NS, 'g');
    overlayGroup.setAttribute('id', 'overlayGroup');
    this.svg.appendChild(overlayGroup);

    const score = document.createElementNS(SVG_NS, 'text');
    score.setAttribute('id', 'score');
    score.setAttribute('class', 'studio-score');
    score.setAttribute('x', (this.MAZE_WIDTH / 2).toString());
    score.setAttribute('y', constants.SCORE_TEXT_Y_POSITION.toString());
    score.appendChild(document.createTextNode(''));
    score.setAttribute('visibility', 'hidden');
    gameTextGroup.appendChild(score);

    const victoryText = document.createElementNS(SVG_NS, 'text');
    victoryText.setAttribute('id', 'victoryText');
    victoryText.setAttribute('class', 'studio-victory-text');
    victoryText.setAttribute('x', (this.MAZE_WIDTH / 2).toString());
    victoryText.setAttribute('y', constants.VICTORY_TEXT_Y_POSITION.toString());
    victoryText.appendChild(document.createTextNode(''));
    victoryText.setAttribute('visibility', 'hidden');
    gameTextGroup.appendChild(victoryText);

    if (isMobile() || isWindowsTouch()) {
      const resetOverlayRect = document.createElementNS(SVG_NS, 'rect');
      resetOverlayRect.setAttribute('width', this.MAZE_WIDTH.toString());
      resetOverlayRect.setAttribute('height', this.MAZE_HEIGHT.toString());
      resetOverlayRect.setAttribute('fill', 'black');
      resetOverlayRect.setAttribute('opacity', '0.3');
      overlayGroup.appendChild(resetOverlayRect);
      const resetTextA = document.createElementNS(SVG_NS, 'text');
      resetTextA.setAttribute('id', 'resetTextA');
      resetTextA.setAttribute('class', 'studio-reset-text');
      resetTextA.setAttribute('x', (this.MAZE_WIDTH / 2).toString());
      resetTextA.setAttribute(
        'y',
        (constants.RESET_TEXT_Y_POSITION - 30).toString(),
      );
      resetTextA.appendChild(document.createTextNode('Tap to play'));
      resetTextA.setAttribute('visibility', 'visible');
      overlayGroup.appendChild(resetTextA);
      const resetTextB = document.createElementNS(SVG_NS, 'text');
      resetTextB.setAttribute('id', 'resetTextB');
      resetTextB.setAttribute('class', 'studio-reset-text');
      resetTextB.setAttribute('x', (this.MAZE_WIDTH / 2).toString());
      resetTextB.setAttribute('y', constants.RESET_TEXT_Y_POSITION.toString());
      resetTextB.appendChild(document.createTextNode('Swipe to move'));
      resetTextB.setAttribute('visibility', 'visible');
      overlayGroup.appendChild(resetTextB);
      const touchDragIcon = document.createElementNS(SVG_NS, 'image');
      touchDragIcon.setAttributeNS(
        'http://www.w3.org/1999/xlink',
        'xlink:href',
        '/media/common_images/touch-drag.png',
      );
      const touchIconSize = 300;
      touchDragIcon.setAttribute('width', touchIconSize.toString());
      touchDragIcon.setAttribute('height', touchIconSize.toString());
      touchDragIcon.setAttribute(
        'x',
        ((this.MAZE_WIDTH - touchIconSize) / 2).toString(),
      );
      touchDragIcon.setAttribute(
        'y',
        ((this.MAZE_HEIGHT - touchIconSize) / 2 - 25).toString(),
      );
      overlayGroup.appendChild(touchDragIcon);
    } else {
      const resetText = document.createElementNS(SVG_NS, 'text');
      resetText.setAttribute('id', 'resetText');
      resetText.setAttribute('class', 'studio-reset-text');
      resetText.setAttribute('x', (this.MAZE_WIDTH / 2).toString());
      resetText.setAttribute('y', constants.RESET_TEXT_Y_POSITION.toString());
      resetText.appendChild(document.createTextNode('Tap or click to reset'));
      resetText.setAttribute('visibility', 'visible');
      overlayGroup.appendChild(resetText);
    }

    if (this.level.floatingScore) {
      const floatingScore = document.createElementNS(SVG_NS, 'text');
      floatingScore.setAttribute('id', 'floatingScore');
      floatingScore.setAttribute('class', 'studio-floating-score');
      floatingScore.setAttribute('x', (this.MAZE_WIDTH / 2).toString());
      floatingScore.setAttribute(
        'y',
        constants.SCORE_TEXT_Y_POSITION.toString(),
      );
      floatingScore.appendChild(document.createTextNode(''));
      floatingScore.setAttribute('visibility', 'hidden');
      this.svg.appendChild(floatingScore);
    }

    const titleScreenTitle = document.createElementNS(SVG_NS, 'text');
    titleScreenTitle.setAttribute('id', 'titleScreenTitle');
    titleScreenTitle.setAttribute('class', 'studio-ts-title');
    titleScreenTitle.setAttribute('x', (this.MAZE_WIDTH / 2).toString());
    titleScreenTitle.setAttribute(
      'y',
      constants.TITLE_SCREEN_TITLE_Y_POSITION.toString(),
    );
    titleScreenTitle.appendChild(document.createTextNode(''));
    titleScreenTitle.setAttribute('visibility', 'hidden');
    this.svg.appendChild(titleScreenTitle);

    const titleScreenTextGroup = document.createElementNS(SVG_NS, 'g');
    const xPosTextGroup =
      (this.MAZE_WIDTH - constants.TITLE_SCREEN_TEXT_WIDTH) / 2;
    titleScreenTextGroup.setAttribute('id', 'titleScreenTextGroup');
    titleScreenTextGroup.setAttribute('x', xPosTextGroup.toString());
    titleScreenTextGroup.setAttribute(
      'y',
      constants.TITLE_SCREEN_TEXT_Y_POSITION.toString(),
    );
    titleScreenTextGroup.setAttribute(
      'transform',
      'translate(' +
        xPosTextGroup +
        ',' +
        constants.TITLE_SCREEN_TEXT_Y_POSITION +
        ')',
    );
    titleScreenTextGroup.setAttribute('visibility', 'hidden');

    const titleScreenTextRect = document.createElementNS(SVG_NS, 'rect');
    titleScreenTextRect.setAttribute('id', 'titleScreenTextRect');
    titleScreenTextRect.setAttribute('x', '0');
    titleScreenTextRect.setAttribute('y', '0');
    titleScreenTextRect.setAttribute(
      'width',
      constants.TITLE_SCREEN_TEXT_WIDTH.toString(),
    );
    titleScreenTextRect.setAttribute('class', 'studio-ts-text-rect');

    const titleScreenText = document.createElementNS(SVG_NS, 'text');
    titleScreenText.setAttribute('id', 'titleScreenText');
    titleScreenText.setAttribute('class', 'studio-ts-text');
    titleScreenText.setAttribute(
      'x',
      (constants.TITLE_SCREEN_TEXT_WIDTH / 2).toString(),
    );
    titleScreenText.setAttribute('y', '0');
    titleScreenText.appendChild(document.createTextNode(''));

    titleScreenTextGroup.appendChild(titleScreenTextRect);
    titleScreenTextGroup.appendChild(titleScreenText);
    this.svg.appendChild(titleScreenTextGroup);
  }

  private createCoordinateGridBackground(options: {
    origin: number;
    firstLabel: number;
    lastLabel: number;
    increment: number;
  }) {
    const {origin, firstLabel, lastLabel, increment} = options;

    const backgroundLayer = document.getElementById('backgroundLayer');
    if (!backgroundLayer) {
      return;
    }

    const CANVAS_HEIGHT = 400;

    const rectFromElementBoundingBox = (element: SVGGraphicsElement) => {
      const bbox = element.getBBox();
      const rect = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'rect',
      );
      rect.setAttribute('x', bbox.x.toString());
      rect.setAttribute('y', bbox.y.toString());
      rect.setAttribute('width', bbox.width.toString());
      rect.setAttribute('height', bbox.height.toString());
      return rect;
    };

    for (let label = firstLabel; label <= lastLabel; label += increment) {
      // create x axis labels
      let text = document.createElementNS(SVG_NS, 'text');
      text.appendChild(document.createTextNode(label.toString()));
      backgroundLayer.appendChild(text);
      let bbox = text.getBBox();
      text.setAttribute('x', (label - origin - bbox.width / 2).toString());
      text.setAttribute('y', CANVAS_HEIGHT.toString());
      text.setAttribute('font-weight', 'bold');
      let rect = rectFromElementBoundingBox(text);
      rect.setAttribute('fill', '#ffffff');
      backgroundLayer.insertBefore(rect, text);

      // create y axis labels
      text = document.createElementNS(SVG_NS, 'text');
      text.appendChild(document.createTextNode(label.toString()));
      backgroundLayer.appendChild(text);
      bbox = text.getBBox();
      text.setAttribute('x', '0');
      text.setAttribute('y', (CANVAS_HEIGHT - (label - origin)).toString());
      text.setAttribute('dominant-baseline', 'central');
      text.setAttribute('font-weight', 'bold');
      rect = rectFromElementBoundingBox(text);
      rect.setAttribute('fill', '#ffffff');
      backgroundLayer.insertBefore(rect, text);
    }
  }

  drawMapTiles() {
    // If we're just using the level's own map, then draw it only once.
    if (!this.wallMap && this.tilesDrawn) {
      return;
    }

    this.tilesDrawn = true;

    let row, col;

    const tilesDrawn: boolean[][] = [];
    for (row = 0; row < this.ROWS; row++) {
      tilesDrawn.push([]);
      for (col = 0; col < this.COLS; col++) {
        tilesDrawn[row].push(false);
      }
    }

    const backgroundLayer = document.getElementById(
      'backgroundLayer',
    ) as unknown as SVGElement | undefined;
    if (!backgroundLayer) {
      return;
    }

    const overlayURI = this.walls?.getWallOverlayURI();
    if (overlayURI) {
      let wallOverlay = document.getElementById('wallOverlay') as unknown as
        | SVGImageElement
        | undefined;
      if (!wallOverlay) {
        wallOverlay = document.createElementNS(SVG_NS, 'image');
        wallOverlay.setAttribute('id', 'wallOverlay');
        wallOverlay.setAttribute('height', this.MAZE_HEIGHT.toString());
        wallOverlay.setAttribute('width', this.MAZE_WIDTH.toString());
        wallOverlay.setAttribute('x', '0');
        wallOverlay.setAttribute('y', '0');
        backgroundLayer?.appendChild(wallOverlay);
      }
      wallOverlay.setAttributeNS(
        'http://www.w3.org/1999/xlink',
        'xlink:href',
        overlayURI,
      );
    }

    for (row = 0; row < this.ROWS; row++) {
      for (col = 0; col < this.COLS; col++) {
        const wallVal = this.getWallValue(row, col);
        if (wallVal) {
          // Skip if we've already drawn a large tile that covers this square.
          if (tilesDrawn[row][col]) {
            continue;
          }

          const srcWallType =
            (wallVal & constants.WallTypeMask) >> constants.WallTypeShift;

          if (srcWallType === WallType.DOUBLE_SIZE) {
            tilesDrawn[row][col] = true;
            tilesDrawn[row][col + 1] = true;
            tilesDrawn[row + 1][col] = true;
            tilesDrawn[row + 1][col + 1] = true;
          }

          this.drawWallTile(backgroundLayer, wallVal, row, col);
        }
      }
    }
  }

  drawWallTile(svg: SVGElement, wallVal: number, row: number, col: number) {
    let srcRow, srcCol;

    // Defaults for regular tiles:
    let tiles = this.skin.tiles;
    let srcWallType = 0;
    let tileSize = this.SQUARE_SIZE;
    let addOffset = 0; // Added to X & Y to offset drawn tile.
    let numSrcRows = 8;
    let numSrcCols = 8;

    // We usually won't try jumbo size.
    let jumboSize = false;

    if (wallVal === SquareType.WALL) {
      // use a random coordinate
      // TODO (cpirich): these should probably be chosen once at level load time
      // and we should allow the level/skin to set specific row/col max values
      // to ensure that reasonable tiles are chosen at random
      srcRow = Math.floor(Math.random() * constants.WallRandomCoordMax);
      // Since [0,0] is not a valid wall tile, ensure that we avoid column zero
      // when row zero was chosen at random
      srcCol = srcRow
        ? Math.floor(Math.random() * constants.WallRandomCoordMax)
        : 1 + Math.floor(Math.random() * (constants.WallRandomCoordMax - 1));
    } else {
      // This wall value has been explicitly set.  It encodes the row & col from
      // the spritesheet of wall tile images.
      srcRow =
        (wallVal & constants.WallCoordRowMask) >> constants.WallCoordRowShift;
      srcCol =
        (wallVal & constants.WallCoordColMask) >> constants.WallCoordColShift;
      srcWallType =
        (wallVal & constants.WallTypeMask) >> constants.WallTypeShift;

      if (srcWallType === constants.WallType.JUMBO_SIZE) {
        // Jumbo tiles come from a separate sprite sheet which has oversize tiles
        // which are drawn in an overlapping fashion, though centered on the
        // regular tiles' centers.
        jumboSize = true;
        tileSize =
          this.skin.backgrounds?.[this.background || '']?.jumboTilesSize || 0;
        numSrcRows =
          this.skin.backgrounds?.[this.background || '']?.jumboTilesRows || 0;
        numSrcCols =
          this.skin.backgrounds?.[this.background || '']?.jumboTilesCols || 0;
      } else if (srcWallType === constants.WallType.DOUBLE_SIZE) {
        // Double-size tiles are just a regular tile expanded to cover 2x2 tiles.
        tileSize = 2 * this.SQUARE_SIZE;
      }
    }

    // Attempt to load tiles that match the current background, if specified.
    if (
      this.background &&
      !jumboSize &&
      this.skin.backgrounds?.[this.background]?.tiles
    ) {
      tiles = this.skin.backgrounds[this.background].tiles;
    } else if (
      this.background &&
      jumboSize &&
      this.skin.backgrounds?.[this.background]?.jumboTiles
    ) {
      tiles = this.skin.backgrounds[this.background || ''].jumboTiles;
      addOffset =
        this.skin.backgrounds[this.background || ''].jumboTilesAddOffset || 0;
    }

    const clipPath = document.createElementNS(SVG_NS, 'clipPath');
    const clipId = 'tile_clippath_' + this.tiles.length;
    clipPath.setAttribute('id', clipId);
    clipPath.setAttribute('class', 'tile');
    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('width', tileSize.toString());
    rect.setAttribute('height', tileSize.toString());
    rect.setAttribute('x', (col * this.SQUARE_SIZE + addOffset).toString());
    rect.setAttribute('y', (row * this.SQUARE_SIZE + addOffset).toString());
    clipPath.appendChild(rect);
    this.svg.appendChild(clipPath);

    const tile = document.createElementNS(SVG_NS, 'image');
    const tileId = 'tile_' + this.tiles.length;
    tile.setAttribute('id', tileId);
    tile.setAttribute('class', 'tileClip');
    tile.setAttribute('width', (numSrcCols * tileSize).toString());
    tile.setAttribute('height', (numSrcRows * tileSize).toString());
    tile.setAttribute(
      'x',
      (col * this.SQUARE_SIZE - srcCol * tileSize + addOffset).toString(),
    );
    tile.setAttribute(
      'y',
      (row * this.SQUARE_SIZE - srcRow * tileSize + addOffset).toString(),
    );
    tile.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'xlink:href',
      tiles || '',
    );
    svg.appendChild(tile);

    tile.setAttribute('clip-path', `url(#${clipId})`);

    const tileEntry = {
      bottomY: row * this.SQUARE_SIZE + addOffset + tileSize,
    };
    this.tiles.push(tileEntry);
  }

  onSvgClicked(e: Event) {
    if (
      this.level.tapSvgToRunAndReset &&
      this.gameState === GameStates.WAITING
    ) {
      this.dispatchEvent(new CustomEvent('run'));
    } else if (
      this.level.tapSvgToRunAndReset &&
      this.gameState === GameStates.OVER
    ) {
      this.dispatchEvent(new CustomEvent('reset'));
    } else if (this.tickCount > 0) {
      // If we are "running", check the cmdQueues.
      // Check the first command in all of the cmdQueues to see if there is a
      // pending "wait for click" command
      /*
      Studio.eventHandlers.forEach(function (handler) {
        const cmd = handler.cmdQueue[0];

        if (cmd && cmd.opts.waitForClick && !cmd.opts.complete) {
          if (cmd.opts.waitCallback) {
            cmd.opts.waitCallback();
          }
          cmd.opts.complete = true;
        }
      });
      */
    }
    e.preventDefault(); // Stop normal events.
  }

  onSvgDrag(e: InteractEvent) {
    if (this.tickCount > 0) {
      const direction = e.delta ? e.delta.x : 0;

      this.gesturesObserved[direction] = Math.round(
        e.rect.width / DRAG_DISTANCE_TO_MOVE_RATIO,
      );

      // Prevent default behavior
      e.preventDefault();
    }
  }

  /**
   * Creates DOM elements for the given goal, and augments the goal object
   * with pointers to those elements.
   * Note that if this method is called after the initialization step, it
   * will likely need to be followed with a call to sortDrawOrder.
   *
   * @param i - a unique identifier, used to create ids for
   *        created elements
   * @param goal - The metadata including the position of the goal.
   */
  createGoalElements(i: number, goal: Goal) {
    const backgroundLayer = document.getElementById('backgroundLayer');

    if (!backgroundLayer) {
      return;
    }

    const goalOverride = this.level.goalOverride || {};
    let numFrames = 1;
    if (goalOverride.goalAnimation && this.skin.animatedGoalFrames) {
      numFrames = this.skin.animatedGoalFrames;
    }

    // Calculate the dimensions of the spritesheet & the sprite itself that's rendered
    // out of it.  Precedence order is skin.goalSpriteWidth/Height, goalOverride.imageWidth/Height,
    // and then Studio.MARKER_WIDTH/HEIGHT.
    //
    // Legacy levels might specify goalOverride.imageWidth/Height which are dimensions
    // of the entire spritesheet, and rely upon studio's default MARKER_WIDTH/HEIGHT which
    // are dimensions of the sprite itself.
    // Newer levels might specify skin.goalSpriteWith/Height which are the dimensions of the
    // sprite itself.  The dimensions of the spritesheet are calculated using skin.animatedGoalFrames.
    // The fallback dimensions of both spritesheet and sprite are studio's default
    // MARKER_WIDTH/HEIGHT.

    const spritesheetWidth = this.skin.goalSpriteWidth
      ? this.skin.goalSpriteWidth * numFrames
      : goalOverride.imageWidth || this.MARKER_WIDTH;
    const spritesheetHeight = this.skin.goalSpriteHeight
      ? this.skin.goalSpriteHeight
      : goalOverride.imageHeight || this.MARKER_HEIGHT;

    const spriteWidth = this.skin.goalSpriteWidth || this.MARKER_WIDTH;
    const spriteHeight = this.skin.goalSpriteHeight || this.MARKER_HEIGHT;

    const offsetX =
      goalOverride.goalRenderOffsetX || this.skin.goalRenderOffsetX || 0;
    const offsetY =
      goalOverride.goalRenderOffsetY || this.skin.goalRenderOffsetY || 0;

    // Add finish markers.
    goal.clipPath = document.createElementNS(SVG_NS, 'clipPath');
    goal.clipPath.setAttribute('id', 'finishClipPath' + i);
    goal.clipRect = document.createElementNS(SVG_NS, 'rect');
    goal.clipRect.setAttribute('id', 'finishClipRect' + i);
    goal.clipRect.setAttribute('width', spriteWidth.toString());
    goal.clipRect.setAttribute('height', spriteHeight.toString());
    goal.clipPath.appendChild(goal.clipRect);
    // Safari workaround: Clip paths work better when descendant of an SVGGElement.
    backgroundLayer.appendChild(goal.clipPath);

    goal.marker = document.createElementNS(SVG_NS, 'image');
    goal.marker.setAttribute('id', 'spriteFinish' + i);
    goal.marker.setAttribute('width', spritesheetWidth.toString());
    goal.marker.setAttribute('height', spritesheetHeight.toString());
    if (!this.skin.disableClipRectOnGoals) {
      goal.marker.setAttribute('clip-path', `url(#${goal.clipPath.id})`);
    }
    goal.marker.setAttribute('x', (goal.x + offsetX).toString());
    goal.marker.setAttribute('y', (goal.y + offsetY).toString());
    goal.marker.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'xlink:href',
      this.getGoalAssetFromSkin(),
    );
    goal.marker.setAttribute('opacity', '1');
    goal.clipRect.setAttribute('x', (goal.x + offsetX).toString());
    goal.clipRect.setAttribute('y', (goal.y + offsetY).toString());
    this.svg.appendChild(goal.marker);
  }

  /** @returns URL of the asset to use for goal objects */
  getGoalAssetFromSkin(): string {
    let goalAsset = this.skin.goal;
    if (this.level.goalOverride) {
      if (this.level.goalOverride.goalAnimation) {
        goalAsset = this.skin.items?.[this.level.goalOverride.goalAnimation];
      } else if (this.level.goalOverride.goalImage) {
        goalAsset = this.skin.items?.[this.level.goalOverride.goalImage];
      }
    }

    return goalAsset || '';
  }

  /**
   * Apply the effect specified in skin.goalEffect to all of the goal objects
   * in the level.
   */
  applyGoalEffect() {
    if (!this.goalFilterEffect) {
      this.goalFilterEffect = new GlowFilter(this.svg);
    }

    if (this.goalFilterEffect) {
      this.allGoals().forEach(goal => {
        if (goal.marker) {
          this.goalFilterEffect?.applyTo(goal.marker);
        }
      });
    }
  }

  allGoals() {
    return this.spriteGoals.concat(this.dynamicSpriteGoals);
  }

  setBackground(opts: {value: string}) {
    if (typeof opts.value !== 'string') {
      throw new TypeError('Incorrect parameter: ' + opts.value);
    }

    let backgroundValue = opts.value.toLowerCase().trim();

    if (backgroundValue === constants.RANDOM_VALUE) {
      // NOTE: never select the last item from backgroundChoicesK1, since it is
      // presumed to be the "random" item for blockly
      // NOTE: the [1] index in the array contains the name parameter with an
      // additional set of quotes
      const quotedBackground =
        this.skin.backgroundChoicesK1?.[
          Math.floor(Math.random() * (this.skin.backgroundChoicesK1.length - 1))
        ]?.[1] || '""';

      // Remove the outer quotes:
      backgroundValue = quotedBackground.replace(/^"(.*)"$/, '$1');
    }

    const skinBackground = this.skin.backgrounds?.[backgroundValue];
    if (!skinBackground) {
      throw new RangeError('Incorrect parameter: ' + opts.value);
    }

    if (backgroundValue !== this.background) {
      this.background = backgroundValue;
      this.walls?.setBackground(backgroundValue);

      const element = document.getElementById('background');
      element?.setAttributeNS(
        'http://www.w3.org/1999/xlink',
        'xlink:href',
        skinBackground.background,
      );

      // Draw the tiles (again) now that we know which background we're using.
      if (this.wallMapCollisions) {
        // Changing background can cause a change in the map used internally,
        // since we might use a different map to suit this background, so set
        // the map again.
        if (this.wallMapRequested) {
          this.setMap({
            value: this.wallMapRequested,
            forceRedraw: true,
          });
        }
      }

      this.loadClouds();
    }
  }

  /**
   * Load clouds for the current background if it features them, or hide
   * them if they shouldn't currently be shown.
   */
  loadClouds() {
    const showClouds = !!(
      this.background && this.skin.backgrounds?.[this.background]?.clouds
    );

    if (!showClouds) {
      // Hide the clouds offscreen.
      for (let i = 0; i < constants.MAX_NUM_CLOUDS; i++) {
        const cloud = document.getElementById('cloud' + i);
        cloud?.setAttribute('x', (-constants.CLOUD_SIZE).toString());
        cloud?.setAttribute('y', (-constants.CLOUD_SIZE).toString());
      }
    } else {
      // Set up the right clouds.
      for (
        let i = 0;
        i <
        (this.skin.backgrounds?.[this.background || '']?.clouds?.length || 0);
        i++
      ) {
        const cloud = document.getElementById('cloud' + i);
        cloud?.setAttribute('width', constants.CLOUD_SIZE.toString());
        cloud?.setAttribute('height', constants.CLOUD_SIZE.toString());
        cloud?.setAttributeNS(
          'http://www.w3.org/1999/xlink',
          'xlink:href',
          this.skin.backgrounds?.[this.background || '']?.clouds?.[i] || '',
        );
        cloud?.setAttribute('opacity', constants.CLOUD_OPACITY.toString());

        const location = this.getCloudLocation(i);
        cloud?.setAttribute('x', location.x.toString());
        cloud?.setAttribute('y', location.y.toString());
      }
    }
  }

  /**
   * Gets the current location of a specified cloud.
   */
  getCloudLocation(cloudIndex: number): {
    x: number;
    y: number;
  } {
    // How many milliseconds to move one pixel.  Higher values mean slower clouds,
    // and making them different causes the clouds to animate out of sync.
    const intervals = [50, 60];

    // How many pixels a cloud moves before it loops.  This value is big enough to
    // make a cloud move entirely aross the game area, looping when completely
    // out of view.
    const distance = this.MAZE_WIDTH + constants.CLOUD_SIZE;

    const totalTime = this.cloudStep * 30;
    const xOffset = (totalTime / intervals[cloudIndex]) % distance;

    let x: number = 0;
    let y: number = 0;

    if (cloudIndex === 0) {
      // The first cloud animates from top-left to bottom-right, in the upper-right
      // half of the screen.
      x = xOffset - this.MAZE_WIDTH / 4;
      y = x - this.MAZE_HEIGHT / 2;
    } else {
      // The second cloud animates from bottom-right to top-left, in the lower-left
      // half of the screen.
      x = this.MAZE_WIDTH - xOffset;
      y = x + this.MAZE_HEIGHT / 2;
    }

    return {x: x, y: y};
  }

  /**
   * Sets an actor to be a specific sprite, or alternatively to be hidden.
   */
  setSprite(opts: {
    /** Name of the sprite, or 'hidden' */
    value: string;
    /** Index of the sprite */
    spriteIndex: number;
    /** Whether or not to force it to be hidden */
    forceHidden?: boolean;
  }) {
    if (typeof opts.value !== 'string') {
      throw new TypeError('Incorrect parameter: ' + opts.value);
    }

    let spriteValue = opts.value.toLowerCase().trim();

    if (spriteValue === constants.RANDOM_VALUE) {
      spriteValue =
        this.skin.avatarList?.[
          Math.floor(Math.random() * this.skin.avatarList.length)
        ] || '';
    }

    const skinSprite: AvatarDefinition | undefined =
      this.skin.avatars?.[spriteValue];
    if (!skinSprite && spriteValue !== 'hidden' && spriteValue !== 'visible') {
      throw new RangeError('Incorrect parameter: ' + opts.value);
    }

    if (!skinSprite) {
      return;
    }

    const spriteIndex = opts.spriteIndex;
    if (spriteIndex < 0 || spriteIndex >= this.spriteCount) {
      return;
    }

    const sprite = this.sprite[spriteIndex];
    if (!sprite) {
      return;
    }

    sprite.visible = spriteValue !== 'hidden' && !opts.forceHidden;

    sprite.value = opts.forceHidden ? 'hidden' : spriteValue;
    if (spriteValue === 'hidden' || spriteValue === 'visible') {
      return;
    }

    sprite.imageName = spriteValue;
    sprite.frameCounts = skinSprite.frameCounts;
    sprite.setNormalFrameDuration(skinSprite.animationFrameDuration);
    sprite.drawScale = skinSprite.drawScale || 1;

    // Reset height and width:
    if (this.skin.gridAlignedMovement) {
      // This mode only works properly with square sprites
      sprite.height = sprite.width = this.SQUARE_SIZE;
      sprite.size = sprite.width / (this.skin.spriteWidth || 0);

      sprite.drawHeight =
        sprite.drawScale * sprite.size * (this.skin.spriteHeight || 0);
      sprite.drawWidth =
        sprite.drawScale * sprite.size * (this.skin.spriteWidth || 0);
    } else {
      sprite.drawHeight = sprite.height =
        sprite.drawScale * sprite.size * (this.skin.spriteHeight || 0);
      sprite.drawWidth = sprite.width =
        sprite.drawScale * sprite.size * (this.skin.spriteWidth || 0);
    }
    if (this.skin.projectileSpriteHeight) {
      sprite.projectileSpriteHeight =
        sprite.size * this.skin.projectileSpriteHeight;
    }
    if (this.skin.projectileSpriteWidth) {
      sprite.projectileSpriteWidth =
        sprite.size * this.skin.projectileSpriteWidth;
    }

    sprite.setImage(skinSprite.walk, sprite.frameCounts);
    sprite.setLegacyImage(skinSprite.sprite, sprite.frameCounts);

    const spriteLayer = document.getElementById('spriteLayer') as unknown as
      | SVGElement
      | undefined;
    if (spriteLayer) {
      sprite.createElement(spriteLayer);
    }

    let element = sprite.getLegacyElement();
    if (element) {
      /*
      dom.addMouseDownTouchEvent(
        sprite.getLegacyElement(),
        delegate(this, Studio.onSpriteClicked, spriteIndex)
      );
     */
    }
    element = sprite.getElement();
    if (element) {
      /*
      dom.addMouseDownTouchEvent(
        sprite.getElement(),
        delegate(this, Studio.onSpriteClicked, spriteIndex)
      );
     */
    }

    // Set up movement audio for the selected sprite (clips should be preloaded)
    // First, stop any movement audio for the current character.
    this.movementAudioOff();
    if (!this.movementAudioEffects[spriteValue] && this.skin.avatarList) {
      const skinSprite: AvatarDefinition | undefined =
        this.skin.avatars?.[spriteValue];
      const audioConfig = skinSprite?.movementAudio || [];
      this.movementAudioEffects[spriteValue] = audioConfig.map(
        audioOption => new ThreeSliceAudio(this.soundBoard, audioOption),
      );
    }
    this.currentSpriteMovementAudioEffects =
      this.movementAudioEffects[spriteValue];

    // call display right away since the frame number may have changed:
    this.displaySprite(spriteIndex);
  }

  movementAudioOff() {
    this.currentMovementAudio?.off();
    this.moveAudioState = false;
  }

  displaySprite(i: number) {
    const sprite = this.sprite[i];

    // avoid lots of unnecessary changes to hidden sprites
    if (sprite.value === 'hidden') {
      return;
    }

    if (sprite.hasActions()) {
      sprite.updateActions();
    } else {
      // TODO (cpirich): move this into Sprite object
      let newDir = Direction.NONE;
      const lastDrawPos = sprite.lastDrawPosition;

      sprite.displayX = sprite.x;
      sprite.displayY = sprite.y;

      const curDrawPos = sprite.getCurrentDrawPosition();

      if (curDrawPos.x !== lastDrawPos.x || curDrawPos.y !== lastDrawPos.y) {
        if (curDrawPos.x < lastDrawPos.x) {
          newDir |= Direction.WEST;
        } else if (curDrawPos.x > lastDrawPos.x) {
          newDir |= Direction.EAST;
        }
        if (curDrawPos.y < lastDrawPos.y) {
          newDir |= Direction.NORTH;
        } else if (curDrawPos.y > lastDrawPos.y) {
          newDir |= Direction.SOUTH;
        }
      }

      if (newDir !== Direction.NONE || sprite.lastMove === Infinity) {
        // Don't change to Direction.NONE here once we've captured a lastMove
        // value, allow the ticksBeforeFaceSouth code to handle that later...
        sprite.setDirection(newDir);
      }
    }

    // Turn sprite toward target direction after evaluating actions.
    if (sprite.dir && sprite.displayDir && sprite.dir !== sprite.displayDir) {
      // Every other frame, assign a new displayDir from state table
      // (only one turn at a time):
      if (this.tickCount && 0 === this.tickCount % 2) {
        sprite.displayDir = NextTurn[sprite.displayDir][sprite.dir];
      }
    }

    // TODO (cpirich): (may be redundant with displayCollidables(Studio.sprite)
    // in onTick loop)
    sprite.display();

    if (sprite.bubbleVisible) {
      this.renderSpeechBubble(i);
    }
  }

  createLevelItems() {
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        const mapVal = this.map?.[row]?.[col]?.getTileType?.() || 0;
        for (
          let index = 0;
          index < (this.skin.ItemClassNames?.length || 0);
          index++
        ) {
          if (constants.squareHasItemClass(index, mapVal)) {
            // Create item:
            const classOptions = this.getItemOptionsForItemClass(
              this.skin.ItemClassNames?.[index] || '',
            );

            const itemOptions: ItemSerialization = {
              ...classOptions,
              x: this.HALF_SQUARE + this.SQUARE_SIZE * col,
              y: this.HALF_SQUARE + this.SQUARE_SIZE * row,
            };

            const item = new Item(this, itemOptions);
            item.createElement(this.svg);

            // Display immediately (we can't assume it will be updated in onTick
            // right away since this is called after 'Reset' as well as 'Run'
            item.display();
            this.items.push(item);
          }
        }
      }
    }
  }

  /**
   * Move all goal sprites to their original positions, and reset their completion
   * state, both visual and logical.
   */
  resetGoalSprites() {
    this.touchAllGoalsEventFired = false;

    const goalOverride = this.level.goalOverride || {};
    const offsetX =
      goalOverride?.goalRenderOffsetX || this.skin.goalRenderOffsetX || 0;
    const offsetY =
      goalOverride?.goalRenderOffsetY || this.skin.goalRenderOffsetY || 0;

    for (const goal of this.spriteGoals) {
      // Mark each finish as incomplete.
      goal.finished = false;
      goal.startFadeTime = undefined;

      // Move the finish icons into position.
      goal.marker?.setAttribute('x', (goal.x + offsetX).toString());
      goal.marker?.setAttribute('y', (goal.y + offsetY).toString());
      goal.marker?.setAttributeNS(
        'http://www.w3.org/1999/xlink',
        'xlink:href',
        this.getGoalAssetFromSkin(),
      );
      goal.marker?.setAttribute('opacity', '1');
      goal.clipRect?.setAttribute('x', (goal.x + offsetX).toString());
      goal.clipRect?.setAttribute('y', (goal.y + offsetY).toString());
    }

    for (const goal of this.dynamicSpriteGoals) {
      if (goal.marker) {
        goal.marker.parentNode?.removeChild(goal.marker);
      }
      if (goal.clipPath) {
        goal.clipPath.parentNode?.removeChild(goal.clipPath);
      }
    }

    this.dynamicSpriteGoals = [];
  }

  /**
   * Sort the draw order of sprites, explosions, items, and tiles so that items
   * higher on the screen are drawn before the ones in front, for a simple form of
   * z-sorting.
   */
  sortDrawOrder() {
    if (!this.skin.sortDrawOrder) {
      return;
    }

    const spriteLayer = document.getElementById('spriteLayer');

    const drawArray: {
      element: SVGElement;
      y: number;
    }[] = [];

    // Add items.
    for (const item of this.items) {
      const el = item.getElement();
      if (!el) {
        continue;
      }

      const drawItem = {
        element: el,
        y: item.y + item.height / 2 + item.renderOffset.y,
      };

      if (drawItem.element) {
        drawArray.push(drawItem);
      }

      this.drawDebugRect('itemLocation', item.x, item.y, 4, 4);

      this.drawDebugRect('itemBottom', item.x, drawItem.y, 4, 4);
    }

    // Add sprite elements (both legacy and normal) and explosions.
    for (let i = 0; i < this.sprite.length; i++) {
      const sprite = this.sprite[i];
      const y = sprite.displayY + sprite.height;
      let el = document.getElementById('explosion' + i) as unknown as
        | SVGElement
        | undefined;
      if (el) {
        drawArray.push({
          element: el,
          y: y,
        });
      }

      el = sprite.getElement();
      if (el) {
        drawArray.push({
          element: el,
          y: y,
        });
      }

      el = sprite.getLegacyElement();
      if (el) {
        drawArray.push({
          element: el,
          y: y,
        });
      }

      this.drawDebugRect('spriteBottom', sprite.x, sprite.y, 4, 4);
    }

    // Add wall tiles.
    for (let i = 0; i < this.tiles.length; i++) {
      const el = document.getElementById('tile_' + i) as unknown as
        | SVGElement
        | undefined;
      if (el) {
        drawArray.push({
          element: el,
          y: this.tiles[i].bottomY,
        });
      }
    }

    // Add goals.
    const goalHeight = this.skin.goalCollisionRectHeight || this.MARKER_HEIGHT;
    this.allGoals().forEach(goal => {
      if (goal.marker) {
        drawArray.push({
          element: goal.marker,
          y: goal.y + goalHeight,
        });
      }
    });

    // Now sort everything by y.
    const sortedDrawArray = drawArray.sort((a, b) => a.y - b.y);

    // Carefully place the elements back in the DOM starting at the end of the
    // spriteLayer and, one by one, insert them before the previous one
    // (this prevents flashing in Safari vs. an in-order appendChild() loop)
    let prevNode;
    for (let i = sortedDrawArray.length - 1; i >= 0; i--) {
      if (prevNode) {
        spriteLayer?.insertBefore(sortedDrawArray[i].element, prevNode);
      } else {
        spriteLayer?.appendChild(sortedDrawArray[i].element);
      }
      prevNode = sortedDrawArray[i].element;
    }
  }

  /**
   * Draw a debug line from point to point using the given CSS class name.
   */
  drawDebugLine(
    className: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color?: string,
  ) {
    if (!this.showDebugInfo) {
      return;
    }

    color ||= '#000000';

    const group = document.createElementNS(SVG_NS, 'g');
    group.setAttribute('class', `${className} debugLine`);

    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', x1.toString());
    line.setAttribute('y1', y1.toString());
    line.setAttribute('x2', x2.toString());
    line.setAttribute('y2', y2.toString());
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '2');

    group.appendChild(line);
    this.svg.appendChild(group);
  }

  /**
   * Test to see if an actor sprite will be touching a wall given particular X/Y
   * position coordinates (top-left)
   */
  willSpriteTouchWall(sprite: Sprite, xPos: number, yPos: number): boolean {
    const xCenter = xPos + sprite.width / 2;
    const yCenter = yPos + sprite.height / 2;
    return !!this.walls?.willCollidableTouchWall(sprite, xCenter, yCenter);
  }

  /**
   * Set the wall map.
   */
  setMap(opts: {
    /** The name of the wall map */
    value: string;
    /** Force drawing the map, even if it's already set. */
    forceRedraw?: boolean;
    /** The color to draw the wall, for collisionMaskWalls */
    color?: string;
  }) {
    if (typeof opts.value !== 'string') {
      throw new TypeError('Incorrect parameter: ' + opts.value);
    }

    let mapValue = opts.value.toLowerCase().trim();
    if (mapValue === constants.RANDOM_VALUE) {
      // NOTE: never select the first item from mapChoices, since it is
      // presumed to be the "random" item for blockly
      // NOTE: the [1] index in the array contains the name parameter with an
      // additional set of quotes
      const quotedMap =
        this.skin.mapChoices?.[
          Math.floor(1 + Math.random() * (this.skin.mapChoices.length - 1))
        ]?.[1] || '';
      // Remove the outer quotes:
      mapValue = quotedMap.replace(/^"(.*)"$/, '$1');
    }

    let useMap: string | undefined;
    if (mapValue === 'default') {
      // Treat 'default' as resetting to the level's map (Studio.wallMap = null)
      useMap = undefined;
    } else if (this.skin.getMap) {
      // Give the skin a chance to adjust the map name depending upon the
      // background name.
      useMap = this.skin.getMap(this.background || '', mapValue);
    } else {
      useMap = mapValue;
    }

    if (
      useMap &&
      !this.skin.backgrounds?.[useMap] &&
      !(this.skin.wallMaps && this.skin.wallMaps[useMap])
    ) {
      throw new RangeError('Incorrect parameter: ' + opts.value);
    }

    if (
      !opts.forceRedraw &&
      useMap === this.wallMap &&
      (!opts.color || opts.color === this.wallColor)
    ) {
      return;
    }

    // Use the actual map for collisions, rendering, etc.
    this.wallMap = useMap;
    this.wallMapCollisions = true;
    this.walls?.setWallMapRequested(mapValue);

    // Remember the requested name so that we can reuse it next time the
    // background is changed.
    this.wallMapRequested = opts.value;

    if (opts.color && this.wallColor !== opts.color) {
      this.wallColor = opts.color;
      this.walls?.setColor(opts.color);
    }

    // Draw the tiles (again) now that we know which background we're using.
    //$('.tileClip').remove();
    //$('.tile').remove();
    this.tiles = [];
    this.drawMapTiles();

    this.fixSpriteLocation();

    this.sortDrawOrder();
  }

  createSpeechBubble(spriteIndex: number, text: string) {
    // Start creating the new speech bubble:
    const bblText = document.getElementById(
      'speechBubbleText' + spriteIndex,
    ) as unknown as SVGTextElement | undefined;
    if (!bblText) {
      return;
    }

    const sprite = this.sprite[spriteIndex];
    if (!sprite) {
      return;
    }

    const availableHeight = (this.MAZE_HEIGHT - sprite.height) / 2;
    const maxLines = Math.floor(
      (availableHeight -
        2 * SPEECH_BUBBLE_PADDING -
        2 * SPEECH_BUBBLE_TOP_MARGIN) /
        SPEECH_BUBBLE_LINE_HEIGHT,
    );

    const svgTextOpts = {
      svgText: bblText,
      text: text,
      width: SPEECH_BUBBLE_MIN_WIDTH,
      maxWidth: SPEECH_BUBBLE_MAX_WIDTH,
      lineHeight: SPEECH_BUBBLE_LINE_HEIGHT,
      topMargin: SPEECH_BUBBLE_TOP_MARGIN,
      sideMargin: SPEECH_BUBBLE_SIDE_MARGIN,
      maxLines: maxLines,
      fullHeight:
        maxLines * SPEECH_BUBBLE_LINE_HEIGHT +
        2 * SPEECH_BUBBLE_PADDING +
        2 * SPEECH_BUBBLE_TOP_MARGIN,
    };

    const bblSize = this.setSvgText(svgTextOpts);
    const speechBubblePath = document.getElementById(
      'speechBubblePath' + spriteIndex,
    ) as unknown as SVGElement | undefined;

    if (speechBubblePath) {
      speechBubblePath.setAttribute('height', bblSize.height.toString());
      speechBubblePath.setAttribute('width', bblSize.width.toString());
      Studio.updateSpeechBubblePath(speechBubblePath);
    }
  }

  /**
   * Set text into SVG text tspan elements (manual word wrapping)
   * Thanks http://stackoverflow.com/questions/
   *        7046986/svg-using-getcomputedtextlength-to-wrap-text
   *
   * opts.svgText: existing svg 'text' element
   * opts.text: full-length text string
   * opts.width: total width
   * opts.maxWidth: max width to try, if the text doesn't fit in width
   * opts.fullHeight: total height (fits maxLines of text)
   * opts.maxLines: max number of text lines
   * opts.lineHeight: height per line of text
   * opts.topMargin: top margin
   * opts.sideMargin: left & right margin (deducted from total width)
   */
  setSvgText(opts: SvgTextOptions) {
    let {width} = opts;
    const {text} = opts;
    const words = text.split(' ');

    let longWord = false;
    while (width <= opts.maxWidth) {
      // Remove any children from the svgText node:
      while (opts.svgText.firstChild) {
        opts.svgText.removeChild(opts.svgText.firstChild);
      }

      let wordIndex = 0;
      for (let line = 1; line <= opts.maxLines; line++) {
        // Create new tspan element
        const tspan = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'tspan',
        );
        tspan?.setAttribute('x', (width / 2).toString());
        tspan?.setAttribute(
          'dy',
          (opts.lineHeight + (line === 1 ? opts.topMargin : 0)).toString(),
        );

        // Create text in tspan element
        const text_node = document.createTextNode(words[wordIndex]);
        wordIndex++;

        // Add text to tspan element
        tspan.appendChild(text_node);

        // Add tspan element to DOM
        opts.svgText.appendChild(tspan);

        if (
          tspan.getComputedTextLength &&
          tspan.getComputedTextLength() > width - 2 * opts.sideMargin &&
          width < opts.maxWidth
        ) {
          // We have a really long word, try to expand to fit it.
          width = Math.min(
            tspan.getComputedTextLength() + 2 * opts.sideMargin,
            opts.maxWidth,
          );

          longWord = true;
          break;
        }

        let previousLength;
        do {
          if (wordIndex === words.length) {
            return {
              height:
                opts.fullHeight - (opts.maxLines - line) * opts.lineHeight,
              width: width,
            };
          }

          // Find number of letters in string
          const node = tspan.firstChild as unknown as Text | undefined;
          if (node) {
            previousLength = node.textContent!.length;
            // Add next word
            node.textContent! += ' ' + words[wordIndex];
          }
          wordIndex++;
        } while (
          tspan.getComputedTextLength &&
          tspan.getComputedTextLength() <= width - 2 * opts.sideMargin
        );

        // The last added word made the line too long, remove it
        const node = tspan.firstChild as unknown as Text | undefined;
        if (node) {
          node.textContent = node.textContent!.slice(0, previousLength);
        }
        wordIndex--;
      }

      if (longWord) {
        longWord = false;
      } else if (width < opts.maxWidth) {
        // Try again with a wider speech bubble
        width = Math.min((width * words.length) / wordIndex, opts.maxWidth);
      } else {
        // It fits
        break;
      }
    }

    return {
      height: opts.fullHeight,
      width: width,
    };
  }

  /**
   * createSpeechBubblePath creates a SVG path that looks like a rounded rect
   * plus a 'tip' that points back to the sprite.
   *
   * x, y is the top left position. w, h, r are width/height/radius (for corners)
   * onTop, onRight are booleans that are used to tell this function if the
   * bubble is appearing on top and on the right of the sprite, tipOffset is how
   * far in from the corner to draw the tip.
   *
   * Thanks to Remy for the original rounded rect path function
   * http://www.remy-mellet.com/blog/179-draw-rectangle-with-123-or-4-rounded-corner/
   */
  static createSpeechBubblePath(
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    onTop: boolean,
    onRight: boolean,
    tipOffset: number,
  ) {
    const TIP_HEIGHT = 15;
    const TIP_WIDTH = 25;
    const TIP_X_SHIFT = 10;
    const p = (x: number, y: number) => `${x} ${y} `;

    let strPath = 'M' + p(x + r, y); //A
    if (!onTop) {
      if (onRight) {
        strPath += 'L' + p(x + r + tipOffset, y);
        strPath +=
          'L' +
          p(x + r - TIP_X_SHIFT + tipOffset, y - TIP_HEIGHT) +
          'L' +
          p(x + r + TIP_WIDTH + tipOffset, y);
      } else {
        strPath +=
          'L' +
          p(x + w - r - TIP_WIDTH - tipOffset, y) +
          'L' +
          p(x + w - TIP_X_SHIFT - tipOffset, y - TIP_HEIGHT);
        strPath += 'L' + p(x + w - r - tipOffset, y);
      }
    }
    strPath += 'L' + p(x + w - r, y);
    strPath += 'Q' + p(x + w, y) + p(x + w, y + r); //B
    strPath +=
      'L' + p(x + w, y + h - r) + 'Q' + p(x + w, y + h) + p(x + w - r, y + h); //C
    if (onTop) {
      if (onRight) {
        strPath +=
          'L' +
          p(x + r + TIP_WIDTH + tipOffset, y + h) +
          'L' +
          p(x + r - TIP_X_SHIFT + tipOffset, y + h + TIP_HEIGHT);
        strPath += 'L' + p(x + r + tipOffset, y + h);
      } else {
        strPath += 'L' + p(x + w - r - tipOffset, y + h);
        strPath +=
          'L' +
          p(x + w - TIP_X_SHIFT - tipOffset, y + h + TIP_HEIGHT) +
          'L' +
          p(x + w - r - TIP_WIDTH - tipOffset, y + h);
      }
    }
    strPath += 'L' + p(x + r, y + h);
    strPath += 'Q' + p(x, y + h) + p(x, y + h - r); //D
    strPath += 'L' + p(x, y + r) + 'Q' + p(x, y) + p(x + r, y); //A
    strPath += 'Z';
    return strPath;
  }

  static updateSpeechBubblePath(element: SVGElement) {
    const height = parseInt(element.getAttribute('height') || '0');
    const width = parseInt(element.getAttribute('width') || '0');
    const onTop = 'true' === element.getAttribute('onTop');
    const onRight = 'true' === element.getAttribute('onRight');
    const tipOffset = parseInt(element.getAttribute('tipOffset') || '0');

    element.setAttribute(
      'd',
      Studio.createSpeechBubblePath(
        0,
        0,
        width,
        height,
        SPEECH_BUBBLE_RADIUS,
        onTop,
        onRight,
        tipOffset,
      ),
    );
  }

  renderSpeechBubble(i: number) {
    const sprite = this.sprite[i];

    const speechBubble = document.getElementById(
      'speechBubble' + i,
    ) as unknown as SVGElement | undefined;
    const speechBubblePath = document.getElementById(
      'speechBubblePath' + i,
    ) as unknown as SVGElement | undefined;
    const oldTipOffset = parseInt(
      speechBubblePath?.getAttribute('tipOffset') || '0',
    );
    const wasOnTop = 'true' === speechBubblePath?.getAttribute('onTop');
    const wasOnRight = 'true' === speechBubblePath?.getAttribute('onRight');
    const bubbleHeight = parseInt(
      speechBubblePath?.getAttribute('height') || '0',
    );
    const bubbleWidth = parseInt(
      speechBubblePath?.getAttribute('width') || '0',
    );

    if (!speechBubble) {
      return;
    }

    if (!speechBubblePath) {
      return;
    }

    const newBubblePosition = this.calculateBubblePosition(
      sprite,
      bubbleHeight,
      bubbleWidth,
      this.MAZE_WIDTH,
    );

    speechBubblePath.setAttribute('onTop', newBubblePosition.onTop.toString());
    speechBubblePath.setAttribute(
      'onRight',
      newBubblePosition.onRight.toString(),
    );
    speechBubblePath.setAttribute(
      'tipOffset',
      newBubblePosition.tipOffset.toString(),
    );

    if (
      wasOnTop !== newBubblePosition.onTop ||
      wasOnRight !== newBubblePosition.onRight ||
      oldTipOffset !== newBubblePosition.tipOffset
    ) {
      Studio.updateSpeechBubblePath(speechBubblePath);
    }

    speechBubble.setAttribute(
      'transform',
      `translate(${newBubblePosition.xSpeech}, ${newBubblePosition.ySpeech})`,
    );
  }

  calculateBubblePosition(
    sprite: Sprite,
    bubbleHeight: number,
    bubbleWidth: number,
    studioWidth: number,
  ): {
    onTop: boolean;
    onRight: boolean;
    tipOffset: number;
    xSpeech: number;
    ySpeech: number;
  } {
    let onTop = true;
    let ySpeech = sprite.y - (bubbleHeight + SPEECH_BUBBLE_PADDING);
    if (ySpeech < SPEECH_BUBBLE_TOP_MARGIN) {
      ySpeech = sprite.y + sprite.height + SPEECH_BUBBLE_PADDING;
      onTop = false;
    }

    let onRight;
    let xSpeech;
    let tipOffset = 0;
    if (sprite.x > (studioWidth - sprite.width) / 2) {
      onRight = false;
      xSpeech =
        sprite.x + sprite.width - (bubbleWidth + SPEECH_BUBBLE_H_OFFSET);
      if (xSpeech < SPEECH_BUBBLE_SIDE_MARGIN) {
        tipOffset = SPEECH_BUBBLE_SIDE_MARGIN - xSpeech;
        xSpeech = SPEECH_BUBBLE_SIDE_MARGIN;
      }
    } else {
      onRight = true;
      xSpeech = sprite.x + SPEECH_BUBBLE_H_OFFSET;
      const maxXSpeech = studioWidth - bubbleWidth - SPEECH_BUBBLE_SIDE_MARGIN;
      if (xSpeech > maxXSpeech) {
        tipOffset = xSpeech - maxXSpeech;
        xSpeech = maxXSpeech;
      }
    }

    return {
      onTop,
      onRight,
      tipOffset,
      xSpeech,
      ySpeech,
    };
  }

  /**
   * De-duplicated legwork of finding appropriate options for the given item
   * class.  Does not set things like position and direction - those should
   * be applied on top of the returned options object.
   * @returns The serialization of an Item that can be passed to item constructor.
   */
  getItemOptionsForItemClass(itemClass: string): ItemSerialization {
    const classProperties = this.skin.specialItemProperties?.[itemClass];

    return {
      ...(classProperties || {}),
      x: 0,
      y: 0,
      className: itemClass,
      image: this.skin.items?.[itemClass] || '',
      frames: this.getFrameCount(
        itemClass,
        this.skin.specialItemProperties,
        this.skin.itemFrames,
      ),
      loop: true,
      dir: Direction.NONE,
      speed: this.itemSpeed[itemClass],
      normalSpeed: classProperties?.speed || 0,
      activity: this.itemActivity[itemClass] || Behavior.WANDER,
      isHazard: !!classProperties?.isHazard,
      spritesCounterclockwise: !!classProperties?.spritesCounterclockwise,
      renderOffset: classProperties?.renderOffset || {x: 0, y: 0},
      renderScale: classProperties?.scale || 1,
      animationFrameDuration: classProperties?.animationFrameDuration || 0,
    };
  }

  /**
   * Return the frame count for items or projectiles
   */
  getFrameCount(
    className: string,
    exceptionList?: {[key: string]: ItemDefinition},
    defaultCount?: number,
  ): number {
    if (/.gif$/.test(this.skin.items?.[className] || '')) {
      return 1;
    } else if (exceptionList?.[className]?.frames) {
      return exceptionList[className].frames;
    }

    return defaultCount || 1;
  }

  /**
   * A call to setMap might place a wall on top of the sprite.  In that case,
   * find a new nearby location for the sprite that doesn't have a wall.
   * Currently a work in progress with known issues.
   */
  fixSpriteLocation() {
    if (!this.wallMapCollisions) {
      return;
    }

    for (let i = 0; i < this.sprite.length; i++) {
      const sprite = this.sprite[i];
      const position = this.getNextPosition(i, false);

      if (this.willSpriteTouchWall(sprite, position.x, position.y)) {
        // Let's assume that one of the surrounding 8 squares is available.
        // (Note: this is a major assumption predicated on level design.)

        let xCenter = position.x + sprite.width / 2;
        let yCenter = position.y + sprite.height / 2;

        xCenter +=
          (this.skin.wallCollisionRectOffsetX || 0) +
          (this.skin.wallCollisionRectWidth || 0) / 2;
        yCenter +=
          (this.skin.wallCollisionRectOffsetY || 0) +
          (this.skin.wallCollisionRectHeight || 0) / 2;

        const xGrid = Math.floor(xCenter / this.SQUARE_SIZE);
        const yGrid = Math.floor(yCenter / this.SQUARE_SIZE);

        const minRow = Math.max(yGrid - 1, 0);
        const maxRow = Math.min(yGrid + 1, this.ROWS - 1);
        const minCol = Math.max(xGrid - 1, 0);
        const maxCol = Math.min(xGrid + 1, this.COLS - 1);

        for (let row = minRow; row <= maxRow; row++) {
          for (let col = minCol; col <= maxCol; col++) {
            const tryX =
              this.HALF_SQUARE +
              this.SQUARE_SIZE * col -
              sprite.width / 2 -
              (this.skin.wallCollisionRectOffsetX || 0);
            const tryY =
              this.HALF_SQUARE +
              this.SQUARE_SIZE * row -
              sprite.height / 2 -
              (this.skin.wallCollisionRectOffsetY || 0);
            if (!this.willSpriteTouchWall(sprite, tryX, tryY)) {
              sprite.x = tryX;
              sprite.y = tryY;
              sprite.setDirection(Direction.NONE);
              return;
            }
          }
        }
      }
    }
  }

  /*
   * Return the next position for this sprite on a given coordinate axis
   * given the queued moves (yAxis === false means xAxis)
   * NOTE: position values returned are not clamped to playspace boundaries
   */
  getNextPosition(index: number, modifyQueues: boolean) {
    const delta = this.calcMoveDistanceFromQueues(index, modifyQueues);
    if (delta.x === 0 && delta.y === 0) {
      return this.sprite[index].getNextPosition();
    }

    return {
      x: this.sprite[index].x + delta.x,
      y: this.sprite[index].y + delta.y,
    };
  }

  calcMoveDistanceFromQueues(_i: number, _modifyQueues: boolean) {
    const totalDelta = {x: 0, y: 0};

    /*
    this.eventHandlers.forEach(handler => {
      const cmd = handler.cmdQueue[0];
      if (cmd?.name === 'moveDistance' && cmd?.opts?.spriteIndex === index) {
        const distThisMove = Math.min(
          cmd.opts.queuedDistance || Infinity,
          this.sprite[cmd.opts.spriteIndex]!.speed
        );

        const normalize = (vector: {x: number, y: number}): {x: number; y: number} => {
          const mag = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
          if (mag === 0) {
            return vector;
          }

          return {
            x: vector.x / mag,
            y: vector.y / mag,
          };
        };

        const moveDirection = normalize(UNIT_VECTOR[cmd.opts.dir]);

        totalDelta.x += distThisMove * moveDirection.x;
        totalDelta.y += distThisMove * moveDirection.y;

        if (modifyQueues && (moveDirection.x !== 0 || moveDirection.y !== 0)) {
          cmd.opts.queuedDistance -= distThisMove;
          if ('0.00' === Math.abs(cmd.opts.queuedDistance).toFixed(2)) {
            handler.cmdQueue.shift();
          }
        }
      }
    });
   */

    return totalDelta;
  }
}

export default Studio;
