import * as coreLibrary from '../coreLibrary';
import {commands as behaviorCommands} from './behaviorCommands';

export const commands = {
  bounceOff(spriteArg, targetArg) {
    let sprites = coreLibrary.getSpriteArray(spriteArg);
    let targets = coreLibrary.getSpriteArray(targetArg);
    sprites.forEach(sprite => {
      targets.forEach(target => {
        if (sprite.isTouching(target)) {
          sprite.direction = (sprite.direction + 180) % 360;
          target.direction = (target.direction + 180) % 360;
          sprite.x += 1 * Math.cos((sprite.direction * Math.PI) / 180);
          sprite.y += 1 * Math.sin((sprite.direction * Math.PI) / 180);
          target.x += 1 * Math.cos((target.direction * Math.PI) / 180);
          target.y += 1 * Math.sin((target.direction * Math.PI) / 180);
        }
      });
    });
  },

  changePropBy(spriteArg, prop, val) {
    if (val === undefined || prop === undefined) {
      return;
    }
    let sprites = coreLibrary.getSpriteArray(spriteArg);
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
  edgesDisplace(spriteArg) {
    if (!this.edges) {
      this.createEdgeSprites();
    }
    let sprites = coreLibrary.getSpriteArray(spriteArg);
    sprites.forEach(sprite => this.edges.displace(sprite));
  },

  isKeyPressed(key) {
    return this.keyDown(key);
  },

  isTouchingEdges(spriteArg) {
    if (!this.edges) {
      this.createEdgeSprites();
    }
    let sprites = coreLibrary.getSpriteArray(spriteArg);
    let touching = false;
    sprites.forEach(sprite => {
      if (sprite.isTouching(this.edges)) {
        touching = true;
      }
    });
    return touching;
  },

  isTouchingSprite(spriteArg, targetArg) {
    let sprites = coreLibrary.getSpriteArray(spriteArg);
    let targets = coreLibrary.getSpriteArray(targetArg);
    let touching = false;
    sprites.forEach(sprite => {
      targets.forEach(target => {
        if (sprite.isTouching(target)) {
          touching = true;
        }
      });
    });
    return touching;
  },
  jumpTo(spriteArg, location) {
    if (!location) {
      return;
    }
    let sprites = coreLibrary.getSpriteArray(spriteArg);
    sprites.forEach(sprite => {
      sprite.x = location.x;
      sprite.y = location.y;
    });
  },
  mirrorSprite(spriteArg, direction) {
    let sprites = coreLibrary.getSpriteArray(spriteArg);
    sprites.forEach(sprite => {
      if (direction === 'right') {
        sprite.mirrorX(1);
      } else {
        sprite.mirrorX(-1);
      }
    });
  },
  moveForward(spriteArg, distance) {
    let sprites = coreLibrary.getSpriteArray(spriteArg);
    sprites.forEach(sprite => {
      if (!sprite.direction) {
        sprite.direction = 0;
      }
      let direction = sprite.direction % 360;
      sprite.x += distance * Math.cos((direction * Math.PI) / 180);
      sprite.y += distance * Math.sin((direction * Math.PI) / 180);
    });
  },
  moveInDirection(spriteArg, distance, direction) {
    let sprites = coreLibrary.getSpriteArray(spriteArg);
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
  moveToward(spriteArg, distance, target) {
    let sprites = coreLibrary.getSpriteArray(spriteArg);
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
  setProp(spriteArg, prop, val) {
    if (val === undefined) {
      return;
    }
    let sprites = coreLibrary.getSpriteArray(spriteArg);
    let specialCases = {
      direction: sprite => (sprite.direction = val % 360),
      draggable: sprite => {
        if (val) {
          coreLibrary.addBehavior(sprite, {
            func: behaviorCommands.draggableFunc(this),
            name: 'draggable'
          });
        } else {
          coreLibrary.removeBehavior(sprite, {
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
  turn(spriteArg, degrees, direction) {
    if (!degrees) {
      return;
    }
    let sprites = coreLibrary.getSpriteArray(spriteArg);
    sprites.forEach(sprite => {
      if (direction === 'right') {
        sprite.rotation += degrees;
      } else {
        sprite.rotation -= degrees;
      }
    });
  }
};
