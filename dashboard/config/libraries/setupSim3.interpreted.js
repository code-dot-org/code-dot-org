//This is an experimental library by Mike that is intended to work with a full blockly version of the sim.

// Setup sim
function setupSim() {
  if(!World.animations){
    World.animations = getAnimationsInUse();
  }
  if(!score1){score1=0;}
  if(!score2){score2=0;}
  World.sprite1score = score1;
  World.sprite2score = score2;//getProp(({costume: World.animations[1]}), "score")


  if(!World.endTime){
      World.endTime=0;
  }

    //Draw the scoreboard
    push();
    var box1x=0;
    var box1y=350;
    var box2x=200;
    var box2y=350;
    var boxWidth=200;
    var boxHeight=50;
    var scaler;
    fill("rgba(0,0,0,0.5)");
    rect(box1x,box1y,boxWidth,boxHeight);
    rect(box2x,box2y,boxWidth,boxHeight);
    var s1sprite = createSprite(box1x+(boxHeight/2), box1y+(boxHeight/2));
    s1sprite.setAnimation(World.animations[0]);
    if(s1sprite.height>s1sprite.width){
      scaler=s1sprite.width/s1sprite.height;
      s1sprite.height=boxHeight*0.75;
      s1sprite.width=s1sprite.height*scaler;
    } else {
      scaler=s1sprite.height/s1sprite.width;
      s1sprite.width=boxHeight*0.75;
      s1sprite.height=s1sprite.width*scaler;
    }
    drawSprite(s1sprite);
    s1sprite.destroy();
    var s2sprite = createSprite(box2x+(boxHeight/2), box2y+(boxHeight/2));
    s2sprite.setAnimation(World.animations[1]);
    if(s2sprite.height>s2sprite.width){
      scaler=s2sprite.width/s2sprite.height;
      s2sprite.height=boxHeight*0.75;
      s2sprite.width=s2sprite.height*scaler;
    } else {
      scaler=s2sprite.height/s2sprite.width;
      s2sprite.width=boxHeight*0.75;
      s2sprite.height=s2sprite.width*scaler;
    }
    drawSprite(s2sprite);
    s2sprite.destroy();
    var s3sprite = createSprite(box1x+(boxHeight*5/4), box1y+(boxHeight/2));
    s3sprite.setAnimation(World.animations[2]);
    if(s3sprite.height>s3sprite.width){
      scaler=s3sprite.width/s3sprite.height;
      s3sprite.height=boxHeight*0.375;
      s3sprite.width=s3sprite.height*scaler;
    } else {
      scaler=s3sprite.height/s3sprite.width;
      s3sprite.width=boxHeight*0.375;
      s3sprite.height=s3sprite.width*scaler;
    }
    drawSprite(s3sprite);
    s3sprite.destroy();
    var s3sprite2 = createSprite(box2x+(boxHeight*5/4), box2y+(boxHeight/2));
    s3sprite2.setAnimation(World.animations[2]);
    if(s3sprite2.height>s3sprite2.width){
      scaler=s3sprite2.width/s3sprite2.height;
      s3sprite2.height=boxHeight*0.375;
      s3sprite2.width=s3sprite2.height*scaler;
    } else {
      scaler=s3sprite2.height/s3sprite2.width;
      s3sprite2.width=boxHeight*0.375;
      s3sprite2.height=s3sprite2.width*scaler;
    }
    drawSprite(s3sprite2);
    s3sprite2.destroy();
    stroke("white");
    fill("white");
    textAlign(LEFT, CENTER);
    textSize(boxHeight/2);
    text(World.sprite1score,box1x+(boxHeight*3/2), box1y+(boxHeight/2));
    text(World.sprite2score,box2x+(boxHeight*3/2), box2y+(boxHeight/2));
    pop();





    //draw the timer
    var timerTime=0;
    if(World.endTime){
      timerTime=World.endTime;
    }else{
      timerTime=World.seconds;
    }
    push();
    var timerX=375;
    var timerY=40;
    noStroke();
    fill("white");
    if(World.endTime){fill("rgba(0,0,0,0.2)");}
    ellipse(timerX,timerY,32,32);
    stroke("white");
    if(World.endTime){stroke("rgba(0,0,0,0.2)");}
    strokeWeight(7);
    line(timerX,timerY-22,timerX,timerY-10);
     stroke("black");
    strokeWeight(3);
    line(timerX,timerY-20,timerX,timerY-10);
    ellipse(timerX, timerY, 25, 25);
    fill("black");
    noStroke();
    var angle=timerTime%60*6;
    angle-=90;
    arc(timerX,timerY,18,18,270,angle+10);
    stroke("white");
    textAlign(RIGHT, CENTER);
    strokeWeight(1);
    textSize(25);
    text(timerTime,timerX-20,timerY);
    pop();
    
}

other.push(setupSim);