var msg = require('../../locale/current/calc');
var blockUtils = require('../block_utils');

/**
 * Information about level-specific requirements.
 */
module.exports = {
  'example1': {
    solutionBlocks: blockUtils.calcBlockXml('functional_times', [
      blockUtils.calcBlockXml('functional_plus', [1, 2]),
      blockUtils.calcBlockXml('functional_plus', [3, 4])
    ]),
    ideal: Infinity,
    toolbox: blockUtils.createToolbox(
      blockUtils.blockOfType('functional_plus') +
      blockUtils.blockOfType('functional_minus') +
      blockUtils.blockOfType('functional_times') +
      blockUtils.blockOfType('functional_dividedby') +
      blockUtils.blockOfType('functional_math_number') +
      '<block type="functional_math_number_dropdown">' +
      '  <title name="NUM" config="0,1,2,3,4,5,6,7,8,9,10">???</title>' +
      '</block>'
      ),
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
