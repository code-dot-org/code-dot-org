function getSpriteWorldObjFromId(id) {
  for (var i = 0; i < World.allSprites.length; i++) {
    if (World.allSprites[i].id == id)
      return World.allSprites[i];
  }
  return undefined;
}

function spriteIsTouchingAnyOtherSprite (id) {
  var sprite = getSpriteWorldObjFromId(id);
  if (sprite === undefined)
    return undefined;
  return sprite.isTouching(World.allSprites);
}


function twoSpritesAreTouching (id1, id2) {
  var s1 = getSpriteWorldObjFromId(id);
  var s2 = getSpriteWorldObjFromId(id);
  if (s1 === undefined || s2 === undefined)
    return undefined;

  return s1.isTouching(s2);
}
