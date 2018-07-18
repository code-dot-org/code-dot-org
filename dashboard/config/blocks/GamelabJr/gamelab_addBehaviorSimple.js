function addBehaviorSimple(sprite, behavior) {
  if (sprite && behavior) {
    addBehavior(sprite, behavior, behavior.name);
  }
}