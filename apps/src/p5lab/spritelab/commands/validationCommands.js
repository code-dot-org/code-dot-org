import * as coreLibrary from '../coreLibrary';

export const commands = {
  getAnimationsInUse() {
    return coreLibrary.getAnimationsInUse();
  },

  getBackground() {
    if (typeof coreLibrary.background === 'string') {
      return coreLibrary.background;
    } else {
      return coreLibrary.background.name;
    }
  },

  getNumBehaviorsForAnimation(animation) {
    return coreLibrary.getNumBehaviorsForAnimation(animation);
  },

  getNumBehaviorsForSpriteId(spriteId) {
    return coreLibrary.getNumBehaviorsForSpriteId(spriteId);
  },

  getSpriteIdsInUse() {
    return coreLibrary.getSpriteIdsInUse();
  }
};
