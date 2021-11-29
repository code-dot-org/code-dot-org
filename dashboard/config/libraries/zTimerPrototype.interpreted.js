
function drawTimer(){
  if(World.frameCount>1){
    push();
    var timerX=375;
    var timerY=40;
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
    var angle=World.seconds%60*6;
    angle-=90;
    arc(timerX,timerY,18,18,270,angle+10);
    stroke("white");
    textAlign(RIGHT, CENTER);
    strokeWeight(5);
    textSize(20);
    text(World.seconds,timerX-20,timerY);
    pop();
  }
}


other.push(drawTimer);
