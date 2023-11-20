function makeNumSpritesAtLocation(numSprites, costume, locationGenerator){
  for (var count = 0; count < numSprites; count++) {
    makeNewSpriteAnon(costume, locationGenerator());
  }
}
