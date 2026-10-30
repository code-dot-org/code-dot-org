function makeSpritesGridInput(animation, layout) {
  if(layout !== undefined && layout.constructor === Array) {
    makeEnvironmentSprites(animation, '', layout);
  }
}