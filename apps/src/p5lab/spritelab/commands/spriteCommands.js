import * as utils from '@cdo/apps/p5lab/utils';

import {APP_HEIGHT} from '../../constants';
import {layoutSpriteGroup} from '../../layoutUtils';

import {commands as behaviorCommands} from './behaviorCommands';
import {commands as locationCommands} from './locationCommands';

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
      } else if (prop === 'velocityY') {
        return -sprite.velocityY;
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

  makeNewGroupSprite(animation, group, location) {
    return this.addSprite({animation, group, location});
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

  makeEnvironmentSprites(animation, group, bitmap) {
    // The scale is determined based on the app height (400) and the number of rows in the array.
    // For example, with a 4x4 grid, the scale is 100 and the sprites are 100x100.
    const scale = APP_HEIGHT / bitmap.length;
    for (let i = 0; i < bitmap.length; i++) {
      for (let j = 0; j < bitmap[0].length; j++) {
        // Array values are either 0 or 1. Create a sprite for each 1.
        if (bitmap[j][i]) {
          // Sprite x/y coordinates represent the center of the sprite.
          // To position the sprites, we offset x and y by half of the scale.
          const location = {
            x: scale / 2 + scale * i,
            y: scale / 2 + scale * j,
          };
          this.addSprite({animation, group, location, scale, minimumScale: 1});
        }
      }
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
      spriteOptions.group = 'effects';
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
