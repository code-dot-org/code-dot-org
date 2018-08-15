function moveInDirection(sprite,distance,direction) {
    if (direction== "North") {
      sprite.y-=distance;
    }
 	else if (direction== "East") {
      sprite.x+=distance;
 	}
    else if (direction=="South") {
      sprite.y+=distance;
    }
	else if (direction=="West") {
      sprite.x-=distance;
    }
    else {
      console.error("moveInDirection: invalid direction provided");
    }
}