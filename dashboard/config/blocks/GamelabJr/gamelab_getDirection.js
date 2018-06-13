function getDirection(sprite) {
  if (!sprite.hasOwnProperty("direction")) {
 	sprite.direction = 0;
  }
  return sprite.direction % 360;
}