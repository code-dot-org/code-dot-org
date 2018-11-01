function changeGroupPropBy(group, property, val) {
  if (group === undefined || val === undefined) {
    return;
  }
  for(var i = 0; i < group.length; i++) {
    var sprite = group[i];
    if(property == "scale") {
      sprite.setScale(sprite.getScale() + val / 100);
      if(sprite.scale < 0) {
        sprite.scale = 0;
      }
    } else if(property == "direction") {
      sprite.direction = getDirection(sprite) + val;
    } else if(property=="y") {
      sprite.y-=val;
    } else {
      sprite[property] += val;
    }
  }
}