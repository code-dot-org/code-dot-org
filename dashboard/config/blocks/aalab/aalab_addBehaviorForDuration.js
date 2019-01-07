function addBehaviorForDuration(sprite, behavior, seconds) {
  if (sprite && behavior) {
    behavior.timeStarted = new Date().getTime();
    if(seconds) {
      behavior.duration = seconds * 1000;
    }
    addBehavior(sprite, behavior, behavior.name);
  }
}