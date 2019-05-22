import * as spriteUtils from './spriteUtils.js';

export const commands = {
  spriteClicked(condition, spriteIndex, callback) {
    spriteUtils.addEvent(condition + 'click', spriteIndex, callback);
  }
};
