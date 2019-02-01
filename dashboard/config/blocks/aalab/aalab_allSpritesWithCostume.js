function allSpritesWithCostume(costumeName) {
  var allSprites = World.allSprites;
  var sprites = [];
  for(var i = 0; i < allSprites.length; i++) {
    if(allSprites[i].getAnimationLabel() === costumeName) {
      sprites.push(allSprites[i]);
    }
  }
  return sprites;
}