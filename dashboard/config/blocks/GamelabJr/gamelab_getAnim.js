function getAnim(sprite, costume) {
  if (!sprite) {
    return undefined;
  }
  if (costume=="costume") {
   	return sprite.getAnimationLabel();
  } else {
  	return sprite[property];
  }
}