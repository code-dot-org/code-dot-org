function groupChangePropBy(sprite,  property, val) {
  if (!sprite || val === undefined) {
    return;
  }
  if (property == "scale") {
    sprite.setScale(sprite.getScale() + val / 100);
    if (sprite.scale < 0) {
      sprite.scale = 0;
    }
  }
  else if (property=="direction") {
   	sprite.direction = getDirection(sprite) + val;
  } else if (property=="y"){
    sprite.y-=val;
  }else {
  sprite[property] += val;
  }
}