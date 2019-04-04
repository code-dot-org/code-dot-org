function createNewSpriteAdvanced(name, costume, location) {
  if (!location) {
    location = {x: 200, y: 200};
  }
  if(!name) {
    name = "foo";
  }
  var newSprite = makeNewSprite(costume,location.x,location.y);
  newSprite.maxSpeed = 0;
  newSprite.name = name;
  if(!spriteGroups.hasOwnProperty(name)) {
  	spriteGroups[name] = new Group();
    spriteGroups[name].name = name;
  }
  spriteGroups[name].add(newSprite);
}