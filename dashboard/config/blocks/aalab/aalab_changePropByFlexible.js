function changePropByFlexible(sprite, property, val) {
  if (sprite === undefined || val === undefined) {
    return;
  }
  if(!Array.isArray(sprite)) {
  	changePropBy(sprite, property, val);
  } else {
  	for(var i = 0; i < sprite.length; i++) {
      changePropBy(sprite[i], property, val);
    }
  }
}