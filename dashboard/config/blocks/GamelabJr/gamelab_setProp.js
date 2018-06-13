function setProp(sprite,  property, val) {
  if (!sprite || val === undefined) {
    return;
  }
  if (property == "scale") {
    sprite.scale=val/100;
  }
  else if (property=="costume") {
   	sprite.setAnimation(val);
  } else {
  sprite[property]=val;
  }
}