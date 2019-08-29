import * as spritelabLibrary from '../spritelabLibrary';
import {commands as behaviorCommands} from './behaviorCommands';

export const commands = {
  changePropBy(spriteId, prop, val) {
    if (val === undefined || prop === undefined) {
      return;
    }
    let sprites = spritelabLibrary.getSpriteArray(spriteId);
    let specialCases = {
      direction: sprite => (sprite.direction = (sprite.direction + val) % 360),
      scale: sprite => {
        sprite.setScale(sprite.getScale() + val / 100);
        if (sprite.scale < 0) {
          sprite.scale = 0;
        }
      },
      y: sprite => (sprite.y -= val)
    };
    sprites.forEach(sprite => {
      if (specialCases[prop]) {
        specialCases[prop](sprite);
      } else {
        sprite[prop] += val;
      }
    });
  },
  edgesDisplace(spriteId) {
    if (!this.edges) {
      this.createEdgeSprites();
    }
    let sprites = spritelabLibrary.getSpriteArray(spriteId);
    sprites.forEach(sprite => this.edges.displace(sprite));
  },
  isTouchingEdges(spriteId) {
    if (!this.edges) {
      this.createEdgeSprites();
    }
    let sprites = spritelabLibrary.getSpriteArray(spriteId);
    let touching = false;
    sprites.forEach(sprite => {
      if (sprite.isTouching(this.edges)) {
        touching = true;
      }
    });
    return touching;
  },
  jumpTo(spriteId, location) {
    if (!location) {
      return;
    }
    let sprites = spritelabLibrary.getSpriteArray(spriteId);
    sprites.forEach(sprite => {
      sprite.x = location.x;
      sprite.y = location.y;
    });
  },
  mirrorSprite(spriteId, direction) {
    let sprites = spritelabLibrary.getSpriteArray(spriteId);
    sprites.forEach(sprite => {
      if (direction === 'right') {
        sprite.mirrorX(1);
      } else {
        sprite.mirrorX(-1);
      }
    });
  },
  moveForward(spriteId, distance) {
    let sprites = spritelabLibrary.getSpriteArray(spriteId);
    sprites.forEach(sprite => {
      if (!sprite.direction) {
        sprite.direction = 0;
      }
      let direction = sprite.direction % 360;
      sprite.x += distance * Math.cos((direction * Math.PI) / 180);
      sprite.y += distance * Math.sin((direction * Math.PI) / 180);
    });
  },
  moveInDirection(spriteId, distance, direction) {
    let sprites = spritelabLibrary.getSpriteArray(spriteId);
    let dirs = {
      North: sprite => (sprite.y -= distance),
      East: sprite => (sprite.x += distance),
      South: sprite => (sprite.y += distance),
      West: sprite => (sprite.x -= distance)
    };
    if (!dirs[direction]) {
      console.error('invalid direction: ' + direction);
      return;
    }
    sprites.forEach(sprite => {
      dirs[direction](sprite);
    });
  },
  moveToward(spriteId, distance, target) {
    let sprites = spritelabLibrary.getSpriteArray(spriteId);
    sprites.forEach(sprite => {
      if (sprite && target) {
        let angle = Math.atan2(target.y - sprite.y, target.x - sprite.x);
        if (!isNaN(angle)) {
          let dy = Math.sin(angle) * distance;
          let dx = Math.cos(angle) * distance;
          sprite.x += dx;
          sprite.y += dy;
        }
      }
    });
  },
  setProp(spriteId, prop, val) {
    if (val === undefined) {
      return;
    }
    let sprites = spritelabLibrary.getSpriteArray(spriteId);
    let specialCases = {
      direction: sprite => (sprite.direction = val % 360),
      draggable: sprite => {
        if (val) {
          spritelabLibrary.addBehavior(sprite, {
            func: behaviorCommands.draggableFunc(this),
            name: 'draggable'
          });
        } else {
          spritelabLibrary.removeBehavior(sprite, {
            func: behaviorCommands.draggableFunc(this),
            name: 'draggable'
          });
        }
      },
      height: sprite =>
        (sprite.height = (sprite.animation.getHeight() * val) / 100),
      scale: sprite => sprite.setScale(val / 100),
      width: sprite =>
        (sprite.width = (sprite.animation.getWidth() * val) / 100),
      y: sprite => (sprite.y = 400 - val)
    };
    sprites.forEach(sprite => {
      if (specialCases[prop]) {
        specialCases[prop](sprite);
      } else {
        sprite[prop] = val;
      }
    });
  },
  turn(spriteId, degrees, direction) {
    if (!degrees) {
      return;
    }
    let sprites = spritelabLibrary.getSpriteArray(spriteId);
    sprites.forEach(sprite => {
      if (direction === 'right') {
        sprite.rotation += degrees;
      } else {
        sprite.rotation -= degrees;
      }
    });
  }
};
