//This is an experimental library by Mike that is intended to work with a separate scoreboard block.

// Setup sim
function setupScoreboard(
s1costume,s1score,s2costume,s2score,s3costume) {

  World.scoreboard={
    s1costume:s1costume,
    s2costume:s2costume,
    s3costume:s3costume,
    var1:s1score,
    var2:s2score
  };
}



function scoreboard(){
  if(World.scoreboard){

    if(!World.animations){
      World.animations = getAnimationsInUse();
    }
    if(!World.endTime){
      World.endTime=0;
    }

    if(!World.graphData){
      World.graphData={
        time:[World.frameCount],
        value1:[World.scoreboard.var1],
        value2:[World.scoreboard.var2],
        max:0,
        state:0
      };
    }

    if(mouseWentDown("left")){
      World.graphData.state++;
    }
    if(World.graphData.state==4){
      World.graphData.state=0;
    }

    var length=World.graphData.time.length;

    if(World.scoreboard.var1!=World.graphData.value1[length-1]||
       World.scoreboard.var2!=World.graphData.value2[length-1]){
      World.graphData.time.push(World.frameCount);
      World.graphData.value1.push(World.scoreboard.var1);
      World.graphData.value2.push(World.scoreboard.var2);
      if(World.scoreboard.var1>World.graphData.max){
        World.graphData.max=World.scoreboard.var1;
      }
      if(World.scoreboard.var2>World.graphData.max){
        World.graphData.max=World.scoreboard.var2;
      }
      World.graphData.range=World.frameCount;
    }
    //console.log(World.graphData);
    var scaler;

    //draw the table
    if(World.graphData.state==1){
      fill("rgba(0,0,0,0.5)");
      rect(125,50,150,275);
      push();
      textAlign(CENTER, CENTER);
      textSize(10);
      fill("white");
      var min=0;
      if(length>25){
        min=length-25;
      }
      text("frames",150,60);
      text("score1",200,60);
      text("score2",250,60);
      line(125,70,275,70);
      line(175,50,175,325);
      line(225,50,225,325);
      for(var j=min;j<length;j++){
        text(World.graphData.time[j],150,80+(j-min)*10);
        text(World.graphData.value1[j],200,80+(j-min)*10);
        text(World.graphData.value2[j],250,80+(j-min)*10);
      }
      pop();
    }
    //draw the graph
    if(World.graphData.state===2){
      fill("rgba(0,0,0,0.5)");
      rect(50,50,300,300);

      push();
      for(var i=0;i<length-1;i++){
        var x1=50+World.graphData.time[i]*300/World.graphData.range;
        var y1=350-World.graphData.value1[i]*300/World.graphData.max;
        var x2=50+World.graphData.time[i+1]*300/World.graphData.range;
        var y2=350-World.graphData.value1[i+1]*300/World.graphData.max;
        stroke("pink");
        strokeWeight(5);
        line(x1,y1,x2,y2);
        y1=350-World.graphData.value2[i]*300/World.graphData.max;
        y2=350-World.graphData.value2[i+1]*300/World.graphData.max;
        stroke("brown");
        line(x1,y1,x2,y2);
      }
      pop();
      var spriteSize=25;
      var s1sprite =createSprite(50+World.graphData.time[length-1]*300/World.graphData.range,
                                 350-World.graphData.value1[length-1]*300/World.graphData.max);
      s1sprite.setAnimation(World.scoreboard.s1costume);
      if(s1sprite.height>s1sprite.width){
        scaler=s1sprite.width/s1sprite.height;
        s1sprite.height=spriteSize;
        s1sprite.width=s1sprite.height*scaler;
      } else {
        scaler=s1sprite.height/s1sprite.width;
        s1sprite.width=spriteSize;
        s1sprite.height=s1sprite.width*scaler;
      }
      drawSprite(s1sprite);
      s1sprite.destroy();  
      var s2sprite =createSprite(50+World.graphData.time[length-1]*300/World.graphData.range,
                                 350-World.graphData.value2[length-1]*300/World.graphData.max);
      s2sprite.setAnimation(World.scoreboard.s2costume);
      if(s2sprite.height>s2sprite.width){
        scaler=s2sprite.width/s2sprite.height;
        s2sprite.height=spriteSize;
        s2sprite.width=s2sprite.height*scaler;
      } else {
        scaler=s2sprite.height/s2sprite.width;
        s2sprite.width=spriteSize;
        s2sprite.height=s2sprite.width*scaler;
      }
      drawSprite(s2sprite);
      s2sprite.destroy();  
    }

    if(World.graphData.state===0){
      //Draw the scoreboard
      push();

      var box1x=0;
      var box1y=350;
      var box2x=200;
      var box2y=350;
      var boxWidth=200;
      var boxHeight=50;



      fill("rgba(0,0,0,0.5)");
      rect(box1x,box1y,boxWidth,boxHeight);
      rect(box2x,box2y,boxWidth,boxHeight);
      var s1sprite2 = createSprite(box1x+(boxHeight/2), box1y+(boxHeight/2));
      s1sprite2.setAnimation(World.scoreboard.s1costume);
      if(s1sprite2.height>s1sprite2.width){
        scaler=s1sprite2.width/s1sprite2.height;
        s1sprite2.height=boxHeight*0.75;
        s1sprite2.width=s1sprite2.height*scaler;
      } else {
        scaler=s1sprite2.height/s1sprite2.width;
        s1sprite2.width=boxHeight*0.75;
        s1sprite2.height=s1sprite2.width*scaler;
      }
      drawSprite(s1sprite2);
      s1sprite2.destroy();
      var s2sprite2 = createSprite(box2x+(boxHeight/2), box2y+(boxHeight/2));
      s2sprite2.setAnimation(World.scoreboard.s2costume);
      if(s2sprite2.height>s2sprite2.width){
        scaler=s2sprite2.width/s2sprite2.height;
        s2sprite2.height=boxHeight*0.75;
        s2sprite2.width=s2sprite2.height*scaler;
      } else {
        scaler=s2sprite2.height/s2sprite2.width;
        s2sprite2.width=boxHeight*0.75;
        s2sprite2.height=s2sprite2.width*scaler;
      }
      drawSprite(s2sprite2);
      s2sprite2.destroy();
      var s3sprite = createSprite(box1x+(boxHeight*5/4), box1y+(boxHeight/2));
      s3sprite.setAnimation(World.scoreboard.s3costume);
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
      s3sprite2.setAnimation(World.scoreboard.s3costume);
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
      text(World.scoreboard.var1,box1x+(boxHeight*3/2), box1y+(boxHeight/2));
      text(World.scoreboard.var2,box2x+(boxHeight*3/2), box2y+(boxHeight/2));
      pop();
    }
  }

  /*draw the timer
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
  */

}


other.push(scoreboard);