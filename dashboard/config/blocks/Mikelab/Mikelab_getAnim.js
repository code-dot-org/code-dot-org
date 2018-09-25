function getAnim(sprite) {
  if (!sprite) {
    return undefined;
  }
  else {
   	return sprite.getAnimationLabel();
  }
}