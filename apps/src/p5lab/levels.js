var utils = require('@cdo/apps/utils');
var blockUtils = require('@cdo/apps/block_utils');
var tb = blockUtils.createToolbox;
import {GamelabBlocks} from '@cdo/apps/p5lab/gamelab/sharedGamelabBlocks';

/**
 * Properties of the game lab level object
 * @typedef {Object} GameLabLevel
 *
 * @property {Object.<string, null>} codeFunctions - collection of blocks to
 *           be made available in the droplet toolbox on this level.
 *
 * @property {?boolean} hideAnimationMode - If true, the animation tab should be
 *           inaccessible to the student on this level.
 *
 * @property {?boolean} startInAnimationTab - If true, the animation tab should be
 *           selected on page load.
 *
 * @property {?boolean} allAnimationsSingleFrame - If true, the library animations
 *           should all be shortened to their first frame so they are still images.
 *
 * @property {?boolean} pauseAnimationsByDefault - If true, then after
 *           `setAnimation` a sprite's animation will always be paused,
 *           not playing.
 *
 * @property {?SerializedAnimationList} startAnimations - Initial state of the
 *           animation list for this level / what to return to on reset.
 */

/*
 * Configuration for all levels.
 */
var levels = (module.exports = {});

levels.sandbox = {
  ideal: Infinity,
  requiredBlocks: [],
  scale: {
    snapRadius: 2
  },
  freePlay: true,
  toolbox: tb(),
  startBlocks: '<block type="when_run" deletable="false" x="20" y="20"></block>'
};

// Base config for levels created via levelbuilder
levels.custom = utils.extend(levels.sandbox, {
  editCode: true,
  codeFunctions: GamelabBlocks,
  startBlocks: null
});

levels.ec_sandbox = utils.extend(levels.custom, {});
