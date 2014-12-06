var msg = require('../../locale/current/voxel');
var blockUtils = require('../block_utils');

/**
 * Information about level-specific requirements.
 */
module.exports = {
  'voxel1': {
    ideal: Infinity,
    toolbox: blockUtils.createToolbox(
      blockUtils.blockOfType('when_run') +
      blockUtils.blockOfType('voxel_whenRightClick') +
      blockUtils.blockOfType('voxel_whenLeftClick') +
      blockUtils.blockOfType('voxel_setGravity') +
      blockUtils.blockOfType('voxel_setSpeed') +
      blockUtils.blockOfType('voxel_setBlock') +
      '<block type="math_random_int"><value name="FROM"><block type="math_number"><title name="NUM">1</title></block></value><value name="TO"><block type="math_number"><title name="NUM">37</title></block></value></block>' +
      blockUtils.blockOfType('voxel_adjacent_target_x') +
      blockUtils.blockOfType('voxel_adjacent_target_y') +
      blockUtils.blockOfType('voxel_adjacent_target_z') +
      blockUtils.blockOfType('voxel_selected_target_x') +
      blockUtils.blockOfType('voxel_selected_target_y') +
      blockUtils.blockOfType('voxel_selected_target_z') +
      blockUtils.blockOfType('voxel_log') +
        '<block type="controls_repeat"><title name="TIMES">4</title></block><block type="controls_repeat_dropdown"><title name="TIMES" config="3-10">???</title></block><block type="controls_repeat_ext"><value name="TIMES"></value><statement name="DO"></statement></block>' +
      '<block type="math_number"></block><block type="math_number_dropdown"><title name="NUM" config="1-10">5</title></block><block type="math_arithmetic" inline="true"></block><block type="math_random_int"><value name="FROM"><block type="math_number"><title name="NUM">1</title></block></value><value name="TO"><block type="math_number"><title name="NUM">100</title></block></value></block><block type="math_random_float"></block>' +
      '<block type="variables_set" inline="false"><title name="VAR">x</title><value name="VALUE"><block type="math_number"><title name="NUM">???</title></block></value></block><block type="variables_get"><title name="VAR">x</title></block>'
    ),
    startBlocks: '',
    requiredBlocks: '',
    minWorkspaceHeight: 1800,
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
