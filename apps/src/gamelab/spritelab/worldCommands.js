import * as spriteUtils from './spriteUtils.js';

export const commands = {
  hideTitleScreen() {
    spriteUtils.title = spriteUtils.subtitle = '';
  },
  randColor() {
    return this.color(
      this.randomNumber(0, 255),
      this.randomNumber(0, 255),
      this.randomNumber(0, 255)
    );
  },
  setBackground(color) {
    spriteUtils.background = color;
  },
  setBackgroundImage(img) {
    spriteUtils.background = this.loadImage(img);
  },
  showTitleScreen(title, subtitle) {
    spriteUtils.title = title || '';
    spriteUtils.subtitle = subtitle || '';
  }
};
