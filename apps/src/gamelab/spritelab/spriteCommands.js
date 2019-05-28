import * as spriteUtils from './spriteUtils.js';

export const commands = {
  makeSprite(animation, location) {
    if (!location) {
      location = {x: 200, y: 200};
    }
    if (typeof location === 'function') {
      location = location();
    }
    var sprite = this.createSprite(location.x, location.y);
    sprite.direction = 0;
    let spriteId = spriteUtils.addSprite(sprite);
    if (animation) {
      sprite.setAnimation(animation);
    }
    return spriteId;
  },

  displace(spriteId, targetSpriteIndex) {
    let sprites = spriteUtils.singleOrGroup(spriteId);
    let targetSprites = spriteUtils.singleOrGroup(targetSpriteIndex);
    sprites.forEach(sprite => {
      targetSprites.forEach(target => sprite.displace(target));
    });
  },

  setAnimation(spriteId, animation) {
    let sprites = spriteUtils.singleOrGroup(spriteId);
    sprites.forEach(sprite => {
      sprite.setAnimation(animation);
    });
  },

  setTint(spriteId, color) {
    let sprites = spriteUtils.singleOrGroup(spriteId);
    sprites.forEach(sprite => {
      sprite.tint = color;
    });
  },
  removeTint(spriteId) {
    let sprites = spriteUtils.singleOrGroup(spriteId);
    sprites.forEach(sprite => {
      sprite.tint = null;
    });
  },

  getProp(spriteId, prop) {
    if (!spriteId) {
      return undefined;
    }
    let sprite = spriteUtils.singleOrGroup(spriteId)[0];
    if (prop === 'scale') {
      return sprite.scale * 100;
    } else if (prop === 'costume') {
      return sprite.getAnimationLabel();
    } else if (prop === 'y') {
      return 400 - sprite.y;
    } else {
      return sprite[prop];
    }
  },

  destroy(spriteId) {
    let sprites = spriteUtils.singleOrGroup(spriteId);
    sprites.forEach(sprite => {
      sprite.destroy();
      spriteUtils.deleteSprite(sprite.id);
    });
  }
};
