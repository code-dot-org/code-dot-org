import {
  MAX_VISUALIZATION_WIDTH,
  MIN_VISUALIZATION_WIDTH,
} from '@cdo/apps/StudioApp';

/** @const {number} */
export const MAX_GAME_WIDTH = MAX_VISUALIZATION_WIDTH;

/** @const {number} */
export const MIN_GAME_WIDTH = MIN_VISUALIZATION_WIDTH;

/** @const {number} */
export const GAME_HEIGHT = 400;

export const DancelabReservedWords = [
  'sprites',
  'MOVES',
  'QueueType',
  'inputEvents',
  'setupCallbacks',
  'randomNumber',
  'randomInt',
  'getCueList',
  'registerSetup',
  'runUserSetup',
  'runUserEvents',
  'prioritySort',
  'executeFuncs',
  'whenSetup',
  'whenSetupSong',
  'ifDanceIs',
  'whenKey',
  'whenPeak',
  'atTimestamp',
  'everySeconds',
  'everySecondsRange',
  'everyVerseChorus',
];

export const ASSET_BASE =
  'https://curriculum.code.org/images/sprites/dance_20191106/';

export const oldDanceBackgroundEffects =
  'circles, color_cycle, diamonds, disco_ball, fireworks, swirl, kaleidoscope, lasers, splatter, rainbow, snowflakes, galaxy, sparkles, spiral, disco, stars';

export const newDanceBackgroundEffects =
  'starburst, blooming_petals, frosted_grid, clouds';

export const oldDanceColorPalettes =
  'rave, cool, electronic, iceCream, neon, tropical, vintage, warm';

export const poetryColorPalettes =
  'grayscale, sky, ocean, sunrise, sunset, spring, summer, autumn, winter, twinkling, rainbow, roses';

export const danceForegroundEffects =
  'bubbles, confetti, hearts_red, music_notes, pineapples, pizzas, smiling_poop, rain, floating_rainbows, smile_face, spotlight, color_lights, raining_tacos';
