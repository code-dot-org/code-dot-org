var spriteId = 0;
var nativeSpriteMap = {};

function allSpritesWithAnimation(animation) {
  let group = [];
  Object.keys(nativeSpriteMap).forEach(spriteId => {
    if (nativeSpriteMap[spriteId].getAnimationLabel() === animation) {
      group.push(nativeSpriteMap[spriteId]);
    }
  });
  return group;
}

function singleOrGroup(spriteOrGroup) {
  if (typeof spriteOrGroup === 'number') {
    const sprite = nativeSpriteMap[spriteOrGroup];
    return [sprite];
  }
  if (typeof spriteOrGroup === 'string') {
    return allSpritesWithAnimation(spriteOrGroup);
  }
}

export const commands = {
  setBackground(color) {
    this.background(color);
  },

  makeSprite(animation, location) {
    var sprite = this.createSprite(location.x, location.y);
    nativeSpriteMap[spriteId] = sprite;
    sprite.id = spriteId;
    if (animation) {
      sprite.setAnimation(animation);
    }
    spriteId++;
    return sprite.id;
  },

  setAnimation(spriteIndex, animation) {
    let sprites = singleOrGroup(spriteIndex);
    if (sprites) {
      sprites.forEach(sprite => {
        sprite.setAnimation(animation);
      });
    }
  }
};
