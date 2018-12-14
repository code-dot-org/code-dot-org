function groupRemoveBehaviorSimple(sprite, behavior) {
  if (sprite && behavior) {
    removeBehavior(sprite, behavior, behavior.name);
  }
}