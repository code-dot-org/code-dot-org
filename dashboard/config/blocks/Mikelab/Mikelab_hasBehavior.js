function hasBehavior(sprite, behavior) {
  var index = findBehavior(
    sprite,
    normalizeBehavior(behavior)
  );
  if (index === -1) {
    return false;
  } else {
    return true;
  }
}