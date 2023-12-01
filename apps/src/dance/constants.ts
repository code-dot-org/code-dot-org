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

export const COMMON_DANCE_BACKGROUND_EFFECTS = [
  'circles',
  'color_cycle',
  'diamonds',
  'disco_ball',
  'fireworks',
  'swirl',
  'kaleidoscope',
  'lasers',
  'splatter',
  'rainbow',
  'snowflakes',
  'text',
  'galaxy',
  'sparkles',
  'spiral',
  'disco',
  'stars',
  'music_wave',
  'ripples',
  'ripples_random',
  'quads',
  'flowers',
  'squiggles',
  'growing_stars',
];
export const EXTRA_AI_DANCE_BACKGROUND_EFFECTS = [
  'blooming_petals',
  'clouds',
  'frosted_grid',
  'starburst',
];

export const COMMON_DANCE_COLOR_PALETTES = [
  'rave',
  'cool',
  'electronic',
  'iceCream',
  'neon',
  'tropical',
  'vintage',
  'warm',
];

export const POETRY_COLOR_PALETTES = [
  'grayscale',
  'sky',
  'ocean',
  'sunrise',
  'sunset',
  'spring',
  'summer',
  'autumn',
  'winter',
  'twinkling',
  'rainbow',
  'roses',
];

export const DANCE_FOREGROUND_EFFECTS = [
  'bubbles',
  'confetti',
  'hearts_red',
  'music_notes',
  'pineapples',
  'pizzas',
  'smiling_poop',
  'rain',
  'floating_rainbows',
  'smile_face',
  'spotlight',
  'color_lights',
  'raining_tacos',
  'emojis',
  'hearts_colorful',
  'exploding_stars',
  'paint_drip',
];

export const DANCE_AI_SOUNDS = [
  'ai-select-emoji',
  'ai-deselect-emoji',
  'ai-generate-no',
  'ai-generate-yes',
] as const;
