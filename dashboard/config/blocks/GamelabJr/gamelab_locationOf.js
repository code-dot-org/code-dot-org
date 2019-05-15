function locationOf(sprite) {
  if (!sprite) {
    return undefined;
  }
  return {
    x:getProp(sprite, "x"),
    y:400 - getProp(sprite, "y"),
  };
}