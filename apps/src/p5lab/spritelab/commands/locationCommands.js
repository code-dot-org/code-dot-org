import * as coreLibrary from '../coreLibrary';

export const commands = {
  locationAt(x, y) {
    return {x: x, y: 400 - y};
  },

  locationModifier(distance, direction, location) {
    let dirs = {
      North: location => ({x: location.x, y: location.y - distance}),
      East: location => ({x: location.x + distance, y: location.y}),
      South: location => ({x: location.x, y: location.y + distance}),
      West: location => ({x: location.x - distance, y: location.y})
    };
    if (!location || !location.x || !location.y || !dirs[direction]) {
      return;
    }
    return dirs[direction](location);
  },

  locationMouse() {
    return {x: this.World.mouseX, y: this.World.mouseY};
  },

  locationOf(spriteArg) {
    let sprite = coreLibrary.getSpriteArray(spriteArg)[0];
    if (sprite) {
      return {x: sprite.x, y: sprite.y};
    }
  },

  randomLocation() {
    let max = 380;
    let min = 20;
    let x = Math.floor(Math.random() * (max - min + 1)) + min;
    let y = Math.floor(Math.random() * (max - min + 1)) + min;
    return {x: x, y: y};
  }
};
