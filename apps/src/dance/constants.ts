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

/**
 * A keyword used to indentify generated dancers, as opposed to
 * other costume-based dancer groups.
 * @const {string}
 */
export const GENERATED_DANCER = 'GENERATED_DANCER';

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
