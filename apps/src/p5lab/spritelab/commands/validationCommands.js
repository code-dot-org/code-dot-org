import * as spritelabLibrary from '../spritelabLibrary';

export const commands = {
  getAnimationsInUse() {
    return spritelabLibrary.getAnimationsInUse();
  },

  getBackground() {
    if (typeof spritelabLibrary.background === 'string') {
      return spritelabLibrary.background;
    } else {
      return spritelabLibrary.background.name;
    }
  },

  getNumBehaviorsForAnimation(animation) {
    return spritelabLibrary.getNumBehaviorsForAnimation(animation);
  },

  getNumBehaviorsForSpriteId(spriteId) {
    return spritelabLibrary.getNumBehaviorsForSpriteId(spriteId);
  },

  getSpriteIdsInUse() {
    return spritelabLibrary.getSpriteIdsInUse();
  }
};
