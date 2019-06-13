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

  getSpriteIdsInUse() {
    return spriteUtils.getSpriteIdsInUse();
  }
};
