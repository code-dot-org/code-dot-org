function moveToward(sprite,distance,target) {
  if (!sprite || distance === undefined || !target) {
    return;
  }
  if(typeof target === "function") {
  	target = target();
  }
  var move = function(s) {
    var dx = target.x - s.x;
  	var dy = target.y - s.y;
  	if (dx * dx + dy * dy > distance * distance) {
      var angleOfMovement=Math.atan2(dy, dx);
      dx = distance*Math.cos(angleOfMovement);
      dy = distance*Math.sin(angleOfMovement);
  	}
  	s.x += dx;
  	s.y += dy;
  };
  if(!Array.isArray(sprite)) {
    move(sprite);
  } else {
    sprite.forEach(function(s) { move(s);});
  }
}