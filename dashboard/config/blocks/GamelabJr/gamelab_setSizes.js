function setSizes(sprite,property,val) {
  
  if (!sprite || val === undefined) {
    return;
  }
  if (property == "height") {
    sprite.height = sprite.animation.getHeight() * val / 100;
  }
  else if (property == "width") {
   	sprite.width = sprite.animation.getWidth() * val / 100;
  } else {
    sprite.setScale(sprite.getScale() * val / 100);
  }
}