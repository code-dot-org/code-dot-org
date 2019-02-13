function setDirection(sprite, direction) {
  if(!Array.isArray(sprite)) {
  	sprite.direction = direction;
  } else {
    sprite.forEach(function(s) {
      s.direction = direction;
    });
  }
}