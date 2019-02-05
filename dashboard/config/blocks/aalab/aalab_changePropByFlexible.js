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