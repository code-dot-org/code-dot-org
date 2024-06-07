/** @file P5 Lab constants */
var utils = require('@cdo/apps/utils');

/** @enum {string} */
export const P5LabInterfaceMode = utils.makeEnum(
  'CODE',
  'ANIMATION',
  'BACKGROUND'
);

/** @enum {string} */
export const P5LabType = utils.makeEnum('GAMELAB', 'SPRITELAB', 'POETRY');

/** @enum {string} */
export const CURRENT_ANIMATION_TYPE = utils.makeEnum('default', 'background');

/** @const {number} */
export const APP_WIDTH = 400;

/** @const {number} */
export const APP_HEIGHT = 400;

/**
 * DataURL for a 1x1 transparent gif image.
 * @const {string}
 */
export const EMPTY_IMAGE =
  'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

export const PlayBehavior = utils.makeEnum('ALWAYS_PLAY', 'NEVER_PLAY');

export const EFFECTS_PALETTES = {
  ocean: ['#7FD0F5', '#3FABE3', '#2C7DBB', '#1D57A0', '#144188', '#061F4B'],
  twinkling: ['#FFC702', '#FC9103', '#F17302', '#B83604', '#7E1301'],
};
