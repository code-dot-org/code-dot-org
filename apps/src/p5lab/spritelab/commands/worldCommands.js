import * as spritelabLibrary from '../spritelabLibrary';
import {getStore} from '@cdo/apps/redux';
import {addConsoleMessage} from '../textConsoleModule';

export const commands = {
  comment(text) {
    /* no-op */
  },

  hideTitleScreen() {
    spritelabLibrary.title = spritelabLibrary.subtitle = '';
  },

  printText(text) {
    getStore().dispatch(addConsoleMessage({text: text}));
  },

  setBackground(color) {
    spritelabLibrary.background = color;
  },

  setBackgroundImage(img) {
    if (this._preloadedBackgrounds && this._preloadedBackgrounds[img]) {
      let backgroundImage = this._preloadedBackgrounds[img];
      spritelabLibrary.background = backgroundImage;
    }
  },

  showTitleScreen(title, subtitle) {
    spritelabLibrary.title = title || '';
    spritelabLibrary.subtitle = subtitle || '';
  }
};
