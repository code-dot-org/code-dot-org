function showSpriteLabel(text, location, sprite) {
  if(sprite) {
    var l = function() {
      var loc = {x: sprite.position.x, y: sprite.position.y - (sprite.height / 2) * sprite.scale};
      if(location === "below") {
        loc.y = sprite.position.y + (sprite.height / 2) * sprite.scale;
      }
      return loc;
    };
    showCustomText(text, l, undefined, undefined, "0");
  }
}