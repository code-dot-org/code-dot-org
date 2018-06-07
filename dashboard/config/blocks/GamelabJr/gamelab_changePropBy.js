function changePropBy(sprite,  property, val) {
  if (property == "scale") {
    sprite.scale += val/100;
  }
  else if (property=="direction") {
   	sprite.direction = getDirection(sprite) + val;
  } else {
  sprite[property] += val;
  }
}