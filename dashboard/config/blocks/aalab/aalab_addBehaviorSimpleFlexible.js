function addBehaviorSimpleFlexible(sprite, behavior) {
  if(sprite && behavior) {
    if(sprite.length === undefined) {
      addBehavior(sprite, behavior, behavior.name);
    } else {
      for(var i = 0; i < sprite.length; i++) {
      	addBehavior(sprite[i], behavior, behavior.name);
      }
    }
  }
}