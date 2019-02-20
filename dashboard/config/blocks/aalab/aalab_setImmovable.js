function setImmovable(sprite, val) {
  if(sprite) {
    var setOne = function(sprite) {
      sprite.immovable = val === "true" ? false : true;
    };
    if(!Array.isArray(sprite)) {
      setOne(sprite);
    } else {
      sprite.forEach(function(s) { setOne(s);});
    }
  }
}