import type {Location, SpriteArg} from '../types';

import {defineCommands} from './defineCommands';

export const commands = defineCommands({
  locationAt(x: number, y: number): Location {
    return {x: x, y: 400 - y};
  },

  locationModifier(
    distance: number,
    direction: string,
    location: Partial<Location> | undefined,
  ): Location | undefined {
    const dirs: Record<string, (location: Location) => Location> = {
      North: location => ({x: location.x, y: location.y - distance}),
      East: location => ({x: location.x + distance, y: location.y}),
      South: location => ({x: location.x, y: location.y + distance}),
      West: location => ({x: location.x - distance, y: location.y}),
    };
    if (
      location === undefined ||
      location.x === undefined ||
      location.y === undefined ||
      !dirs[direction]
    ) {
      return;
    }
    return dirs[direction](location as Location);
  },

  locationMouse(): Location {
    return {x: this.p5.World.mouseX, y: this.p5.World.mouseY};
  },

  locationOf(spriteArg: SpriteArg): Location | undefined {
    const sprite = this.getSpriteArray(spriteArg)[0];
    if (sprite) {
      return {x: sprite.x, y: sprite.y};
    }
  },

  randomLocation(): Location {
    const max = 380;
    const min = 20;
    const x = Math.floor(Math.random() * (max - min + 1)) + min;
    const y = Math.floor(Math.random() * (max - min + 1)) + min;
    return {x: x, y: y};
  },
});
