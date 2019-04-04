function addBehaviorUntilBoolean(sprite, behavior, condition) {
  if (sprite && behavior) {
    behavior.checkTerminate = condition;
    if(!Array.isArray(sprite)) {
      addBehavior(sprite, behavior);
    } else {
      sprite.forEach(function(s) { addBehavior(s, behavior);});
    }
  }
}