function makeNewGroupSprite(costume, group, name, location) {
  var sprite = makeNewDanceSprite(costume, name, location);
  group.add(sprite);
}