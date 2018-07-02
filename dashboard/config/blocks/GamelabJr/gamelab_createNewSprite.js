function createNewSprite(name,costume,location) {
  if (!location) {
    location = {x: 200, y: 200};
  }
  return makeNewSprite(costume,location.x,location.y);
}