import * as coreLibrary from '../coreLibrary';

export const commands = {
  countByAnimation(animation) {
    let sprites = coreLibrary.getSpriteArray(animation);
    return sprites.length;
  },
  destroy(spriteId) {
    let sprites = coreLibrary.getSpriteArray(spriteId);
    sprites.forEach(sprite => {
      sprite.destroy();
      coreLibrary.removeAllBehaviors(sprite);
      coreLibrary.deleteSprite(sprite.id);
    });
  },

  displace(spriteId, targetSpriteIndex) {
    let sprites = coreLibrary.getSpriteArray(spriteId);
    let targetSprites = coreLibrary.getSpriteArray(targetSpriteIndex);
    sprites.forEach(sprite => {
      targetSprites.forEach(target => sprite.displace(target));
    });
  },

  getProp(spriteId, prop) {
    let sprite = coreLibrary.getSpriteArray(spriteId)[0];
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
        return extraArgs.sprite;
      }
      if (which === 'other') {
        return extraArgs.target;
      }
    }
  },

  makeSprite(animation, location) {
    if (!location) {
      location = {x: 200, y: 200};
    }
    if (typeof location === 'function') {
      location = location();
    }
    var sprite = this.createSprite(location.x, location.y);
    sprite.direction = 0;
    sprite.baseScale = 1;
    sprite.setScale = function(scale) {
      sprite.scale = scale * sprite.baseScale;
    };
    sprite.getScale = function() {
      return sprite.scale / sprite.baseScale;
    };
    let spriteId = coreLibrary.addSprite(sprite);
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
    return spriteId;
  },

  setAnimation(spriteId, animation) {
    let sprites = coreLibrary.getSpriteArray(spriteId);
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
