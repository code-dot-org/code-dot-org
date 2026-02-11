/** Is skin either farmer or farmer_night */
export function isFarmerSkin(skinId: string): boolean {
  return /farmer(_night)?/.test(skinId);
}

/** Is skin either bee or bee_night */
export function isBeeSkin(skinId: string): boolean {
  return /bee(_night)?/.test(skinId);
}

/** Is skin either collector or collector_night */
export function isCollectorSkin(skinId: string): boolean {
  return /collector(_night)?/.test(skinId);
}

/** Is skin scrat */
export function isScratSkin(skinId: string): boolean {
  return /scrat/.test(skinId);
}

/** Is skin planter */
export function isPlanterSkin(skinId: string): boolean {
  return /planter/.test(skinId);
}

/** Is skin harvester */
export function isHarvesterSkin(skinId: string): boolean {
  return /harvester/.test(skinId);
}

/** Is skin wordsearch */
export function isWordSearchSkin(skinId: string): boolean {
  return skinId === 'letters';
}

/** Is skin neighborhood */
export function isNeighborhoodSkin(skinId: string): boolean {
  return skinId === 'neighborhood';
}

export interface SpriteMap {
  [key: string]: {
    name: string;
    sheet: string;
    row: number;
    column: number;
  };
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
  squareSize?: number;
  svgWidth?: number;
  svgHeight?: number;
  pegmanXOffset?: number;
  pegmanYOffset?: number;
  pegmanHeight?: number;
  pegmanWidth?: number;
  pegmanSheetWidth?: number;
  danceOnLoad?: boolean;
  turnAfterVictory?: boolean;
  actionSpeedScale?: {
    [key: string]: number;
  };

  // Dirt
  dirt?: string;
  // Harvester
  sprout?: string;
  // Bee
  cloud?: string;
  cloudAnimation?: string;
  redFlower?: string;
  purpleFlower?: string;
  honey?: string;
  // Neighborhood
  paintCan?: string;

  // Sprite maps
  spriteMap?: SpriteMap;
  sheetRows?: {
    [key: string]: number;
  };

  // Harvester Sounds
  harvestSound?: string;
  // Bee Sounds
  beeSound?: boolean;
  nectarSound?: string;
  honeySound?: string;
}

/**
 * Represents a complete skin for a maze level (or derivative).
 */
export interface Skin
  extends Omit<
    SkinData,
    | 'walkSound'
    | 'collectSounds'
    | 'harvestSound'
    | 'nectarSound'
    | 'honeySound'
  > {
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

  // Harvester Sounds
  harvestSound?: [string, string];
  // Bee Sounds
  beeSound?: boolean;
  nectarSound?: [string, string];
  honeySound?: [string, string];
}
