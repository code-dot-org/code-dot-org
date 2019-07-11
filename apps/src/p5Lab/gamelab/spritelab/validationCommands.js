import * as spriteUtils from './spriteUtils';

export const commands = {
  getAnimationsInUse() {
    return spriteUtils.getAnimationsInUse();
  },

  getBackground() {
    if (typeof spriteUtils.background === 'string') {
      return spriteUtils.background;
    } else {
      return spriteUtils.background.name;
    }
  },

  getNumBehaviorsForAnimation(animation) {
    return spriteUtils.getNumBehaviorsForAnimation(animation);
  },

  getNumBehaviorsForSpriteId(spriteId) {
    return spriteUtils.getNumBehaviorsForSpriteId(spriteId);
  },

  getSpriteIdsInUse() {
    return spriteUtils.getSpriteIdsInUse();
  }
};
