function moveForward(sprite, distance) {
  var direction = getDirection(sprite);
  sprite.x += distance * Math.cos(direction * Math.PI / 180);
  sprite.y += distance * Math.sin(direction * Math.PI / 180);
}