function setCollidable(sprite, val) {
  if(sprite) {
    var setOne = function(sprite) {
      sprite.collidable = val === "true" ? true : false;
    };
    if(!Array.isArray(sprite)) {
      setOne(sprite);
    } else {
      sprite.forEach(function(s) { setOne(s);});
    }
  }
}