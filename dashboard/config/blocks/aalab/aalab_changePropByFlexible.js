function changePropByFlexible(sprite, property, val) {
  if (sprite === undefined || val === undefined) {
    return;
  }
  if(!Array.isArray(sprite)) {
  	changePropBy(sprite, property, val);
  } else {
    sprite.forEach(function(s) {
      changePropBy(s, property, val);
    });
  }
}

function changePropBy(sprite,  property, val) {
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
  } else {
    sprite[property] += val;
  }
}