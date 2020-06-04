var title = "";
var col = "black";
function draw2() {
  console.log(World.frameCount);
  fill(col);
  textAlign(CENTER, CENTER);
  textSize(50);
  text(title, 0, 0, 400, 200);
}

function moveBackward(sprite, distance) {
  moveForward(sprite, -1 * distance);
}

function updateTitleWithColor(t, c) {
  title = t;
  col = c;
}

other.push(draw2);