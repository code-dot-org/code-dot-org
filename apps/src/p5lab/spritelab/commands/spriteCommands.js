import {commands as locationCommands} from './locationCommands';
import {commands as behaviorCommands} from './behaviorCommands';

export const commands = {
  countByAnimation(spriteArg) {
    let sprites = this.getSpriteArray(spriteArg);
    return sprites.length;
  },
  destroy(spriteArg) {
    let sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => {
      sprite.destroy();
      this.removeAllBehaviors(sprite);
      this.deleteSprite(sprite.id);
    });
  },

  displace(spriteArg, targetSpriteIndex) {
    let sprites = this.getSpriteArray(spriteArg);
    let targetSprites = this.getSpriteArray(targetSpriteIndex);
    sprites.forEach(sprite => {
      targetSprites.forEach(target => sprite.displace(target));
    });
  },

  getProp(spriteArg, prop) {
    let sprite = this.getSpriteArray(spriteArg)[0];
    if (sprite !== undefined) {
      if (prop === 'scale') {
        return sprite.getScale() * 100;
      } else if (prop === 'costume') {
        return sprite.getAnimationLabel();
      } else if (prop === 'y') {
        return 400 - sprite.y;
      } else {
        return sprite[prop];
      }
    }
  },

  getThisSprite(which, extraArgs) {
    if (extraArgs) {
      if (which === 'this') {
        if (extraArgs.clickedSprite !== undefined) {
          return {id: extraArgs.clickedSprite};
        } else if (extraArgs.subjectSprite !== undefined) {
          return {id: extraArgs.subjectSprite};
        }
      }
      if (which === 'other') {
        return {id: extraArgs.objectSprite};
      }
    }
  },

  createNewSprite(name, animation, location) {
    return this.addSprite({name: name.name, animation, location});
  },

  makeNewSpriteAnon(animation, location) {
    return this.addSprite({animation, location});
  },

  makeNumSprites(num, animation) {
    for (let i = 0; i < num; i++) {
      this.addSprite({
        animation,
        location: locationCommands.randomLocation()
      });
    }
  },

  makeBurst(num, animation, effectName) {
    for (let i = 0; i < num; i++) {
      switch (effectName) {
        case 'burst': {
          let spriteId = this.addSprite({
            animation,
            speed: Math.floor(Math.random() * 10 + 10),
            delay: Math.floor(Math.random() * 20 + 1),
            scale: 1,
            direction: Math.floor(Math.random() * 360),
            rotation: Math.floor(Math.random() * 360),
            lifetime: 60
          });
          let sprite = this.getSpriteArray({id: spriteId})[0];
          this.addBehavior(sprite, {
            func: behaviorCommands.burstFunc.apply(this),
            name: 'burst'
          });
          break;
        }
        case 'pop': {
          let spriteId = this.addSprite({
            animation,
            speed: Math.floor(Math.random() * 15 + 10),
            scale: 50,
            direction: Math.floor(Math.random() * 90 + 225),
            location: {
              x: Math.floor(Math.random() * 400),
              y: Math.floor(Math.random() * 50 + 450)
            },
            lifetime: 60
          });
          let sprite = this.getSpriteArray({id: spriteId})[0];
          this.addBehavior(sprite, {
            func: behaviorCommands.popFunc.apply(this),
            name: 'pop'
          });
          break;
        }
        case 'rain': {
          let spriteId = this.addSprite({
            animation,
            speed: 0,
            scale: 50,
            location: {
              x: Math.floor(Math.random() * 400),
              y: Math.floor(Math.random() * 100 - 125)
            },
            rotation: Math.floor(Math.random() * 20 - 10),
            lifetime: 60
          });
          let sprite = this.getSpriteArray({id: spriteId})[0];
          this.addBehavior(sprite, {
            func: behaviorCommands.rainFunc.apply(this),
            name: 'rain'
          });
          break;
        }
        case 'spiral': {
          let spriteId = this.addSprite({
            animation,
            initalAngle: (i * 360) / num - 180 * (i % 2),
            delay: (i * 60) / num,
            start: (i * 60) / num,
            lifetime: 60
          });
          let sprite = this.getSpriteArray({id: spriteId})[0];
          this.addBehavior(sprite, {
            func: behaviorCommands.spiralFunc.apply(this),
            name: 'spiral'
          });
          break;
        }
        case 'zig-zag': {
          let spriteId = this.addSprite({
            animation,
            speed: Math.floor(Math.random() * 15 + 10),
            scale: 50,
            location: {
              x: Math.floor(Math.random() * 50 - 100) + 550 * (i % 2),
              y: Math.floor(Math.random() * 400)
            },
            direction: 180 * (i % 2),
            lifetime: 60
          });
          let sprite = this.getSpriteArray({id: spriteId})[0];
          this.addBehavior(sprite, {
            func: behaviorCommands.zigZagFunc.apply(this),
            name: 'zig-zag'
          });
          break;
        }
        default:
      }
    }
  },

  setAnimation(spriteArg, animation) {
    let sprites = this.getSpriteArray(spriteArg);
    sprites.forEach(sprite => {
      sprite.setAnimation(animation);
      sprite.scale /= sprite.baseScale;
      sprite.baseScale =
        100 /
        Math.max(
          100,
          sprite.animation.getHeight(),
          sprite.animation.getWidth()
        );
      sprite.scale *= sprite.baseScale;
    });
  }
};
