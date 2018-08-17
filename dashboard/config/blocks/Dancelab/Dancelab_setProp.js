function setProp(sprite,  property, val) {
  if (!sprite || val === undefined) {
    return;
  }
  if (property == "scale") {
    sprite.scale=val/100;
  }
  else if (property=="costume") {
   	sprite.setAnimation(val);
  } else if (property=="tint" && typeof(val)=="number") {
    console.log("setting tint " + val);
    sprite.tint = color("hsl(" + (val % 360) + ", 100%, 100%)");
  } else {
  	sprite[property]=val;
  }
}