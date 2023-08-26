function makeNumSpritesWithinRange(numSprites, costume, range){
  for (var count = 0; count < numSprites; count++) {
    makeNewSpriteAnon(costume, {
      x: math_random_int(range.x1, range.x2),
      y: 400 - math_random_int(range.y1, range.y2)
    });
  }
}
