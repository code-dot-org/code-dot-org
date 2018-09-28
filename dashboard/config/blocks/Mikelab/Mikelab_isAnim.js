function isAnim(sprite, costume) {
  if (!sprite) {
    return undefined;
  }
  else {
   	return sprite.getAnimationLabel() == costume;
  }
}