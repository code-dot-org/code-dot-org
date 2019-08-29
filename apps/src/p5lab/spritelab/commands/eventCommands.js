import * as spritelabLibrary from '../spritelabLibrary';

export const commands = {
  checkTouching(condition, sprite1, sprite2, callback) {
    if (condition === 'when' || condition === 'while') {
      spritelabLibrary.addEvent(
        condition + 'touch',
        {sprite1: sprite1, sprite2: sprite2},
        callback
      );
    }
  },

  keyPressed(condition, key, callback) {
    if (condition === 'when' || condition === 'while') {
      spritelabLibrary.addEvent(condition + 'press', {key: key}, callback);
    }
  },

  spriteClicked(condition, spriteId, callback) {
    if (condition === 'when' || condition === 'while') {
      spritelabLibrary.addEvent(
        condition + 'click',
        {sprite: spriteId},
        callback
      );
    }
  }
};
