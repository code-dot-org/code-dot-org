function addBehaviorUntilBoolean(sprite, behavior, condition) {
  if (sprite && behavior) {
    behavior.checkTerminate = condition;
    addBehavior(sprite, behavior, behavior.name);
  }
}