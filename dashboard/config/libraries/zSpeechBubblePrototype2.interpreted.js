function spriteSay(mySprite,speech){
  addBehaviorSimple(mySprite, speaking());
}

function speaking(mySprite){
  var speech="Hello, world!!!";
  if (!getProp(mySprite, "speechTimeout")) {
    setProp(mySprite, "speechTimeout", 100);
  } else {
    setProp(mySprite, "speechTimeout", getProp(mySprite, "speechTimeout")-1);
  }
  console.log(getProp(mySprite, "speechTimeout"));
  /*if (!getProp(mySprite, "speechTimeout")) {
    removeBehaviorSimple(mySprite, speaking());
  } else {
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
    console.log("x:"+rectX+"y:"+rectY);
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


    rect(rectX, rectY, boxWidth, boxHeight);

    noStroke();
    fill("white");
    text(speech,rectX+(boxWidth)/2,(rectY+2.5));
  }
  */
}
