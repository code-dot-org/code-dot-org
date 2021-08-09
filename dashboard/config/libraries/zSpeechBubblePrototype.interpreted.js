function spriteSay(mySprite,speech){

  fill(rgb(50,50,50,0.5));
  stroke("gray");
  var textScaler=16;
  textAlign(CENTER, TOP);
  textSize(textScaler);

  var minWidth=textWidth(speech);

  var boxWidth=minWidth+5;
  var boxHeight=textScaler+5;

  var rectX=getProp(mySprite, "x")-boxWidth/2;

  var rectY=400-getProp(mySprite, "y");

  if(rectX<0){
    rectX=0;
  }
  if(rectX+boxWidth>400){
    rectX=400-boxWidth;
  }

  if(rectY<0){
    rectY=0;
  }
  if(rectY+boxHeight>400){
    rectY=400-boxHeight;
  }

  //rectY=0;rectX=200-boxWidth/2;
  rect(rectX, rectY, boxWidth, boxHeight);

  noStroke();
  fill("white");
  text(speech,rectX+(boxWidth)/2,(rectY+2.5));
}

//other.push(spriteSay);