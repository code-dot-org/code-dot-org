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

  getBehaviorsForAnimation(animation) {
    return spriteUtils.getBehaviorsForAnimation(animation);
  },

  getBehaviorsForSpriteId(spriteId) {
    return spriteUtils.getBehaviorsForSpriteId(spriteId);
  },

  getSpriteIdsInUse() {
    return spriteUtils.getSpriteIdsInUse();
  }
};
