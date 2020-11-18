import * as coreLibrary from '../coreLibrary';
import {getStore} from '@cdo/apps/redux';
import {addConsoleMessage} from '../textConsoleModule';
import {addPrompt} from '../spritelabInputModule';

export const commands = {
  comment(text) {
    /* no-op */
  },

  getTime(unit) {
    if (unit === 'seconds') {
      return this.World.seconds || 0;
    } else if (unit === 'frames') {
      return this.World.frameCount || 0;
    }
    return 0;
  },

  hideTitleScreen() {
    coreLibrary.title = coreLibrary.subtitle = '';
  },

  printText(text) {
    getStore().dispatch(addConsoleMessage({text: text}));
  },

  setBackground(color) {
    coreLibrary.background = color;
  },

  // Deprecated. The new background block is setBackgroundImageAs
  setBackgroundImage(img) {
    if (this._preloadedBackgrounds && this._preloadedBackgrounds[img]) {
      let backgroundImage = this._preloadedBackgrounds[img];
      coreLibrary.background = backgroundImage;
    }
  },

  setBackgroundImageAs(img) {
    if (
      this._predefinedSpriteAnimations &&
      this._predefinedSpriteAnimations[img]
    ) {
      let backgroundImage = this._predefinedSpriteAnimations[img];
      coreLibrary.background = backgroundImage;
    }
  },

  setPrompt(promptText, variableName, setterCallback) {
    coreLibrary.registerPrompt(promptText, variableName, setterCallback);
    getStore().dispatch(addPrompt(promptText, variableName));
  },

  showTitleScreen(title, subtitle) {
    coreLibrary.title = title || '';
    coreLibrary.subtitle = subtitle || '';
  }
};
