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
      blockUtils.blockOfType('minecraft_log') +
      blockUtils.blockOfType('minecraft_setGravity') +
      blockUtils.blockOfType('minecraft_setSpeed') +
      blockUtils.blockOfType('minecraft_setBlock') +
      blockUtils.blockOfType('minecraft_whenRightClick') +
      blockUtils.blockOfType('minecraft_adjacent_target_x') +
      blockUtils.blockOfType('minecraft_adjacent_target_y') +
      blockUtils.blockOfType('minecraft_adjacent_target_z') +
      blockUtils.blockOfType('minecraft_whenLeftClick') +
      blockUtils.blockOfType('minecraft_selected_target_x') +
      blockUtils.blockOfType('minecraft_selected_target_y') +
      blockUtils.blockOfType('minecraft_selected_target_z') +
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
