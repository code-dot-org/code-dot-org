/** @file P5 Lab constants */
import {makeEnum} from '@cdo/apps/utils';

/** @enum {string} */
export const P5LabInterfaceMode = makeEnum('CODE', 'ANIMATION', 'BACKGROUND');

/** @enum {string} */
export const P5LabType = makeEnum('GAMELAB', 'SPRITELAB', 'POETRY');

/** @enum {string} */
export const CURRENT_ANIMATION_TYPE = makeEnum('default', 'background');

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

export const PlayBehavior = makeEnum('ALWAYS_PLAY', 'NEVER_PLAY');
