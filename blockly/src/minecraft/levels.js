var msg = require('../../locale/current/minecraft');
var blockUtils = require('../block_utils');

/**
 * Information about level-specific requirements.
 */
module.exports = {
  'minecraft1': {
    ideal: Infinity,
    toolbox: blockUtils.createToolbox(
      blockUtils.blockOfType('when_run') +
      blockUtils.blockOfType('minecraft_playSound') +
      blockUtils.blockOfType('minecraft_log')
    ),
    startBlocks: '',
    requiredBlocks: '',
    freePlay: false
  },
  // Level builder defaults
  'custom': {
    answer: '',
    ideal: Infinity,
    toolbox: '',
    startBlocks: '',
    requiredBlocks: '',
    freePlay: false
  }
};
