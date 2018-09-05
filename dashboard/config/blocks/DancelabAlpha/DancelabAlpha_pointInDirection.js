function pointInDirection(sprite,direction) {
    if (direction== "North") {
      sprite.rotation = 360;
    }
 	else if (direction== "East") {
      sprite.rotation = 90;
 	}
    else if (direction=="South") {
      sprite.rotation = 180;
    }
	else if (direction=="West") {
      sprite.rotation = 270;
    }
    else {
      console.error("pointInDirection: invalid direction provided");
    }
}