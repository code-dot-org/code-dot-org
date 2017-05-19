import { createToolbox } from '../../block_utils';

function craftBlock(type) {
  return block(`craft_${type}`);
}

function block(type) {
  return `<block type="${type}"></block>`;
}

const log = craftBlock('log');

module.exports = {
  custom: {
    requiredBlocks: [],
    freePlay: false,
    toolbox: createToolbox(log + block('text')),
  }
};
