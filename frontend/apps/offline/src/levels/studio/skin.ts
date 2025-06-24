import type {MusicTrackDefinition, ThreeSliceAudioDefinition} from '@/audio';

import {Behavior, SpriteSpeed} from './constants';

export interface WallMap {
  srcUrl: string;
}

export interface WallMaps {
  [key: string]: WallMap;
}

export interface CollisionRect {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface ObstacleZone {
  [key: string]: CollisionRect[];
}

export interface ObstacleZones {
  [key: string]: ObstacleZone;
}

export interface ItemDefinition {
  frames: number;
  animationFrameDuration?: number;
  width?: number;
  height?: number;
  scale?: number;
  renderOffset?: {
    x: number;
    y: number;
  };
  activity?: Behavior;
  speed?: SpriteSpeed;
  spritesCounterclockwise?: boolean;
  isHazard?: boolean;
}

export interface AvatarDefinition {
  sprite: string;
  walk: string;
  dropdownThumbnail: string;
  frameCounts: {
    normal: number;
    turns: number;
    emotions: number;
    walk: number;
  };
  animations: {
    turns: number;
  };
  drawScale?: number;
  animationFrameDuration: number;
  movementAudio: ThreeSliceAudioDefinition[];
}

export interface Skin {
  /** The unique id for the skin. */
  id: string;
  /** A function that returns the URL for any named asset. */
  assetUrl: (name: string) => string;
  /** The normal avatar */
  staticAvatar?: string;
  /** The 'small' avatar for the UI */
  smallStaticAvatar?: string;
  /** The set of avatars */
  avatarList?: string[];
  customObstacleZones?: ObstacleZones;
  wallMaps?: WallMaps;
  /** List of sound names */
  sounds?: string[];
  /** List of generic sounds that are 'built-in' */
  builtinSounds?: string[];
  /** List of sound groups and properties that affect how they can be used randomly */
  soundGroups?: {
    [key: string]: {
      randomValue: string;
      minSuffix: number;
      maxSuffix: number;
    };
  };
  /** Dropdown listing for different sounds to choose from */
  soundChoices?: [string, string][];
  /** Choices just for pre-readers */
  soundChoicesK1?: [string, string][];
  /** Sound metadata for playback */
  soundMetadata?: {
    name: string;
    volume: number;
  }[];
  musicMetadata?: MusicTrackDefinition[];
  /** Normally the sound isn't played for the final goal, but this can force it. */
  playFinalGoalSound?: boolean;
  /** Used to provide block dropdown choices for maps */
  mapChoices?: [string, string][];
  /** Used to provide block dropdown choices for backgrounds */
  backgroundChoices?: [string, string][];
  /** Used to provide block dropdown choices for backgrounds for pre-readers */
  backgroundChoicesK1?: [string, string][];
  /** Used to provide block dropdown choices for sprite selection */
  spriteChoices?: [string, string][];
  /** What the set sprite block says */
  setSpritePrefix?: string;
  /** Used to provide block dropdown choices for projectiles */
  projectileChoices?: [string, string][];
  /** Used to provide block dropdown choices for items */
  itemChoices?: [string, string][];
  /** Used to provide activity dropdown choices */
  activityChoices?: [string, string][];
  /** Overrides generic block titles */
  msgOverrides?: {
    [key: string]: string;
  };
  /** Whether or not we want to preload the multimedia assets */
  preloadAssets?: boolean;
  /** Prohibits the clip-path being assigned to the goal markers */
  disableClipRectOnGoals?: boolean;
  sortDrawOrder?: boolean;
  gridAlignedMovement?: boolean;
  gridAlignedExtraPauseSteps?: number;
  slowExecutionFactor?: number;
  hideIconInClearPuzzle?: boolean;
  /** Preferred background name */
  background?: string;
  /** Fallback background name */
  defaultBackground?: string;
  showGrid?: boolean;
  projectileFrames?: number;
  itemFrames?: number;
  explosion?: string;
  explosionFrames?: number;
  /** Spritesheet for animated goal. */
  animatedGoal?: string;
  /** How many frames in the animated goal spritesheet. */
  animatedGoalFrames?: number;
  /** Width of the goal sprite. */
  goalSpriteWidth?: number;
  /** Height of the goal sprite. */
  goalSpriteHeight?: number;
  /** For a smaller width for a collision region on a goal. */
  goalCollisionRectWidth?: number;
  /** For a smaller height for a collision region on a goal. */
  goalCollisionRectHeight?: number;
  /** How long to show each frame of the optional goal animation. */
  timePerGoalAnimationFrame?: number;
  /** Whether or not the goal should fade out when touched. */
  fadeOutGoal?: boolean;
  avatar?: string;
  avatar_2x?: string;
  obstacle?: string;
  decorationAnimation?: string;
  decorationAnimation_2x?: string;
  repeatImage?: string;
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
  startSound: [string, string];
  winSound: [string, string];
  failureSound: [string, string];
  goal?: string;
  goalSuccess?: string;
  /**
   * Offsets the drawn goal from its usual location in the X direction.
   * Useful for oversize goal images.
   */
  goalRenderOffsetX?: number;
  /**
   * Offsets the drawn goal from its usual location in the Y direction.
   * Useful for oversize goal images.
   */
  goalRenderOffsetY?: number;
  spriteWidth?: number;
  spriteHeight?: number;
  dropdownThumbnailWidth?: number;
  dropdownThumbnailHeight?: number;
  /** The width of a rectangle in collidable center from which projectiles begin. */
  projectileSpriteWidth?: number;
  /** The height of a rectangle in collidable center from which projectiles begin. */
  projectileSpriteHeight?: number;
  /** The width of a rectangle in collidable center from which item collisions occur. */
  itemCollisionRectWidth?: number;
  /** The height of a rectangle in collidable center from which item collisions occur. */
  itemCollisionRectHeight?: number;
  /** The width of a rectangle in collidable center from which sprite collisions occur. */
  spriteCollisionRectWidth?: number;
  /** The height of a rectangle in collidable center from which sprite collisions occur. */
  spriteCollisionRectHeight?: number;
  /** The X offset to apply to wall collisions. */
  wallCollisionRectOffsetX?: number;
  /** The Y offset to apply to wall collisions. */
  wallCollisionRectOffsetY?: number;
  /** The width of a rectangle in collidable center from which wall collisions occur. */
  wallCollisionRectWidth?: number;
  /** The height of a rectangle in collidable center from which wall collisions occur. */
  wallCollisionRectHeight?: number;
  /**
   * It's possible to enlarge the rendering of some wall tiles so that they
   * overlap each other a little. Define a bounding rectangle for the source
   * tiles that get this treatment.
   */
  enlargeWallTiles?: {
    minCol: number;
    maxCol: number;
    minRow: number;
    maxRow: number;
  };
  /**
   * When movement is grid aligned, sprite coordinates are the top-left corner
   * of the sprite, and match the top-left corner of the grid square in question.
   * When we draw the sprites bigger, this means the sprite's 'feet' will usually
   * be too far to the right and below that square. These offsets are a chance
   * to move the rendering of the sprite up and to the left, when negative, so
   * that the 'feet' are planted at the bottom center of the grid square.
   */
  gridSpriteRenderOffsetX?: number;
  /** Ditto but for the Y direction. */
  gridSpriteRenderOffsetY?: number;
  preventProjectileLoop?: (name: string) => boolean;
  preventItemLoop?: (name: string) => boolean;
  winAvatar?: string;
  failureAvatar?: string;
  getMap?: (background: string, map: string) => string;
  /** Overrides the default scaling of collision rectangles for sprite touching a goal. */
  finishCollideDistanceScaling?: number;
  instructions2ImageSubstitutions?: {
    [key: string]: string;
  };
  /**
   * The fallback 'empty' image to override the instructions avatar when we
   * lack permission to show the given one.
   */
  blankAvatar?: string;
  /** Which units we allow the avatar to show */
  avatarAllowedInScripts?: string[];

  /** Tile spritesheet (if not specified via backgrounds) */
  tiles?: string;

  walls?: {
    [key: string]: number[][];
  };

  /** The asset collection for player avatars */
  avatars?: {
    [key: string]: AvatarDefinition;
  };

  /** The asset collection for named backgrounds. */
  backgrounds?: {
    [key: string]: {
      background: string;
      tiles: string;
      jumboTiles?: string;
      jumboTilesAddOffset?: number;
      jumboTilesSize?: number;
      jumboTilesRows?: number;
      jumboTilesCols?: number;
      clouds?: [string, string];
    };
  };

  /** The asset collection for named items. */
  items?: {
    /** The URL of the item graphic for the given name */
    [key: string]: string;
  };

  ItemClassNames?: string[];

  AutohandlerTouchItems?: {
    [key: string]: string;
  };

  AutohandlerGetAllItems?: {
    [key: string]: string;
  };

  specialItemProperties?: {
    [key: string]: ItemDefinition;
  };

  ProjectileClassNames?: string[];

  specialProjectileProperties?: {
    [key: string]: ItemDefinition;
  };
}
