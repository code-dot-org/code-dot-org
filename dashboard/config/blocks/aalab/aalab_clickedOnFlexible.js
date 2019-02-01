function clickedOnFlexible(condition, sprite, event) {
  var typeOfClick = condition === "when" ? mouseIsOver : mousePressedOver;
  if(sprite.length === undefined) {
    touchEvents.push({type: typeOfClick, event: event, sprite: sprite});
  } else {
    for(var i = 0; i < sprite.length; i++) {
      touchEvents.push({type: typeOfClick, event: event, sprite: sprite[i]});
    }
  }
}