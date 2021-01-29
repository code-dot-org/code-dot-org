
function drawTimer(){
  push();
  var timerX=340;
  var timerY=50;
  noStroke();
  fill("white");
  ellipse(timerX,timerY,32,32);
  stroke("white");
  strokeWeight(7);
  line(timerX,timerY-22,timerX,timerY-10);
  stroke("black");
  strokeWeight(3);
  line(timerX,timerY-20,timerX,timerY-10);
  ellipse(timerX, timerY, 25, 25);
  fill("black");
  noStroke();
  arc(timerX,timerY,18,18,45,270);
  stroke("white");
  textAlign(CENTER, TOP);
  strokeWeight(5);
  textSize(20);
  text(World.seconds,timerX+30,timerY);
  pop();
}


other.push(drawTimer);
