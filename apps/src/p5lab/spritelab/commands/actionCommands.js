import {commands as behaviorCommands} from './behaviorCommands';

function move(coreLibrary, spriteArg, distance) {
  let sprites = coreLibrary.getSpriteArray(spriteArg);
  sprites.forEach(sprite => {
    if (!sprite.direction) {
      sprite.direction = 0;
    }
    let direction = sprite.direction % 360;
    sprite.x += distance * Math.cos((direction * Math.PI) / 180);
    sprite.y += distance * Math.sin((direction * Math.PI) / 180);
  });
}

function addSpriteSpeechBubble(coreLibrary, spriteArg, text, seconds) {
  coreLibrary.getSpriteArray(spriteArg)?.forEach(sprite => {
    coreLibrary.addSpeechBubble(sprite, text, seconds);
  });
}

export const commands = {
  addTarget(spriteArg, targetCostume, targetType) {
    if (!['follow', 'avoid'].includes(targetType)) {
      console.warn(`unkknown targetType: ${targetType}`);
      return;
    }
    let sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => {
      if (!sprite.targetSet) {
        sprite.targetSet = {follow: [], avoid: []};
      }
      if (!sprite.targetSet[targetType].includes(targetCostume)) {
        sprite.targetSet[targetType].push(targetCostume);
      }
    });
  },

  bounceOff(spriteArg, targetArg) {
    let sprites = this.getSpriteArray(spriteArg);
    let targets = this.getSpriteArray(targetArg);
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
    let sprites = this.getSpriteArray(spriteArg);
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
    if (!this.p5.edges) {
      this.p5.createEdgeSprites();
    }
    let sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => this.p5.edges.displace(sprite));
  },

  glideTo(spriteArg, location) {
    if (!location) {
      return;
    }
    let sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => {
      if (!sprite.glideTargets) {
        sprite.glideTargets = [];
      }
      sprite.glideTargets.push(location);
      this.addBehavior(sprite, {
        func: behaviorCommands.glideFunc.apply(this),
        name: 'glide'
      });
    });
  },

  isCostumeEqual(spriteArg, costumeName) {
    let sprites = this.getSpriteArray(spriteArg);
    if (sprites.length === 0) {
      return false;
    }
    return sprites.every(sprite => sprite.getAnimationLabel() === costumeName);
  },

  isKeyPressed(key) {
    return this.p5.keyDown(key);
  },

  isTouchingEdges(spriteArg) {
    if (!this.p5.edges) {
      this.p5.createEdgeSprites();
    }
    let sprites = this.getSpriteArray(spriteArg);
    let touching = false;
    sprites.forEach(sprite => {
      if (sprite.isTouching(this.p5.edges)) {
        touching = true;
      }
    });
    return touching;
  },

  isTouchingSprite(spriteArg, targetArg) {
    let sprites = this.getSpriteArray(spriteArg);
    let targets = this.getSpriteArray(targetArg);
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
    let sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => {
      sprite.x = location.x;
      sprite.y = location.y;
    });
  },

  mirrorSprite(spriteArg, direction) {
    let sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => {
      if (direction === 'right') {
        sprite.mirrorX(1);
      } else {
        sprite.mirrorX(-1);
      }
    });
  },

  moveForward(spriteArg, distance) {
    move(this, spriteArg, distance);
  },

  moveBackward(spriteArg, distance) {
    move(this, spriteArg, -1 * distance);
  },

  moveInDirection(spriteArg, distance, direction) {
    let sprites = this.getSpriteArray(spriteArg);
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
    let sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => {
      if (sprite && target) {
        const distanceFromSpriteToTarget = Math.sqrt(
          (sprite.x - target.x) ** 2 + (sprite.y - target.y) ** 2
        );
        if (distanceFromSpriteToTarget < distance) {
          sprite.x = target.x;
          sprite.y = target.y;
          return;
        }
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

  setDefaultSpriteSize(size) {
    this.defaultSpriteSize = size;
  },

  setProp(spriteArg, prop, val) {
    if (val === undefined) {
      return;
    }
    let sprites = this.getSpriteArray(spriteArg);
    let specialCases = {
      direction: sprite => (sprite.direction = val % 360),
      draggable: sprite => {
        if (val) {
          this.addBehavior(sprite, {
            func: behaviorCommands.draggableFunc.apply(this),
            name: 'draggable'
          });
        } else {
          this.removeBehavior(sprite, {
            func: behaviorCommands.draggableFunc.apply(this),
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

  spriteSay(spriteArg, text) {
    addSpriteSpeechBubble(this, spriteArg, text, 4 /* seconds */);
  },

  spriteSayTime(spriteArg, text, seconds) {
    addSpriteSpeechBubble(this, spriteArg, text, seconds);
  },

  removeTint(spriteArg) {
    let sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => (sprite.tint = null));
  },

  setTint(spriteArg, color) {
    let sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => (sprite.tint = color));
  },

  turn(spriteArg, degrees, direction) {
    if (!degrees) {
      return;
    }
    let sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => {
      if (direction === 'right') {
        sprite.rotation += degrees;
        sprite.direction += degrees;
      } else {
        sprite.rotation -= degrees;
        sprite.direction -= degrees;
      }
    });
  }
};
