function spriteDebugPanels(){
  if(World.frameCount>1){
  var list=World.allSprites;
  var spriteIds = getSpriteIdsInUse();
  for(var i=0;i<list.length;i++){
    var mySprite = list[i];
    //To only show for sprites with behaviors, add this -> &&getBehaviorsForSpriteId(spriteIds[i]).length>0
    mySprite.debug=false;
    if((mouseIsOver(mySprite)||list.length==1)){
      //rectMode(CENTER);
      mySprite.debug=true;
      fill(rgb(50,50,50,0.5));
      stroke("gray");
      var textScaler=16;
	    textAlign(CENTER, TOP);
	    textSize(textScaler);
      
      var behaviorList=getBehaviorsForSpriteId(spriteIds[i]);
      if(behaviorList.length===0){
        behaviorList.push("-none-");
      }
	  behaviorList.unshift("Behaviors on this sprite:");
      var minWidth=0;
      for(var j=0;j<behaviorList.length;j++){
        if(minWidth<textWidth(behaviorList[j])){
          minWidth=textWidth(behaviorList[j]);
        }
      }
      var boxWidth=minWidth+5;
      var boxHeight=textScaler*(behaviorList.length)+5;
      var rectX=mySprite.x-boxWidth/2;
      var rectY=mySprite.y;
      if(rectX<0){rectX=0;}
      if(rectX+boxWidth>400){rectX=400-boxWidth;}
      //console.log(rectX);
      if(rectY<0){rectY=0;}
      if(rectY+boxHeight>400){rectY=400-boxHeight;}
      if(list.length==1){rectY=0;rectX=200-boxWidth/2;}
      rect(rectX, rectY, boxWidth, boxHeight);

	    noStroke();
	    fill("white");
 
	    for(var k=0;k<behaviorList.length;k++){
        text(behaviorList[k],rectX+(boxWidth)/2,rectY+k*textScaler+2.5);
	    }
    }
    }
  }
}

other.push(spriteDebugPanels);
