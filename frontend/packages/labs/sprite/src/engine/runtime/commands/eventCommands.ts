import type {EventCallback, SpriteArg} from '../types';

import {defineCommands} from './defineCommands';

export const commands = defineCommands({
  atTime(n: number, unit: string, callback: EventCallback) {
    this.addEvent('atTime', {n, unit}, callback);
  },

  checkTouching(
    condition: string,
    sprite1: SpriteArg,
    sprite2: SpriteArg,
    callback: EventCallback,
  ) {
    if (condition === 'when' || condition === 'while') {
      this.addEvent(
        condition + 'touch',
        {sprite1: sprite1, sprite2: sprite2},
        callback,
      );
    }
  },

  collectData(callback: EventCallback) {
    this.addEvent('collectData', {}, callback);
  },

  everyInterval(n: number, unit: string, callback: EventCallback) {
    const roundedValue = Math.round(n);
    this.addEvent('everyInterval', {n: roundedValue, unit}, callback);
  },

  keyPressed(condition: string, key: string, callback: EventCallback) {
    if (condition === 'when' || condition === 'while') {
      this.addEvent(condition + 'press', {key: key}, callback);
    }
  },

  repeatForever(callback: EventCallback) {
    this.addEvent('repeatForever', {}, callback);
  },

  stopCollectingData() {
    this.clearCollectDataEvents();
  },

  spriteClicked(
    condition: string,
    spriteArg: SpriteArg,
    callback: EventCallback,
  ) {
    if (condition === 'when' || condition === 'while') {
      this.addEvent(condition + 'click', {sprite: spriteArg}, callback);
    }
  },

  whenAllPromptsAnswered(callback: EventCallback) {
    this.addEvent('whenAllPromptsAnswered', {}, callback);
  },

  whenSpriteCreated(spriteArg: SpriteArg, callback: EventCallback) {
    if (spriteArg) {
      this.addEvent('whenSpriteCreated', spriteArg, callback);
    }
  },

  whenPromptAnswered(variableName: string, callback: () => void) {
    this.registerPromptAnswerCallback(variableName, callback);
  },
});
