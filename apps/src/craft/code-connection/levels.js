import { createToolbox } from '../../block_utils';

function craftBlock(type) {
  return block(`craft_${type}`);
}

function block(type) {
  return `<block type="${type}"></block>`;
}

const log = craftBlock('log');
const waitOneSecond = craftBlock('waitOneSecond');
const callNativeAsync = craftBlock('callNativeAsync');

module.exports = {
  custom: {
    requiredBlocks: [],
    freePlay: false,
    toolbox: createToolbox(log + waitOneSecond + callNativeAsync + block('text')),
  }
};
