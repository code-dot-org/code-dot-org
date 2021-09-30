function level4(){
  //This level requires zValidationHelperFunctions

  if (!validationProps.successCriteria) {
    validationProps.successCriteria = {
      clickedSprite: false
    };
  }
  if(!validationProps.clickedSprites){
    validationProps.clickedSprites=[];
  }

  // Helper variables
  var spriteIds = getSpriteIdsInUse();
  var eventLog = getEventLog();

  //check for unclicked sprites, and show hand with rings
  if(World.seconds >1){
    for(var i=0;i<spriteIds.length;i++){
      var foundClick=false;
      for(var j=0;j<eventLog.length;j++){
        if(eventLog[j].includes(i)){
          foundClick=true;
          if(validationProps.clickedSprites.indexOf(i)==-1){
            validationProps.clickedSprites.push(i);
          }
        }
      }
      if(!foundClick){
        drawRings(getProp({id: i}, "x"),400-getProp({id: i}, "y"));
        drawHand(getProp({id: i}, "x"),400-getProp({id: i}, "y"));
      }
    }
  }

  // Set success time if success
  if(validationProps.clickedSprites.length>=2 && !validationProps.successTime)
  {
    validationProps.successTime = World.frameCount;
  }

  // Delay fail time (so student can observe the wrong animation)
  var failTime = 300;

  // Check criteria and give failure feedback
  if (World.frameCount > failTime) {
    levelFailure(3, "clickAllSprites");
  }

  // Pass 5 seconds after success
  var waitTime = 150;
  if (World.frameCount - validationProps.successTime >= waitTime) {
    levelFailure(0, "genericSuccess");
  }

  push();
  stroke("white");
  if (!validationProps.successTime) {
    drawProgress("fail",World.frameCount,failTime);
  } else {
    drawProgress("pass",World.frameCount - validationProps.successTime,waitTime);
  }
  pop();
}