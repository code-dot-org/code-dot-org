import type {BlocklySerialization} from '@code-dot-org/blockly-workspace';
import type {BlocklyData} from '@code-dot-org/lab-blockly';

export interface ArtistImageData {
  filename: string;
  /** Internal reference to the locally stored version of the image */
  local?: string;
  position: [number, number];
  scale?: number;
}

/** Data for artist levels. */
export interface ArtistData extends BlocklyData {
  skinId?: string;
  initialX?: number;
  initialY?: number;
  startDirection?: number;
  predrawBlocks?: BlocklySerialization;
  images: ArtistImageData[];
}

/**
 * Represents a complete skin for an artist level (or derivative).
 */
export interface Skin {
  id: string;
  assetUrl: (path: string) => string;
  avatar: string;
  avatar_2x: string;
  goal: string;
  obstacle: string;
  smallStaticAvatar: string;
  staticAvatar: string;
  winAvatar: string;
  failureAvatar: string;
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
  startSound: [string, string];
  winSound: [string, string];
  failureSound: [string, string];
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
  look: string;
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
}

/**
 * Represents a set of skins for a particular level set.
 */
export interface SkinsData {
  /** Each possible skin in our level collection */
  [key: string]: SkinData;
}

/**
 * Describes the API for the artist commands.
 */
export interface API {
  /** An api call handles getting a block id as an argument */
  [key: string]: (id: string) => void;
}
