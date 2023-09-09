import {createToolbox} from '../../block_utils';

const moveForwardBlock = '<block type="craft_moveForward"></block>';

const turnLeftBlock = `
  <block type="craft_turn">
    <title name="DIR">left</title>
  </block>`;

const turnRightBlock = `
  <block type="craft_turn">
    <title name="DIR">right</title>
  </block>`;

export default {
  custom: {
    requiredBlocks: [],
    freePlay: false,
    toolbox: createToolbox(moveForwardBlock + turnLeftBlock + turnRightBlock),
  },
};
