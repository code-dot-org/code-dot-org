var msg = require('../../locale/current/calc');
var blockUtils = require('../block_utils');
var Expression = require('./Expression');

/**
 * Information about level-specific requirements.
 */
module.exports = {
  'example1': {
    // todo (brent) - probably want this to be blocks
    goal: function () {
      return new Expression('*',
        new Expression('+', 1, 2),
        new Expression('+', 3, 4));
    },
    ideal: 4,
    toolbox: blockUtils.createToolbox(
      blockUtils.blockOfType('functional_draw') +
      blockUtils.blockOfType('functional_plus') +
      blockUtils.blockOfType('functional_minus') +
      blockUtils.blockOfType('functional_times') +
      blockUtils.blockOfType('functional_dividedby') +
      blockUtils.blockOfType('functional_math_number')),
    startBlocks: '',
    requiredBlocks: '',
    freePlay: false
  },

  'custom': {
    answer: '',
    ideal: Infinity,
    toolbox: '',
    startBlocks: '',
    requiredBlocks: '',
    freePlay: false
  }
};
