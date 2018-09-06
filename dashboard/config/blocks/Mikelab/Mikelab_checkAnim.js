function checkAnim(sprite, costume) {
  if (!sprite) {
    return undefined;
  }
  //if (costume=="costume") {
   	return sprite.getAnimationLabel() == costume;
  //} else {
  //	return sprite[property];
  //}
}