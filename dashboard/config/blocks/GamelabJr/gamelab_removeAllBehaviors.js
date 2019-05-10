function removeAllBehaviors(sprite) {
  if(sprite) {
    if(sprite.isGroup) {
  	  sprite.forEach(function(s) {
        s.behaviors = [];
      });
    }
  } else {
  	sprite.behaviors = [];
  }
}