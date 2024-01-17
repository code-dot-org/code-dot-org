function monitorButtonPresses () {
  var compassWidth = 70;
  var midpoint = compassWidth/2.8;
  var compassX = 50;
  var compassY = 50;
  var fontSize = 16;
  //make circle
  fill(rgb(200, 200, 200, 0.65));
  strokeWeight(3);
  stroke("gray");
  ellipse(compassX, compassY, compassWidth);
  //make NSEW black text
  textSize(fontSize);
  noStroke();
  fill("white");
  textAlign(CENTER, TOP);
  text("N", compassX, compassY - midpoint);
  textAlign(CENTER, BOTTOM);
  text("S", compassX, compassY + midpoint);
  textAlign(LEFT, CENTER);
  text("W", compassX - midpoint, compassY);
  textAlign(RIGHT, CENTER);
  text("E", compassX + midpoint, compassY);
  //highlight text to white when arrow pressed
  if (keyDown("up")) {
    fill("black");
    textStyle(BOLD);
    textAlign(CENTER, TOP);
    text("N", compassX, compassY - midpoint);
  }
  if (keyDown("down")) {
    fill("black");
    textStyle(BOLD);
    textAlign(CENTER, BOTTOM);
    text("S", compassX, compassY + midpoint);
  }
  if (keyDown("left")) {
    fill("black");
    textStyle(BOLD);
    textAlign(LEFT, CENTER);
    text("W", compassX - midpoint, compassY);
  }
  if (keyDown("right")) {
    fill("black");
    textStyle(BOLD);
    textAlign(RIGHT, CENTER);
    text("E", compassX + midpoint, compassY);
  }
}
other.push(monitorButtonPresses);