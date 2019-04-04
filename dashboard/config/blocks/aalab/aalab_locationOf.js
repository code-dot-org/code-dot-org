function locationOf(sprite) {
  if (!sprite) {
    return undefined;
  }
  if(!Array.isArray(sprite)) {
  	return {x: sprite.x, y: sprite.y};
  } else {
    randomSprite = sprite[Math.floor(Math.random() * sprite.length)];
  	return {x: randomSprite.x, y: randomSprite.y};
  }
}