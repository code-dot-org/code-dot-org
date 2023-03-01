function monitorButtonPresses () {
  var boxWidth = 100;
  var boxHeight = 50;
  var boxX = 400 - boxWidth;
  var boxY = 0;
  var boxXMid = boxX + (boxWidth / 2);
  var boxYMid = boxY + boxHeight / 2;
  var fontSize = 16;
  noStroke();
  fill(rgb(50, 50, 50, 0.5));
  rect(boxX, boxY, boxWidth, boxHeight);
  fill("white");
  textSize(fontSize);
  if (keyDown("up")) {
    textAlign(CENTER, TOP);
    text("NORTH", boxXMid, boxY);
  }
  if (keyDown("down")) {
    textAlign(CENTER, BOTTOM);
    text("SOUTH", boxXMid, boxY + boxHeight);
  }
  if (keyDown("left")) {
    textAlign(LEFT, CENTER);
    text("WEST", boxX, boxYMid);
  }
  if (keyDown("right")) {
    textAlign(RIGHT, CENTER);
    text("EAST", boxX + boxWidth, boxYMid);
  }
}
other.push(monitorButtonPresses);