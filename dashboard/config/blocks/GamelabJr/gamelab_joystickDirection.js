function joystickDirection() {
  var x = 0, y = 0;
  if (keyDown("right")) {
    x += 1;
  }
  if (keyDown("left")) {
    x -= 1;
  }
  if (keyDown("up")) {
    y -= 1;
  }
  if (keyDown("down")) {
    y += 1;
  }
  if (x !== 0) {
    x *= Infinity;
  }
  if (y !== 0) {
    y *= Infinity;
  }
  if (x || y) {
  	return createVector(x, y);
  }
}