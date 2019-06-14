function moveInDirection(sprite,distance,direction) {
  var move = function(s) {
    console.log(direction);
    switch(direction) {
      case "North":
        s.position.y -= distance;
      	break;
      case "East":
        s.position.x += distance;
      	break;
      case "South":
        s.position.y += distance;
      	break;
      case "West":
        s.position.x -= distance;
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