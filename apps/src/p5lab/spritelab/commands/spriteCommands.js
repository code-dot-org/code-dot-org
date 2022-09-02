import {commands as locationCommands} from './locationCommands';
import {commands as behaviorCommands} from './behaviorCommands';
import * as utils from '@cdo/apps/p5lab/utils';

// Big numbers in some blocks can cause performance issues. Combined with live-preview,
// this results in hanging the tab and students unable to edit their blocks. We should
// guard against this by silently capping numbers where needed.
const BIG_NUMBER_GUARD = 500;

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

  makeNumSprites(num, animation) {
    num = Math.min(num, BIG_NUMBER_GUARD);
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
    num = Math.min(num, BIG_NUMBER_GUARD);
    //Makes sure that same-frame multiple spiral effects start at a different angles
    const spiralRandomizer = utils.randomInt(0, 359);
    for (let i = 0; i < num; i++) {
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
            lifetime: 60
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
              y: utils.randomInt(450, 500)
            },
            lifetime: 60
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
              y: utils.randomInt(-125, -25)
            },
            rotation: utils.randomInt(-10, 10),
            lifetime: 60
          };
          break;
        }
        case 'spiral': {
          spriteOptions = {
            animation,
            scale: 1,
            initialAngle:
              (i * 360) / num - 180 * ((i + 1) % 2) + spiralRandomizer,
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
