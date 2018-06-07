function mirrorSprite(sprite,direction) {
  if (direction == "right") {
	sprite.mirrorX(1); 
  } else {
	sprite.mirrorX(-1);
  }
}