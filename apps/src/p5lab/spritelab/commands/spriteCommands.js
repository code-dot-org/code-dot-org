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
