function addBehaviorUntilBoolean(sprite, behavior, condition) {
  console.log(aalab);
  if (sprite && behavior) {
    behavior.terminus = condition;
    addBehavior(sprite, behavior, behavior.name);
  }
}