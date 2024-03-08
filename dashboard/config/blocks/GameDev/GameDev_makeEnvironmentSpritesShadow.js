function makeEnvironmentSpritesShadow(animation, group, layout) {
  if(layout !== undefined && layout.constructor === Array) {
    makeEnvironmentSprites(animation, group, layout);
  }
}