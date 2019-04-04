function moveInDirection(sprite,distance,direction) {
  var move = function(s) {
    switch(direction) {
      case "North":
        s.y -= distance;
      	break;
      case "East":
        s.x += distance;
      	break;
      case "South":
        s.y += distance;
      	break;
      case "West":
        s.x -= distance;
      	break;
      default:
      	console.error("moveInDirection: invalid direction provided");
  	}
  };
  if(!Array.isArray(sprite)) {
  	move(sprite);
  } else {
  	sprite.forEach(function(s) { move(s);});
  }
}