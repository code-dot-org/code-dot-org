
function draggable() {
  var behavior = function(sprite) {
    if (mousePressedOver(sprite) && !sprite.dragging) {
      sprite.dragging = true;
      sprite.xOffset = sprite.x - World.mouseX;
      sprite.yOffset = sprite.y - World.mouseY;
    }
    if (sprite.dragging) {
      sprite.x = World.mouseX + sprite.xOffset;
      sprite.y = World.mouseY + sprite.yOffset;
    }
    if (mouseWentUp()) {
      sprite.dragging = false;
    }
  };
  behavior.name='draggable';
  return behavior;
}