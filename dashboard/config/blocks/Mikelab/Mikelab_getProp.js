function getProp(sprite, property) {
  if (!sprite) {
    return undefined;
  }
  if (property=="scale") {
    return sprite.getScale() * 100;
  } else if (property=="costume") {
   	return sprite.getAnimationLabel();
  } else if (property=="direction") {
   	return getDirection(sprite);
  } else if (property=="y") {
   	return 400-sprite.y;
  } else {
  	return sprite[property];
  }
}