import * as spriteUtils from './spriteUtils.js';

export const commands = {
  addBehavior(spriteId, behavior) {
    let sprites = spriteUtils.singleOrGroup(spriteId);
    sprites.forEach(sprite => spriteUtils.addBehavior(sprite, behavior));
  },
  Behavior(func, extraArgs) {
    return {func: func, extraArgs: extraArgs};
  }
};
