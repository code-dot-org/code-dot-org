function setSizes(sprite,property,val) {
  
  if (!sprite || val === undefined) {
    return;
  }
  if (property == "height") {
    sprite.height=(sprite.height*val/100);
  }
  else if (property == "width") {
   	sprite.width=(sprite.width*val/100);
  } else {
    sprite.scale=val/100;
  }
}