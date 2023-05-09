export const commands = {
  atTime(n, unit, callback) {
    this.addEvent('atTime', {n, unit}, callback);
  },

  checkTouching(condition, sprite1, sprite2, callback) {
    if (condition === 'when' || condition === 'while') {
      this.addEvent(
        condition + 'touch',
        {sprite1: sprite1, sprite2: sprite2},
        callback
      );
    }
  },

  collectData(callback) {
    this.addEvent('collectData', {}, callback);
  },

  everyInterval(n, unit, callback) {
    let roundedValue = Math.round(n);
    this.addEvent('everyInterval', {n: roundedValue, unit}, callback);
  },

  keyPressed(condition, key, callback) {
    if (condition === 'when' || condition === 'while') {
      this.addEvent(condition + 'press', {key: key}, callback);
    }
  },

  repeatForever(callback) {
    this.addEvent('repeatForever', {}, callback);
  },

  stopCollectingData() {
    this.clearCollectDataEvents();
  },

  spriteClicked(condition, spriteArg, callback) {
    if (condition === 'when' || condition === 'while') {
      this.addEvent(condition + 'click', {sprite: spriteArg}, callback);
    }
  },

  whenAllPromptsAnswered(callback) {
    this.addEvent('whenAllPromptsAnswered', {}, callback);
  },

  whenSpriteCreated(spriteArg, callback) {
    if (spriteArg) {
      this.addEvent('whenSpriteCreated', spriteArg, callback);
    }
  },

  whenPromptAnswered(variableName, callback) {
    this.registerPromptAnswerCallback(variableName, callback);
  },
};
