import * as coreLibrary from '../coreLibrary';

export const commands = {
  atTime(n, unit, callback) {
    coreLibrary.addEvent('atTime', {n, unit}, callback);
  },

  checkTouching(condition, sprite1, sprite2, callback) {
    if (condition === 'when' || condition === 'while') {
      coreLibrary.addEvent(
        condition + 'touch',
        {sprite1: sprite1, sprite2: sprite2},
        callback
      );
    }
  },

  keyPressed(condition, key, callback) {
    if (condition === 'when' || condition === 'while') {
      coreLibrary.addEvent(condition + 'press', {key: key}, callback);
    }
  },

  spriteClicked(condition, spriteArg, callback) {
    if (condition === 'when' || condition === 'while') {
      coreLibrary.addEvent(condition + 'click', {sprite: spriteArg}, callback);
    }
  }
};
