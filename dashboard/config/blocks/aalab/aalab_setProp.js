function setProp(sprite,  property, val) {
  if (!sprite || val === undefined) {
    return;
  }
  var setOneProp = function(sprite) {
    if (property == "scale") {
      sprite.setScale(val / 100);
    }
    else if (property=="costume") {
      sprite.setAnimation(val);
    } else if (property=="tint" && typeof(val)=="number") {
      sprite.tint = "hsb(" + (Math.round(val) % 360) + ", 100%, 100%)";
    } else if (property=="y" && typeof(val)=="number") {
      sprite.y = 400-val;
    } else {
    sprite[property]=val;
    }
  };
  if(!Array.isArray(sprite)) {
  	setOneProp(sprite);
  } else {
  	sprite.forEach(function(s) { setOneProp(s);});
  }
}