function moveInDirection2(sprite,distance,direction) {
  var vector = unitVectorTowards(sprite, direction);
  sprite.position.add(vector.mult(distance));
}