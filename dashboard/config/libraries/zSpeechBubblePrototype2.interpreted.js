function spriteSay(sprite,speech){
  setProp(sprite, "speech", speech);
  setProp(sprite, "timeout", 120);
  console.log("begin");
}


function speechBubbles(){
  //Declare helper variables
  var spriteIds = getSpriteIdsInUse();

  for (var i = 0; i < spriteIds.length; i++) {
    var spriteX=getProp({id: spriteIds[i]}, "x");
    var spriteY=400-getProp({id: spriteIds[i]}, "y");
    var spriteScale=getProp({id: spriteIds[i]}, "scale");
    var spriteSpeech=getProp({id: spriteIds[i]}, "speech");
    var spriteTimeout=getProp({id: spriteIds[i]}, "timeout");
    //console.log(getProp({id: spriteIds[i]}, "timeout"));
    //console.log(spriteTimeout);

    if(spriteTimeout){
      fill(rgb(50,50,50,0.5));
      stroke("gray");
      var textScaler=16;
      textAlign(CENTER, TOP);
      textSize(textScaler);

      var minWidth=0;

      if(minWidth<textWidth(spriteSpeech)){
        minWidth=textWidth(spriteSpeech);
      }

      var boxWidth=minWidth+5;
      var boxHeight=textScaler+5;
      var rectX=spriteX-boxWidth/2;
      var rectY=spriteY-(spriteScale*3/4);
      if(rectX<0){rectX=0;}
      if(rectX+boxWidth>400){rectX=400-boxWidth;}
      //console.log(rectX);
      if(rectY<0){rectY=0;}
      if(rectY+boxHeight>400){rectY=400-boxHeight;}
      
      rect(rectX, rectY, boxWidth, boxHeight,5);
      shape(rectX+(boxWidth/2)-2,rectY+boxHeight,rectX+(boxWidth/2),spriteY,rectX+(boxWidth/2)+2,rectY+boxHeight);

      noStroke();
      fill("white");

      text(spriteSpeech,rectX+(boxWidth)/2,rectY+2.5);
      changePropBy({id: spriteIds[i]}, "timeout", -1);
    }
  }

}

other.push(speechBubbles);


