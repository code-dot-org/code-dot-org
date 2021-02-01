import * as coreLibrary from '../coreLibrary';

export const commands = {
  countByAnimation(spriteArg) {
    let sprites = coreLibrary.getSpriteArray(spriteArg);
    return sprites.length;
  },
  destroy(spriteArg) {
    let sprites = coreLibrary.getSpriteArray(spriteArg);
    sprites.forEach(sprite => {
      sprite.destroy();
      coreLibrary.removeAllBehaviors(sprite);
      coreLibrary.deleteSprite(sprite.id);
    });
  },

  displace(spriteArg, targetSpriteIndex) {
    let sprites = coreLibrary.getSpriteArray(spriteArg);
    let targetSprites = coreLibrary.getSpriteArray(targetSpriteIndex);
    sprites.forEach(sprite => {
      targetSprites.forEach(target => sprite.displace(target));
    });
  },

  getProp(spriteArg, prop) {
    let sprite = coreLibrary.getSpriteArray(spriteArg)[0];
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

  makeSprite(opts) {
    opts = opts || {};
    let name = opts.name;
    let location = opts.location;
    let animation = opts.animation;
    if (!location) {
      location = {x: 200, y: 200};
    }
    if (typeof location === 'function') {
      location = location();
    }
    var sprite = this.createSprite(location.x, location.y);
    sprite.direction = 0;
    sprite.speed = 5;
    sprite.baseScale = 1;
    sprite.setScale = function(scale) {
      sprite.scale = scale * sprite.baseScale;
    };
    sprite.getScale = function() {
      return sprite.scale / sprite.baseScale;
    };
    let spriteArg = coreLibrary.addSprite(sprite, name, animation);
    if (animation) {
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
    }
    sprite.setScale(coreLibrary.defaultSpriteSize / 100);
    return spriteArg;
  },

  setAnimation(spriteArg, animation) {
    let sprites = coreLibrary.getSpriteArray(spriteArg);
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
