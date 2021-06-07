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

  getEventLog() {
    return coreLibrary.eventLog;
  },

  getNumBehaviorsForAnimation(animation) {
    return coreLibrary.getNumBehaviorsForAnimation(animation);
  },

  getNumBehaviorsForSpriteId(spriteId) {
    return coreLibrary.getNumBehaviorsForSpriteId(spriteId);
  },

  getBehaviorsForSpriteId(spriteId) {
    return coreLibrary.getBehaviorsForSpriteId(spriteId);
  },

  getPrintLog() {
    return coreLibrary.printLog;
  },

  getPromptVars() {
    return coreLibrary.promptVars;
  },

  getSpriteIdsInUse() {
    return coreLibrary.getSpriteIdsInUse();
  },

  getTitle() {
    return {
      title: coreLibrary.screenText.title,
      subtitle: coreLibrary.screenText.subtitle
    };
  }
};
