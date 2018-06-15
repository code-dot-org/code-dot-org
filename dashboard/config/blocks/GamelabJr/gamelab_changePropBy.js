function changePropBy(sprite,  property, val) {
  if (!sprite || val === undefined) {
    return;
  }
  if (property == "scale") {
    sprite.scale += val/100;
    if (sprite.scale < 0) {
      sprite.scale = 0;
    }
  }
  else if (property=="direction") {
   	sprite.direction = getDirection(sprite) + val;
  } else {
  sprite[property] += val;
  }
}