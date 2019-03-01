function showSpriteLabel(text, location, sprite) {
  if(sprite) {
    var l = function(sprite) {
      return function() {
      var loc = {x: sprite.position.x, y: sprite.position.y - sprite.animation.getHeight() * sprite.scale / 2 - (textLeading() / 2)};
      if(location === "below") {
        loc.y = sprite.position.y + sprite.animation.getHeight() * sprite.scale / 2 + textLeading();
      }
      return loc;
      };
    };
    if(!Array.isArray(sprite)) {
      showCustomText(text, l(sprite), undefined, undefined, "0");
    } else {
      sprite.forEach(function(s) {
      	showCustomText(text, l(s), undefined, undefined, "0");
      });
    }
  }
}