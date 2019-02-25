function showSpriteLabel(text, location, sprite) {
  if(sprite) {
    var l = function() {
      var loc = {x: sprite.position.x, y: sprite.position.y - sprite.animation.getHeight() * sprite.scale / 2 - (textLeading() / 2)};
      if(location === "below") {
        loc.y = sprite.position.y + sprite.animation.getHeight() * sprite.scale / 2 + textLeading();
      }
      return loc;
    };
    showCustomText(text, l, undefined, undefined, "0");
  }
}