function getProp(sprite, property) {
  if (!sprite) {
    return undefined;
  }
  if (property=="scale") {
    return sprite.scale*100;
  } else if (property=="costume") {
   	return sprite.getAnimationLabel();
  } else if (property=="direction") {
   	return getDirection(sprite);
  } else {
  	return sprite[property];
  }
}