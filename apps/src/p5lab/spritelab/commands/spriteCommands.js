import {commands as locationCommands} from './locationCommands';
import {commands as behaviorCommands} from './behaviorCommands';
import {layoutSpriteGroup} from '../../layoutUtils';
import * as utils from '@cdo/apps/p5lab/utils';

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
      this.removeSpeechBubblesForSprite(sprite);
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

  makeNumSprites(numSprites, animation) {
    if (this.reachedSpriteMax()) {
      return;
    } else if (this.reachedSpriteWarningThreshold()) {
      this.dispatchSpriteLimitWarning();
    }
    const maxAllowedNewSprites = this.getMaxAllowedNewSprites(numSprites);
    for (let i = 0; i < maxAllowedNewSprites; i++) {
      this.addSprite({
        animation,
        location: locationCommands.randomLocation(),
      });
    }
  },

  makeBurst(numSprites, animation, effectName) {
    if (this.reachedSpriteMax()) {
      return;
    } else if (this.reachedSpriteWarningThreshold()) {
      this.dispatchSpriteLimitWarning();
    }
    const maxAllowedNewSprites = this.getMaxAllowedNewSprites(numSprites);
    const behaviorFuncs = {
      burst: behaviorCommands.burstFunc,
      pop: behaviorCommands.popFunc,
      rain: behaviorCommands.rainFunc,
      spiral: behaviorCommands.spiralFunc,
    };
    //Makes sure that same-frame multiple spiral effects start at a different angles
    const spiralRandomizer = utils.randomInt(0, 359);
    for (let i = 0; i < maxAllowedNewSprites; i++) {
      let spriteOptions = {};
      switch (effectName) {
        case 'burst': {
          spriteOptions = {
            animation,
            speed: utils.randomInt(10, 20),
            scale: 1,
            direction: utils.randomInt(0, 359),
            rotation: utils.randomInt(0, 359),
            delay: utils.randomInt(1, 21),
            lifetime: 60,
          };
          break;
        }
        case 'pop': {
          spriteOptions = {
            animation,
            speed: utils.randomInt(10, 25),
            scale: 50,
            direction: utils.randomInt(225, 315),
            location: {
              x: utils.randomInt(0, 400),
              y: utils.randomInt(450, 500),
            },
            lifetime: 60,
          };
          break;
        }
        case 'rain': {
          spriteOptions = {
            animation,
            speed: 0,
            scale: 50,
            location: {
              x: utils.randomInt(0, 400),
              y: utils.randomInt(-125, -25),
            },
            rotation: utils.randomInt(-10, 10),
            lifetime: 60,
          };
          break;
        }
        case 'spiral': {
          spriteOptions = {
            animation,
            scale: 1,
            initialAngle:
              (i * 360) / numSprites - 180 * ((i + 1) % 2) + spiralRandomizer,
            delay: (i * 30) / numSprites,
            lifetime: 90,
          };
          break;
        }
        default:
      }
      const spriteId = this.addSprite(spriteOptions);
      const sprite = this.getSpriteArray({id: spriteId})[0];
      this.addBehavior(sprite, {
        func: behaviorFuncs[effectName].apply(this),
        name: effectName,
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
  },

  makeNewSpriteGroup(numSprites, animation, layout) {
    let spriteGroup = [];
    for (let i = 0; i < numSprites; i++) {
      const id = this.addSprite({animation});
      spriteGroup = spriteGroup.concat(this.getSpriteArray({id}));
    }
    layoutSpriteGroup(spriteGroup, layout, this.p5);
  },
};
