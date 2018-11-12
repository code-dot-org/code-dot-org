function createNewSpriteAdvanced(name, costume, location) {
  if(!spriteGroups.hasOwnProperty(name)) {
    spriteGroups[name] = new Group();
  }
  if (!location) {
    location = {x: 200, y: 200};
  }
  var newSprite = makeNewSprite(costume, location.x, location.y);
  newSprite.maxSpeed = 0;
  newSprite.addToGroup(spriteGroups[name]);
  console.log(spriteGroups);
}