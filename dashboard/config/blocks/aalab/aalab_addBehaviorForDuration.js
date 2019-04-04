function addBehaviorForDuration(sprite, behavior, seconds) {
  if (sprite && behavior) {
    behavior.timeStarted = new Date().getTime();
    if(seconds) {
      behavior.duration = seconds * 1000;
    } else {
      behavior.duration = 1000;
    }
    if(!Array.isArray(sprite)) {
      addBehavior(sprite, behavior);
    } else {
      sprite.forEach(function(s) {
        addBehavior(s, behavior);
      });
    }
  }
}