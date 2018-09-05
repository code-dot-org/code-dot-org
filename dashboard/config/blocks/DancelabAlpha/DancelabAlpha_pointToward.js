function pointToward(sprite, location) {
	var angle = Math.atan2(sprite.y - location.y, sprite.x - location.x) * (180 / Math.PI);
  sprite.direction = 180 + angle;
}