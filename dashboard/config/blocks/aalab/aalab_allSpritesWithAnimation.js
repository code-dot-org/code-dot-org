function allSpritesWithAnimation(animationName) {
  if(animationGroups.hasOwnProperty(animationName)) {
    return animationGroups[animationName];
  }
  return [];
}