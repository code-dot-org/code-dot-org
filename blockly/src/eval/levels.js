var msg = require('../../locale/current/eval');
var blockUtils = require('../block_utils');

/**
 * Information about level-specific requirements.
 */
module.exports = {
  'eval1': {
    // solutionBlocks: '<block type="functional_circle" inline="false"><functional_input name="COLOR"><block type="functional_string"><title name="VAL">red</title></block></functional_input><functional_input name="SIZE"><block type="functional_math_number"><title name="NUM">50</title></block></functional_input></block>',

    solutionBlocks: blockUtils.mathBlockXml('functional_square', {
      'COLOR': blockUtils.mathBlockXml('functional_string', null, { VAL: 'black' } ),
      'STYLE': blockUtils.mathBlockXml('functional_string', null, { VAL: 'solid' }),
      'SIZE': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 4 } )
    }),
    ideal: Infinity,
    toolbox: blockUtils.createToolbox(
      blockUtils.blockOfType('functional_plus') +
      blockUtils.blockOfType('functional_minus') +
      blockUtils.blockOfType('functional_times') +
      blockUtils.blockOfType('functional_dividedby') +
      blockUtils.blockOfType('functional_math_number') +
      blockUtils.blockOfType('functional_string') +
      blockUtils.blockOfType('functional_style') +
      blockUtils.blockOfType('functional_circle') +
      blockUtils.blockOfType('functional_triangle') +
      blockUtils.blockOfType('functional_square') +
      blockUtils.blockOfType('functional_rectangle') +
      blockUtils.blockOfType('functional_ellipse') +
      blockUtils.blockOfType('functional_star') +
      blockUtils.blockOfType('place_image') +
      blockUtils.blockOfType('overlay') +
      blockUtils.blockOfType('underlay') +
      blockUtils.blockOfType('rotate') +
      blockUtils.blockOfType('scale') +
      blockUtils.blockOfType('functional_text')),
    startBlocks: blockUtils.mathBlockXml('functional_star', {
      'COLOR': blockUtils.mathBlockXml('functional_string', null, { VAL: 'black' } ),
      'STYLE': blockUtils.mathBlockXml('functional_string', null, { VAL: 'solid' }),
      'SIZE': blockUtils.mathBlockXml('functional_math_number', null, { NUM: 20 } )
    }),
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
