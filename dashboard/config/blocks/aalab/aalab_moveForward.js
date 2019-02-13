function moveForward(sprite, distance) {
  var move = function(s) {
  	var direction = getDirection(s);
    s.x += distance * Math.cos(direction * Math.PI / 180);
    s.y += distance * Math.sin(direction * Math.PI / 180);
  };
  if(!Array.isArray(sprite)) {
  	move(sprite);
  } else {
  	sprite.forEach(function(s) { move(s); });
  }
}