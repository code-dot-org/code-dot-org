function createNewSprite(name,costume,location) {
  if (!location) {
    location = {x: 200, y: 200};
  } else if(typeof location === "function") {
    location = location();
  }
  var newSprite = makeNewSprite(costume,location.x,location.y);
  newSprite.maxSpeed = 0;
  newSprite.name = name;
  return newSprite;
}