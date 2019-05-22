var spriteId = 0;
var nativeSpriteMap = {};
export var background;
export var title = '';
export var subtitle = '';

function allSpritesWithAnimation(animation) {
  let group = [];
  Object.keys(nativeSpriteMap).forEach(spriteId => {
    if (nativeSpriteMap[spriteId].getAnimationLabel() === animation) {
      group.push(nativeSpriteMap[spriteId]);
    }
  });
  return group;
}

export function singleOrGroup(spriteOrGroup) {
  if (typeof spriteOrGroup === 'number') {
    const sprite = nativeSpriteMap[spriteOrGroup];
    return [sprite];
  }
  if (typeof spriteOrGroup === 'string') {
    return allSpritesWithAnimation(spriteOrGroup);
  }
  return [];
}

export function addSprite(sprite) {
  nativeSpriteMap[spriteId] = sprite;
  sprite.id = spriteId;
  spriteId++;
  return sprite.id;
}

export function deleteSprite(spriteId) {
  delete nativeSpriteMap[spriteId];
}

export function resetSpriteMap() {
  nativeSpriteMap = {};
  spriteId = 0;
}
