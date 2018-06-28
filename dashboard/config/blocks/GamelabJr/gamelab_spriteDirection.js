function spriteDirection(direction){
  if (direction== "North") {
      return 360;
    }
 	else if (direction== "East") {
      return 90;
 	}
    else if (direction=="South") {
      return 180;
    }
	else if (direction=="West") {
      return 270;
    }
    else {
      console.error("pointInDirection: invalid direction provided");
    }
}