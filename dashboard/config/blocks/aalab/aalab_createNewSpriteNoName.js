function createNewSpriteNoName(costume,location) {
  if (!location) {
    location = {x: 200, y: 200};
  }
  var newSprite = makeNewSprite(costume,location.x,location.y);
  newSprite.maxSpeed = 0;
  //newSprite.name = name;
  if(costumeGroups.hasOwnProperty(costume)) {
     costumeGroups[costume].push(newSprite);
  } else {
    costumeGroups[costume] = [newSprite];
  }
  return newSprite;
}