import * as spriteUtils from './spriteUtils.js';

export const commands = {
  addBehavior(spriteId, behavior) {
    let sprites = spriteUtils.singleOrGroup(spriteId);
    sprites.forEach(sprite => spriteUtils.addBehavior(sprite, behavior));
  },
  Behavior(func, extraArgs) {
    return {func: func, intFunc: func.intFunc, extraArgs: extraArgs};
  },
  removeAllBehaviors(spriteId) {
    let sprites = spriteUtils.singleOrGroup(spriteId);
    sprites.forEach(sprite => spriteUtils.removeAllBehaviors(sprite));
  },
  removeBehavior(spriteId, behavior) {
    let sprites = spriteUtils.singleOrGroup(spriteId);
    sprites.forEach(sprite => spriteUtils.removeBehavior(sprite, behavior));
  }
};
