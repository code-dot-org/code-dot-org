function changePropByFlexible(sprite, property, val) {
  if (sprite === undefined || val === undefined) {
    return;
  }
  if(sprite.length === undefined) {
  	changePropBy(sprite, property, val);
  } else {
  	for(var i = 0; i < sprite.length; i++) {
      changePropBy(sprite[i], property, val);
    }
  }
}