function spriteSay(sprite,speech){
  setProp(sprite, "speech", speech);
  setProp(sprite, "timeout", 120);

}

function spriteSayTime(sprite,speech,time){
  setProp(sprite, "speech", speech);
  setProp(sprite, "timeout", time*30);
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

    if(spriteTimeout){
      var widthOfText=textWidth(spriteSpeech);
      var textScaler=16;//font size
      textSize(textScaler);
      while(widthOfText>500){
        textScaler--;
        textSize(textScaler);
        widthOfText=textWidth(spriteSpeech);
      }
      var charCount=Math.sqrt(spriteSpeech.length*10);
      if(charCount < 20) {
        charCount=20;
      }


      spriteSpeech=wordWrap(getProp({id: spriteIds[i]}, "speech"),charCount);//16 characters per line
      var lines = spriteSpeech.split(/\r\n|\r|\n/); 
      setProp({id: spriteIds[i]}, "lineCount", lines.length);
      fill(rgb(50,50,50,0.5));
      stroke("gray");


      textAlign(CENTER, TOP);


      var minWidth=15;

      for(var j=0;j<lines.length;j++){
        if(minWidth<textWidth(lines[j])){
          minWidth=textWidth(lines[j]);
        }

      }


      var boxWidth=minWidth+5;
      var boxHeight=((textScaler)+3)*(getProp({id: spriteIds[i]}, "lineCount"))+5;

      var rectX=spriteX-boxWidth/2;
      var rectY=spriteY-(spriteScale/2)-boxHeight-5;

      if(rectX<0){
        rectX=0;
      }
      if(rectX+boxWidth>400){
        rectX=400-boxWidth;
      }
      if(rectX<0){
        rectX=200-boxWidth/2;
      }

      if(rectY<0){rectY=0;}
      if(rectY+boxHeight>400){
        rectY=400-boxHeight;
      }

      strokeWeight(2);
      var bubbleRad=4;
      fill("white");
      noStroke();
      rect(rectX, rectY+bubbleRad, boxWidth, boxHeight-bubbleRad*2);
      rect(rectX+bubbleRad,rectY,boxWidth-bubbleRad*2,boxHeight);
      stroke("gray");
      line(rectX,rectY+bubbleRad,rectX,rectY+boxHeight-bubbleRad);
      line(rectX+boxWidth,rectY+bubbleRad,rectX+boxWidth,rectY+boxHeight-bubbleRad);
      line(rectX+bubbleRad,rectY+boxHeight,rectX+boxWidth-bubbleRad,rectY+boxHeight);
      line(rectX+bubbleRad,rectY,rectX+boxWidth-bubbleRad,rectY);

      arc(rectX+bubbleRad, rectY+bubbleRad, bubbleRad*2, bubbleRad*2, 180, 270);
      arc(rectX+bubbleRad, rectY+boxHeight-bubbleRad, bubbleRad*2, bubbleRad*2, 90, 180);
      arc(rectX+boxWidth-bubbleRad, rectY+bubbleRad, bubbleRad*2, bubbleRad*2, 270, 0);
      arc(rectX+boxWidth-bubbleRad, rectY+boxHeight-bubbleRad, bubbleRad*2, bubbleRad*2, 0, 90);
      var tipX=(rectX+(boxWidth/2)+spriteX)/2;
      var tipY=((spriteY-spriteScale/4)+3*(rectY+boxHeight))/4;
      noStroke();
      shape(rectX+boxWidth*4/10,rectY+boxHeight-1,tipX,tipY,rectX+boxWidth/2,rectY+boxHeight-1);
      stroke("gray");

      line(rectX+boxWidth*4/10,rectY+boxHeight,tipX,tipY);
      line(tipX,tipY,rectX+boxWidth/2,rectY+boxHeight);
      noStroke();
      fill("black");

      text(spriteSpeech,rectX+(boxWidth)/2,rectY+2.5);
      changePropBy({id: spriteIds[i]}, "timeout", -1);
    }
  }

}

function wordWrap(str, maxWidth) {
  var newLineStr = "\n"; done = false; res = '';
  while (str.length > maxWidth) {
    found = false;
    // Inserts new line at first whitespace of the line
    for (i = maxWidth - 1; i >= 0; i--) {
      if(str.charAt(i)==" "){
        res = res + [str.slice(0, i), newLineStr].join('');
        str = str.slice(i + 1);
        found = true;
        break;
      }
    }
    // Inserts new line at maxWidth position, the word is too long to wrap
    if (!found) {
      res += [str.slice(0, maxWidth), newLineStr].join('');
      str = str.slice(maxWidth);
    }
  }
  return res + str;
}
other.push(speechBubbles);


