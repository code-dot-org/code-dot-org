import * as spriteUtils from './spriteUtils.js';

export const commands = {
  locationAt(x, y) {
    return {x: x, y: 400 - y};
  },
  locationMouse() {
    return {x: this.World.mouseX, y: this.World.mouseY};
  },
  locationOf(spriteIndex) {
    if (!spriteIndex) {
      return undefined;
    }
    let sprite = spriteUtils.singleOrGroup(spriteIndex)[0];
    if (sprite) {
      return {x: sprite.x, y: sprite.y};
    }
  }
};
