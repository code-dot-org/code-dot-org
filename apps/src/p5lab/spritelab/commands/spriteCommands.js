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
    const behaviorFuncs = {
      burst: behaviorCommands.burstFunc,
      pop: behaviorCommands.popFunc,
      rain: behaviorCommands.rainFunc,
      spiral: behaviorCommands.spiralFunc
    };
    for (let i = 0; i < num; i++) {
      let spriteOptions = {};
      switch (effectName) {
        case 'burst': {
          spriteOptions = {
            animation,
            speed: Math.floor(Math.random() * 10 + 10),
            scale: 0.01,
            direction: Math.floor(Math.random() * 360),
            rotation: Math.floor(Math.random() * 360),
            delay: Math.floor(Math.random() * 20 + 1),
            lifetime: 60
          };
          break;
        }
        case 'pop': {
          spriteOptions = {
            animation,
            speed: Math.floor(Math.random() * 15 + 10),
            scale: 0.5,
            direction: Math.floor(Math.random() * 90 + 225),
            location: {
              x: Math.floor(Math.random() * 400),
              y: Math.floor(Math.random() * 50 + 450)
            },
            lifetime: 60
          };
          break;
        }
        case 'rain': {
          spriteOptions = {
            animation,
            speed: 0,
            scale: 0.5,
            location: {
              x: Math.floor(Math.random() * 400),
              y: Math.floor(Math.random() * 100 - 125)
            },
            rotation: Math.floor(Math.random() * 20 - 10),
            lifetime: 60
          };
          break;
        }
        case 'spiral': {
          spriteOptions = {
            animation,
            scale: 0.01,
            initialAngle: (i * 360) / num - 180 * ((i + 1) % 2),
            delay: (i * 30) / num,
            lifetime: 90
          };
          break;
        }
        default:
      }
      const spriteId = this.addSprite(spriteOptions);
      const sprite = this.getSpriteArray({id: spriteId})[0];
      this.addBehavior(sprite, {
        func: behaviorFuncs[effectName].apply(this),
        name: effectName
      });
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
