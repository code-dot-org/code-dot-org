import * as spriteUtils from './spriteUtils';

export const commands = {
  checkTouching(condition, sprite1, sprite2, callback) {
    spriteUtils.addEvent(
      condition + 'touch',
      {sprite1: sprite1, sprite2: sprite2},
      callback
    );
  },

  keyPressed(condition, key, callback) {
    spriteUtils.addEvent(condition + 'press', {key: key}, callback);
  },

  spriteClicked(condition, spriteId, callback) {
    spriteUtils.addEvent(condition + 'click', {sprite: spriteId}, callback);
  }
};
