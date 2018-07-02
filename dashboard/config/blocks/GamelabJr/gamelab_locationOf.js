function locationOf(sprite) {
  if (!sprite) {
    return undefined;
  }
  return {
    x:sprite.x,
    y:sprite.y,
  };
}