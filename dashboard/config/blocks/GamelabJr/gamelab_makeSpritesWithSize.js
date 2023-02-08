function makeSpritesWithSize(num, costume, size) {
  for (var i = 0; i < num; i++) {
    createNewSprite({name: 'newSpriteWithSize'}, costume, randomLocation());
  setProp({name: 'newSpriteWithSize'}, "scale", size);
  }
}