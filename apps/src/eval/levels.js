var msg = require('./locale');
var blockUtils = require('../block_utils');

/**
 * Information about level-specific requirements.
 */
module.exports = {
  'eval1': {
    solutionBlocks: blockUtils.mathBlockXml('functional_star', {
      'COLOR': blockUtils.mathBlockXml('functional_string', null, {VAL: 'green'} ),
      'STYLE': blockUtils.mathBlockXml('functional_string', null, {VAL: 'solid'}),
      'SIZE': blockUtils.mathBlockXml('functional_math_number', null, {NUM: 200} )
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
      blockUtils.blockOfType('functional_radial_star') +
      blockUtils.blockOfType('functional_polygon') +
      blockUtils.blockOfType('place_image') +
      blockUtils.blockOfType('offset') +
      blockUtils.blockOfType('overlay') +
      blockUtils.blockOfType('underlay') +
      blockUtils.blockOfType('rotate') +
      blockUtils.blockOfType('scale') +
      blockUtils.blockOfType('functional_text') +
      blockUtils.blockOfType('string_append') +
      blockUtils.blockOfType('string_length') +
      blockUtils.blockOfType('functional_greater_than') +
      blockUtils.blockOfType('functional_less_than') +
      blockUtils.blockOfType('functional_number_equals') +
      blockUtils.blockOfType('functional_string_equals') +
      blockUtils.blockOfType('functional_logical_and') +
      blockUtils.blockOfType('functional_logical_or') +
      blockUtils.blockOfType('functional_logical_not') +
      blockUtils.blockOfType('functional_boolean')
    ),
    startBlocks: blockUtils.mathBlockXml('functional_star', {
      'COLOR': blockUtils.mathBlockXml('functional_string', null, {VAL: 'black'} ),
      'STYLE': blockUtils.mathBlockXml('functional_string', null, {VAL: 'solid'}),
      'SIZE': blockUtils.mathBlockXml('functional_math_number', null, {NUM: 200} )
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
