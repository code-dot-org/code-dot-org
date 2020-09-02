import * as coreLibrary from '../coreLibrary';
import {getStore} from '@cdo/apps/redux';
import {addConsoleMessage} from '../textConsoleModule';

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

  setBackgroundImage(img) {
    if (this._preloadedBackgrounds && this._preloadedBackgrounds[img]) {
      let backgroundImage = this._preloadedBackgrounds[img];
      coreLibrary.background = backgroundImage;
    }
  },

  setBackgroundImageAs(img) {
    let location = {x: 200, y: 200};
    let animation = img;
    var sprite = this.createSprite(location.x, location.y, 400, 400);
    sprite.direction = 0;
    sprite.baseScale = 1;
    coreLibrary.addSprite(sprite, undefined);
    sprite.setAnimation(animation);
    sprite.depth = 0;
    sprite.height = 400;
    sprite.width = Math.max(400, sprite.width);
  },

  showTitleScreen(title, subtitle) {
    coreLibrary.title = title || '';
    coreLibrary.subtitle = subtitle || '';
  }
};
