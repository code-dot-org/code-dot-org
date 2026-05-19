/**
 * Build the maze skin object for the Neighborhood mini-app.
 *
 * Layers in three pieces of state, matching the legacy
 * `apps/src/maze/skins.js` chain that this file replaces:
 *
 *   1. The shared base skin (avatar, goal, common-image URLs, sounds)
 *      formerly produced by `apps/src/skins.js`.
 *   2. Maze-shared defaults (obstacle scale, pegman dimensions,
 *      sound asset URLs) formerly applied inline in
 *      `apps/src/maze/skins.js#load`.
 *   3. The Neighborhood-specific config — sprite map, sheet rows,
 *      pegman geometry, paint can sprite — formerly the
 *      `CONFIGS.neighborhood` entry.
 *
 * `assetUrl` is a callback the caller supplies. Apps's
 * `NeighborhoodAdapter` constructs it as
 * `path => levelProperties.baseAssetUrl + path`; the package's
 * standalone dev server can build the same callback against a known
 * base URL. The legacy code accepted any callable of that shape and
 * this port preserves that contract.
 */

import neighborhoodSprites from './neighborhoodSprites.json';
import type {SkinType} from './types';

const SKIN_ID = 'neighborhood';

type AssetUrl = (path: string) => string;

/**
 * Wrap each entry in `paths` with both `.mp3` and `.ogg` URLs so the
 * caller can probe either format. Matches the legacy
 * `soundAssetUrls(skin, name)` helper.
 */
function soundAssetUrls(skinUrl: AssetUrl, name: string): string[] {
  return [skinUrl(name), skinUrl(name.replace(/\.mp3$/, '.ogg'))];
}

function buildBaseSkin(assetUrl: AssetUrl): SkinType {
  const skinUrl = (path: string) => assetUrl(`media/skins/${SKIN_ID}/${path}`);

  return {
    id: SKIN_ID,
    assetUrl: skinUrl,

    // Common images. Many of these are vestigial for the Neighborhood
    // skin (avatar/goal/arrow icons are used by other maze variants);
    // they're preserved verbatim because the legacy loader did, and
    // MazeController may probe for them defensively.
    avatar: skinUrl('avatar.png'),
    avatar_2x: skinUrl('avatar_2x.png'),
    goal: skinUrl('goal.png'),
    obstacle: skinUrl('obstacle.png'),
    smallStaticAvatar: skinUrl('small_static_avatar.png'),
    staticAvatar: skinUrl('static_avatar.png'),
    winAvatar: skinUrl('win_avatar.png'),
    failureAvatar: skinUrl('failure_avatar.png'),
    decorationAnimation: skinUrl('decoration_animation.png'),
    decorationAnimation_2x: skinUrl('decoration_animation_2x.png'),
    repeatImage: assetUrl('media/common_images/repeat-arrows.png'),
    leftArrow: assetUrl('media/common_images/moveleft.png'),
    downArrow: assetUrl('media/common_images/movedown.png'),
    upArrow: assetUrl('media/common_images/moveup.png'),
    rightArrow: assetUrl('media/common_images/moveright.png'),
    upLeftArrow: assetUrl('media/common_images/moveupleft.png'),
    upRightArrow: assetUrl('media/common_images/moveupright.png'),
    downLeftArrow: assetUrl('media/common_images/movedownleft.png'),
    downRightArrow: assetUrl('media/common_images/movedownright.png'),
    leftJumpArrow: assetUrl('media/common_images/jumpleft.png'),
    downJumpArrow: assetUrl('media/common_images/jumpdown.png'),
    upJumpArrow: assetUrl('media/common_images/jumpup.png'),
    rightJumpArrow: assetUrl('media/common_images/jumpright.png'),
    upLeftJumpArrow: assetUrl('media/common_images/jumpupleft.png'),
    upRightJumpArrow: assetUrl('media/common_images/jumpupright.png'),
    downLeftJumpArrow: assetUrl('media/common_images/jumpdownleft.png'),
    downRightJumpArrow: assetUrl('media/common_images/jumpdownright.png'),
    northLineDraw: assetUrl('media/common_images/draw-north.png'),
    southLineDraw: assetUrl('media/common_images/draw-south.png'),
    eastLineDraw: assetUrl('media/common_images/draw-east.png'),
    westLineDraw: assetUrl('media/common_images/draw-west.png'),
    northwestLineDraw: assetUrl('media/common_images/draw-north-west.png'),
    northeastLineDraw: assetUrl('media/common_images/draw-north-east.png'),
    southwestLineDraw: assetUrl('media/common_images/draw-south-west.png'),
    southeastLineDraw: assetUrl('media/common_images/draw-south-east.png'),
    shortLineDraw: assetUrl('media/common_images/draw-short.png'),
    longLineDraw: assetUrl('media/common_images/draw-long.png'),
    shortLineDrawRight: assetUrl('media/common_images/draw-short-right.png'),
    longLineDrawRight: assetUrl('media/common_images/draw-long-right.png'),
    longLine: assetUrl('media/common_images/move-long.png'),
    shortLine: assetUrl('media/common_images/move-short.png'),
    soundIcon: assetUrl('media/common_images/play-sound.png'),
    clickIcon: assetUrl('media/common_images/when-click-hand.png'),
    clockIcon: assetUrl('media/common_images/clock-icon.png'),
    startIcon: assetUrl('media/common_images/when-run.png'),
    runArrow: assetUrl('media/common_images/run-arrow.png'),
    endIcon: assetUrl('media/common_images/end-icon.png'),
    speedFast: assetUrl('media/common_images/speed-fast.png'),
    speedMedium: assetUrl('media/common_images/speed-medium.png'),
    speedSlow: assetUrl('media/common_images/speed-slow.png'),
    scoreCard: assetUrl('media/common_images/increment-score-75percent.png'),
    randomPurpleIcon: assetUrl('media/common_images/random-purple.png'),

    // Sounds — two URLs each (mp3 + ogg fallback).
    startSound: [skinUrl('start.mp3'), skinUrl('start.ogg')],
    winSound: [skinUrl('win.mp3'), skinUrl('win.ogg')],
    failureSound: [skinUrl('failure.mp3'), skinUrl('failure.ogg')],
  };
}

function applyMazeDefaults(skin: SkinType, skinUrl: AssetUrl): void {
  skin.obstacleScale = 1.0;
  skin.obstacleAnimation = skinUrl('obstacle.gif');
  skin.movePegmanAnimationSpeedScale = 1;
  skin.look = '#FFF';
  skin.background = skinUrl('background.png');
  skin.tiles = skinUrl('tiles.png');
  skin.pegmanHeight = 52;
  skin.pegmanWidth = 49;
  skin.pegmanYOffset = 0;
  skin.turnAfterVictory = false;
  skin.danceOnLoad = false;

  // Sounds — these are wall/obstacle hits, populated as [mp3, ogg].
  skin.obstacleSound = soundAssetUrls(skinUrl, 'obstacle.mp3');
  skin.wallSound = soundAssetUrls(skinUrl, 'wall.mp3');
  skin.winGoalSound = soundAssetUrls(skinUrl, 'win_goal.mp3');
  skin.wall0Sound = soundAssetUrls(skinUrl, 'wall0.mp3');
  skin.wall1Sound = soundAssetUrls(skinUrl, 'wall1.mp3');
  skin.wall2Sound = soundAssetUrls(skinUrl, 'wall2.mp3');
  skin.wall3Sound = soundAssetUrls(skinUrl, 'wall3.mp3');
  skin.wall4Sound = soundAssetUrls(skinUrl, 'wall4.mp3');
}

/**
 * Neighborhood-specific overrides — formerly `CONFIGS.neighborhood`
 * in `apps/src/maze/skins.js`. Values that look like asset paths
 * (`paint_can.png`) are resolved through `skinUrl` so they land at
 * the right base URL; everything else is passed through verbatim.
 */
const NEIGHBORHOOD_CONFIG = {
  spriteMap: neighborhoodSprites,
  sheetRows: {
    'other.png': 3,
    'vehicles.png': 7,
    'buildings.png': 26,
    'sidewalk.png': 4,
    'wall.png': 4,
  },
  pegmanHeight: 80,
  pegmanWidth: 80,
  pegmanYOffset: 0,
  pegmanXOffset: 0,
  pegmanSheetWidth: 1280,
  squareSize: 80,
  svgHeight: 800,
  svgWidth: 800,
  paintCan: 'paint_can.png',
};

// Match the legacy loader's heuristics for resolving asset paths in
// the config map.
const IS_ASSET = /\.\S{3}$/;
const IS_SOUND = /^.*\.mp3$/;

function resolveAssetValue(value: unknown, skinUrl: AssetUrl): unknown {
  if (typeof value !== 'string') return value;
  if (IS_SOUND.test(value)) return soundAssetUrls(skinUrl, value);
  if (IS_ASSET.test(value)) return skinUrl(value);
  return value;
}

export function loadNeighborhoodSkin(assetUrl: AssetUrl): SkinType {
  const skin = buildBaseSkin(assetUrl);
  const skinUrl = skin.assetUrl as AssetUrl;
  applyMazeDefaults(skin, skinUrl);

  for (const [key, value] of Object.entries(NEIGHBORHOOD_CONFIG)) {
    skin[key] = Array.isArray(value)
      ? value.map(v => resolveAssetValue(v, skinUrl))
      : resolveAssetValue(value, skinUrl);
  }

  return skin;
}
