function addBehaviorSimpleFlexible(sprite, behavior) {
  if(sprite && behavior) {
    if(!Array.isArray(sprite)) {
      addBehavior(sprite, behavior);
    } else {
      sprite.forEach(function(s) {
        addBehavior(s, behavior);
      });
    }
  }
}