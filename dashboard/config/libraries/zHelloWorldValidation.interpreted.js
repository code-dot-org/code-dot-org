function level1(){
  //This level requires zValidationHelperFunctions
  var spriteIds = getSpriteIdsInUse();

  if (!validationProps.successCriteria) {
    setSuccessCriteria({
      starterSprite: checkOneSprite(spriteIds),
      usedSpeech: checkActiveSpeech(spriteIds),
    });
  }

  setSuccessTime();

  if (!validationProps.successCriteria.starterSprite ||
    !validationProps.successCriteria.usedSpeech) {
    drawProgressBar("earlyFail");
  } else {
    drawProgressBar("pass");
  }

  if (World.frameCount > EARLY_FAIL_TIME) {
    if (!validationProps.successCriteria.starterSprite) {
      levelFailure(3, "noSprites");
    } else if (!validationProps.successCriteria.usedSpeech) {
      levelFailure(3, "sayBlock");
    }
  }

  if (World.frameCount - validationProps.successTime >= WAIT_TIME) {
    levelFailure(0, "genericSuccess");
  }

}


function level2(){
  //This level requires zValidationHelperFunctions
  var spriteIds = getSpriteIdsInUse();

  if (!validationProps.successCriteria) {
    setSuccessCriteria({
      twoSprites: checkTwoSprites(spriteIds),
      differentLocations: checkSpriteLocations(spriteIds),
      differentCostumes: checkSpriteCostumes(spriteIds),
      changedBackground: checkBackgroundChanged()
    });
  }

  setSuccessTime();

  if (!validationProps.successCriteria.twoSprites ||
    !validationProps.successCriteria.differentLocations ||
    !validationProps.successCriteria.differentCostumes) {
    drawProgressBar("earlyFail");
  } else {
    drawProgressBar("pass");
  }

  if (World.frameCount > EARLY_FAIL_TIME) {
    if (!validationProps.successCriteria.twoSprites) {
      levelFailure(3, "createAtLeastTwoSprites");
    } else if (!validationProps.successCriteria.differentLocations) {
      levelFailure(3, "moveSpriteLocation");
    } else if (!validationProps.successCriteria.differentCostumes) {
      levelFailure(3, "spritesNeedUniqueCostumes");
    }
  }

  if (World.frameCount - validationProps.successTime >= WAIT_TIME) {
    if (validationProps.successCriteria.changedBackground) {
      levelFailure(0, "genericBonusSuccess");
    } else {
      levelFailure(0, "genericExplore");
    }
  }

}


function level3(){
  //This level requires zValidationHelperFunctions
  var spriteIds = getSpriteIdsInUse();
  var numSpritesWithSayBlocks = 0;

  if (!validationProps.successCriteria) {
  	setSuccessCriteria({
      twoSprites: checkTwoSprites(spriteIds),
      differentLocations: checkSpriteLocations(spriteIds),
      differentCostumes: checkSpriteCostumes(spriteIds),
      allSpritesSpeaking: checkAllSpritesSay(spriteIds)
    });
  }

  // Check sprites speaking
  for (var spriteId in spriteIds) {
    if(getProp({ id: spriteId }, "speech")){
      numSpritesWithSayBlocks = numSpritesWithSayBlocks + 1;
    }
  }
  validationProps.successCriteria.allSpritesSpeaking = numSpritesWithSayBlocks == spriteIds.length;

  setSuccessTime();

  if (!validationProps.successCriteria.twoSprites ||
    !validationProps.successCriteria.differentLocations ||
    !validationProps.successCriteria.differentCostumes) {
    drawProgressBar("earlyFail");
  } else if (!validationProps.successCriteria.allSpritesSpeaking) {
    drawProgressBar("fail");
  } else {
    drawProgressBar("pass");
  }

  if (World.frameCount > EARLY_FAIL_TIME) {
    if (!validationProps.successCriteria.twoSprites) {
      levelFailure(3, "createAtLeastTwoSprites");
    } else if (!validationProps.successCriteria.differentLocations) {
      levelFailure(3, "moveSpriteLocation");
    } else if (!validationProps.successCriteria.differentCostumes) {
      levelFailure(3, "spritesNeedUniqueCostumes");
    }
  }

  if (World.frameCount > WAIT_TIME) {
    if (!validationProps.successCriteria.allSpritesSpeaking) {
      if (numSpritesWithSayBlocks == 0) {
        levelFailure(3, "sayBlock");
      } else {
        levelFailure(3, "allSayBlocks");
      }
    }
  }

  if (World.frameCount - validationProps.successTime >= WAIT_TIME) {
    levelFailure(0, "genericSuccess");
  }

}


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


function level5(){
  //This level requires zValidationHelperFunctions
  if (!validationProps.successCriteria) {
    validationProps.successCriteria = {
      starterSprite: false,
      differentLocations: false,
      differentCostumes: false,
      noSpritesTouching: true,
      clickedSprite: false,
      spriteClickCausesSpeech: false
    };
  }

  if (!validationProps.previous) {
    validationProps.previous = {
      delay : 0
    };
  }

  // Helper variables
  var spriteIds = getSpriteIdsInUse();
  var eventLog = getEventLog();

  if (!validationProps.numSpritesSpoken) {
    validationProps.numSpritesSpoken = 0;
  }

  // Check for at least 1 sprite
  validationProps.successCriteria.starterSprite = spriteIds.length>=1;

  if (World.frameCount == 1) {

    // Check sprite locations
    var uniqueStartingSpriteLocations = [];
    for (var i=0; i<spriteIds.length; i++) {
      var coords = [getProp({id: spriteIds[i]}, "x"), getProp({id: spriteIds[i]}, "y")];
      var noDuplicateCoords = true;
      for (var j=0; j<uniqueStartingSpriteLocations.length; j++) {
        if ((coords[0] == uniqueStartingSpriteLocations[j][0]) &&
            (coords[1] == uniqueStartingSpriteLocations[j][1])){
          noDuplicateCoords = false;
          break;
        }
      }
      if (!noDuplicateCoords) {
        break;
      } else {
        uniqueStartingSpriteLocations.push(coords);
      }
    }
    if (spriteIds.length == uniqueStartingSpriteLocations.length) {
      validationProps.successCriteria.differentLocations = true;
    }

    // Check sprite costumes
    var uniqueStartingSpriteCostumes = [];
    for (var k=0; k<spriteIds.length; k++) {
      var costume = getProp({id: spriteIds[k]}, "costume");
      var noDuplicateCostumes = true;
      for (var l=0; l<uniqueStartingSpriteCostumes.length; l++) {
        if (costume == uniqueStartingSpriteCostumes[l]) {
          noDuplicateCostumes = false;
          break;
        }
      }
      if (!noDuplicateCostumes) {
        break;
      } else {
        uniqueStartingSpriteCostumes.push(costume);
      }
    }
    if (spriteIds.length == uniqueStartingSpriteCostumes.length) {
      validationProps.successCriteria.differentCostumes = true;
    }

    // Check that no sprites are touching
    if (World.frameCount == 1) {
      for (var m=0; m<spriteIds.length; m++) {
        for (var n=m+1; n<spriteIds.length; n++) {
          if (isTouchingSprite({id: spriteIds[m]}, {id: spriteIds[n]})) {
            setProp({id: spriteIds[m]}, "debug", true);
            setProp({id: spriteIds[n]}, "debug", true);
            validationProps.successCriteria.noSpritesTouching = false;
            break;
          }
        }
        if (!validationProps.successCriteria.noSpritesTouching) {
          break;
        }
      }
    }

  }


  // Check if new event happened
  if (eventLog.length > validationProps.previous.eventLogLength) {
    var currentEvent = eventLog[eventLog.length - 1];
    var clickedSpriteId = parseInt(currentEvent.split(" ")[1]);
    if (currentEvent.includes("whenClick: ") || currentEvent.includes("whileClick: ")) {
      if (!validationProps.previous.clickedSprite ||
          validationProps.previous.clickedSprite != clickedSpriteId) {
        // current event is a click
        validationProps.successCriteria.clickedSprite = true;
        for (var spriteId in spriteIds) {
          if (getProp({id: spriteId}, "speech") && getProp({id: spriteId}, "timeout")==120) {
            // new sprite caused speech in some sprite
            validationProps.numSpritesSpoken++;
            validationProps.previous.delay = World.frameCount;
            /*
            if ((World.frameCount-(validationProps.previous.delay+50)) < 0) {
              validationProps.previous.delay = World.frameCount;
            } else {
              validationProps.previous.delay += 50;
            }
            */
            break;
          }
        }
      }
      validationProps.previous.clickedSprite = clickedSpriteId;
    }
  }

  // Store previous event log length
  validationProps.previous.eventLogLength = eventLog.length;

  // Set success time if success
  if (validationProps.successCriteria.starterSprite &&
      validationProps.successCriteria.noSpritesTouching &&
      validationProps.successCriteria.differentLocations &&
      validationProps.successCriteria.differentCostumes &&
      validationProps.successCriteria.clickedSprite && 
      validationProps.numSpritesSpoken>=1 &&
     !validationProps.successTime)
  {
    validationProps.successTime = World.frameCount;
  }

  // Delay fail time (so student can observe the wrong animation)
  var earlyFailTime = 10;
  var failTime = 150;

  // Check criteria and give failure feedback
  if (World.frameCount > earlyFailTime) {
    if (!validationProps.successCriteria.starterSprite) {
      levelFailure(3, "noSprites");
    } else if (!validationProps.successCriteria.differentLocations) {
      levelFailure(3, "moveSpriteLocation");
    } else if (!validationProps.successCriteria.differentCostumes) {
      levelFailure(3, "spritesNeedUniqueCostumes");
    }
  }

  if (World.frameCount-validationProps.previous.delay > failTime) {
    if (!validationProps.successCriteria.noSpritesTouching) {
      levelFailure(3, "startingSpritesShouldNotTouch");
    } else if (!validationProps.successCriteria.clickedSprite) {
      // fail
      levelFailure(3, "singleSpriteNotClicked");
    } else if (validationProps.numSpritesSpoken >= 2) {
      // bonus pass
      levelFailure(0, "genericBonusSuccess");
    } else if (validationProps.numSpritesSpoken >= 1) {
      // pass
      levelFailure(0, "genericSuccess");
    } else {
      // fail
      levelFailure(3, "clickButNoSay");
    }
  }

  /*
  // Pass 5 seconds after success
  var waitTime = 150;
  if (World.frameCount - validationProps.successTime >= waitTime) {
    levelFailure(0, "genericSuccess");
  }
  */

  push();
  stroke("white");
  if (!validationProps.successCriteria.starterSprite ||
      !validationProps.successCriteria.differentLocations ||
      !validationProps.successCriteria.differentCostumes) {
    fill(rgb(118,102,160));
    rect(0,390,(World.frameCount*400/earlyFailTime),10);
  } else if (!validationProps.successCriteria.noSpritesTouching ||
      !validationProps.successCriteria.clickedSprite ||
      (validationProps.numSpritesSpoken == 0)) {
    fill(rgb(118,102,160));
    rect(0,390,(World.frameCount*400/failTime),10);
  } else {
    fill(rgb(0,173,188));
    rect(0,390,(max(0, World.frameCount-validationProps.previous.delay)*400/failTime),10);
  }
  pop();
}


function level6(){
  //This level requires zValidationHelperFunctions
  if (!validationProps.successCriteria) {
    validationProps.successCriteria = {
      singleSprite: false,
      noSpritesTouching: true
    };
  }

  // Helper variables
  var spriteIds = getSpriteIdsInUse();
  var eventLog = getEventLog();
  var background = getBackground();

  if (!validationProps.previous) {
    validationProps.previous = {
      background: background
    };
  }

  if (!validationProps.numSpritesChangedBackground) {
    validationProps.numSpritesChangedBackground = 0;
  }


  // Check for a sprite
  if (!validationProps.successCriteria.singleSprite) {
    validationProps.successCriteria.singleSprite = spriteIds.length>=1;
  }

  if (World.frameCount == 1) {
    // Check that no sprites are touching
    for (var i=0; i<spriteIds.length; i++) {
      for (var j=i+1; j<spriteIds.length; j++) {
        if (isTouchingSprite({id: spriteIds[i]}, {id: spriteIds[j]})) {
          setProp({id: spriteIds[i]}, "debug", true);
          setProp({id: spriteIds[j]}, "debug", true);
          validationProps.successCriteria.noSpritesTouching = false;
          break;
        }
      }
      if (!validationProps.successCriteria.noSpritesTouching) {
        break;
      }
    }
  }

  // Check if new event happened
  if (eventLog.length > validationProps.previous.eventLogLength) {
    var currentEvent = eventLog[eventLog.length - 1];
    var clickedSpriteId = parseInt(currentEvent.split(" ")[1]);
    if (currentEvent.includes("whenClick: ") || currentEvent.includes("whileClick: ")) {
      if ((!validationProps.previous.clickedSprite || validationProps.previous.clickedSprite != clickedSpriteId) &&
         (background !== validationProps.previous.background)) {
        validationProps.numSpritesChangedBackground++;
        validationProps.previous.background = background;
      }
      validationProps.previous.clickedSprite = clickedSpriteId;
    }
  }

  // Store previous event log length
  validationProps.previous.eventLogLength = eventLog.length;

  // Set success time if success
  if (validationProps.successCriteria.singleSprite &&
      validationProps.successCriteria.noSpritesTouching &&
      validationProps.numSpritesChangedBackground>=1 &&
      !validationProps.successTime)
  {
    validationProps.successTime = World.frameCount;
  }

  var earlyFailTime = 10;
  var failTime = 150;

  if (World.frameCount > earlyFailTime) {
    if (!validationProps.successCriteria.singleSprite) {
      levelFailure(3, "noSprites");
    }
  }

  if (World.frameCount > failTime) {
    if (!validationProps.successCriteria.noSpritesTouching) {
      levelFailure(3, "startingSpritesShouldNotTouch");
    } else if (!validationProps.successTime) {
      // fail
      levelFailure(3, "changeBackground");
    } else if (validationProps.numSpritesChangedBackground >= 2) {
      // bonus pass
      levelFailure(0, "genericBonusSuccess");
    } else if (validationProps.numSpritesChangedBackground >= 1) {
      // pass
      levelFailure(0, "genericSuccess");
    }
  }

  push();
  stroke("white");
  if (!validationProps.successCriteria.singleSprite) {
    fill(rgb(118,102,160));
    rect(0,390,(World.frameCount*400/earlyFailTime),10);
  } else if (!validationProps.successTime ||
      !validationProps.successCriteria.noSpritesTouching) {
    fill(rgb(118,102,160));
    rect(0,390,(World.frameCount*400/failTime),10);
  } else {
    fill(rgb(0,173,188));
    rect(0,390,((World.frameCount)*400/failTime),10);
  }
  pop();
}


function level7(){
  //This level requires zValidationHelperFunctions
  if (!validationProps.successCriteria) {
    validationProps.successCriteria = {
      starterSprite: false,
      noSpritesTouching: true
    };
  }

  // Helper variables
  var spriteIds = getSpriteIdsInUse();
  var eventLog = getEventLog();

  if (!validationProps.previous) {
    validationProps.previous = {};
  }

  if (!validationProps.numSpritesChangedCostume) {
    validationProps.numSpritesChangedCostume = 0;
  }

  // Keep track of sprites' current costumes
  if(!validationProps.spritesCostumes) {
    validationProps.spritesCostumes = {};
    for (var spriteId in  spriteIds) {
      validationProps.spritesCostumes[spriteId] = getProp({id: spriteId}, "costume");
    }
  }

  // Check for a sprite
  if (!validationProps.successCriteria.starterSprite) {
    validationProps.successCriteria.starterSprite = spriteIds.length>=1;
  }

  if (World.frameCount == 1) {
    // Check that no sprites are touching
    for (var i=0; i<spriteIds.length; i++) {
      for (var j=i+1; j<spriteIds.length; j++) {
        if (isTouchingSprite({id: spriteIds[i]}, {id: spriteIds[j]})) {
          setProp({id: spriteIds[i]}, "debug", true);
          setProp({id: spriteIds[j]}, "debug", true);
          validationProps.successCriteria.noSpritesTouching = false;
          break;
        }
      }
      if (!validationProps.successCriteria.noSpritesTouching) {
        break;
      }
    }
  }

  // Check if new event happened
  if (eventLog.length > validationProps.previous.eventLogLength) {
    var currentEvent = eventLog[eventLog.length - 1];
    var clickedSpriteId = parseInt(currentEvent.split(" ")[1]);
    if (currentEvent.includes("whenClick: ") || currentEvent.includes("whileClick: ")) {
      if (!validationProps.previous.clickedSprite ||
          validationProps.previous.clickedSprite != clickedSpriteId) {
        for (var spriteId_0 in spriteIds) {
          var spriteCostume = getProp({id: spriteId_0}, "costume");
          if (validationProps.spritesCostumes[spriteId_0] == undefined) {
            validationProps.spritesCostumes[spriteId_0] = spriteCostume;
          }
          // check if sprite has changed costume since previous frame
          if (spriteCostume != validationProps.spritesCostumes[spriteId_0]) {
            validationProps.spritesCostumes[spriteId_0] = spriteCostume;
            validationProps.numSpritesChangedCostume++;
            break;
          }
        }
      }
      validationProps.previous.clickedSprite = clickedSpriteId;
    }
  }

  // Store previous event log length
  validationProps.previous.eventLogLength = eventLog.length;

  // Set success time if success
  if (validationProps.successCriteria.starterSprite &&
      validationProps.successCriteria.noSpritesTouching &&
      validationProps.numSpritesChangedCostume>=1 &&
      !validationProps.successTime)
  {
    validationProps.successTime = World.frameCount;
  }

  var earlyFailTime = 10;
  var failTime = 150;

  if (World.frameCount > earlyFailTime) {
    if (!validationProps.successCriteria.starterSprite) {
      levelFailure(3, "noSprites");
    }
  }

  if (World.frameCount > failTime) {
    if (!validationProps.successCriteria.noSpritesTouching) {
      // fail
      levelFailure(3, "startingSpritesShouldNotTouch");
    } else if (!validationProps.successTime) {
      // fail
      levelFailure(3, "changeOrSetCostumeEvent");
    } else if (validationProps.numSpritesChangedCostume >= 2) {
      // bonus pass
      levelFailure(0, "genericBonusSuccess");
    } else if (validationProps.numSpritesChangedCostume >= 1) {
      // pass
      levelFailure(0, "genericSuccess");
    }
  }

  push();
  stroke("white");
  if (!validationProps.successCriteria.starterSprite) {
    fill(rgb(118,102,160));
    rect(0,390,(World.frameCount*400/earlyFailTime),10);
  } else if (!validationProps.successTime ||
      !validationProps.successCriteria.noSpritesTouching) {
    fill(rgb(118,102,160));
    rect(0,390,(World.frameCount*400/failTime),10);
  } else {
    fill(rgb(0,173,188));
    rect(0,390,((World.frameCount)*400/failTime),10);
  }
  pop();
}


function level8(){
  //This level requires zValidationHelperFunctions
  if (!validationProps.successCriteria) {
    validationProps.successCriteria = {
      starterSprite: false,
      changedSize: false,
      changedSizeEvent: false
    };
  }

  if (!validationProps.previous) {
    validationProps.previous = {};
  }

  // Keep track of sprites' current sizes
  if(!validationProps.spritesSizes) {
    validationProps.spritesSizes = {};
  }

  // Helper variables
  var spriteIds = getSpriteIdsInUse();
  var eventLog = getEventLog();

  // Check for a sprite
  if (!validationProps.successCriteria.starterSprite) {
    validationProps.successCriteria.starterSprite = spriteIds.length>=1;
  }

  if (World.frameCount == 1) {
    for (var spriteId in spriteIds) {
      var spriteSize = getProp({id: spriteId}, "scale");
      if (spriteSize != 100) {
        validationProps.successCriteria.changedSize = true;
      }
      validationProps.spritesSizes[spriteId] = spriteSize;
    }
  } else {
    // Check if new event happened
    if ((eventLog.length > validationProps.previous.eventLogLength) && !validationProps.successCriteria.changedSizeEvent) {
      var currentEvent = eventLog[eventLog.length - 1];
      // check eventLog for WhenClick or WhileClick event
      if (currentEvent.includes("whenClick: ") || currentEvent.includes("whileClick: ")) {
        for (var spriteId_0 in spriteIds) {
          var spriteSize_0 = getProp({id: spriteId_0}, "scale");
          // check if sprite has changed size since previous frame
          if (spriteSize_0 != validationProps.spritesSizes[spriteId_0]) {
            validationProps.successCriteria.changedSizeEvent = true;
            break;
          }
        }
      }
    }
  }

  // Store previous event log length
  validationProps.previous.eventLogLength = eventLog.length;

  // Set success time if success
  if ((validationProps.successCriteria.starterSprite &&
      validationProps.successCriteria.changedSize) ||
      (validationProps.successCriteria.starterSprite &&
      validationProps.successCriteria.changedSizeEvent) &&
      !validationProps.successTime)
  {
    validationProps.successTime = World.frameCount;
  }

  var earlyFailTime = 10;
  var failTime = 150;

  if (World.frameCount > earlyFailTime) {
    if (!validationProps.successCriteria.starterSprite) {
      levelFailure(3, "noSprites");
    }
  }

  if (World.frameCount > failTime) {
    if (!validationProps.successTime) {
      // fail
      levelFailure(3, "changeOrSetSize");
    } else if (validationProps.successCriteria.changedSizeEvent) {
      // bonus pass
      levelFailure(0, "genericBonusSuccess");
    } else if (validationProps.successCriteria.changedSize) {
      // pass
      levelFailure(0, "genericSuccess");
    }
  }

  push();
  stroke("white");
  if (!validationProps.successCriteria.starterSprite) {
    fill(rgb(118,102,160));
    rect(0,390,(World.frameCount*400/earlyFailTime),10);
  } else if (!validationProps.successTime) {
    fill(rgb(118,102,160));
    rect(0,390,(World.frameCount*400/failTime),10);
  } else {
    fill(rgb(0,173,188));
    rect(0,390,((World.frameCount)*400/failTime),10);
  }
  pop();
}


function level9(){
  //This level requires zValidationHelperFunctions
  if (!validationProps.successCriteria) {
    validationProps.successCriteria = {
      starterSprite: false,
      changedBehavior: false,
      changedBehaviorEvent: false
    };
  }

  // Keep track of sprites' current behaviors
  if (!validationProps.previous) {
    validationProps.previous = {
      numSpritesBehaviors: {}
    };
  }

  // Helper variables
  var spriteIds = getSpriteIdsInUse();
  var eventLog = getEventLog();

  // Check for a sprite
  if (!validationProps.successCriteria.starterSprite) {
    validationProps.successCriteria.starterSprite = spriteIds.length>=1;
  }

  if (World.frameCount == 1) {
    for (var i = 0; i < spriteIds.length; i++) {
      var numSpriteBehaviors = getNumBehaviorsForSpriteId(spriteIds[i]);
      if (numSpriteBehaviors >= 1) {
        validationProps.successCriteria.changedBehavior = true;
      }
      validationProps.previous.numSpritesBehaviors[spriteIds[i]] = numSpriteBehaviors;
    }
  } else {
    // Check if new event happened
    if ((eventLog.length > validationProps.previous.eventLogLength) &&
        !validationProps.successCriteria.changedBehaviorsEvent) {
      var currentEvent = eventLog[eventLog.length - 1];
      // check eventLog for WhenClick or WhileClick event
      if (currentEvent.includes("whenClick: ") || currentEvent.includes("whileClick: ")) {
        for (var j = 0; j < spriteIds.length; j++) {
          var numSpriteBehaviors_0 = getNumBehaviorsForSpriteId(spriteIds[j]);
          // check if sprite has changed behaviors since previous frame
          if (numSpriteBehaviors_0 > validationProps.previous.numSpritesBehaviors[spriteIds[j]]) {
            validationProps.successCriteria.changedBehaviorEvent = true;
            break;
          }
        }
      }
    }
  }

  // Store previous event log length
  validationProps.previous.eventLogLength = eventLog.length;

  // Set success time if success
  if ((validationProps.successCriteria.starterSprite &&
      validationProps.successCriteria.changedBehavior) ||
      (validationProps.successCriteria.starterSprite &&
      validationProps.successCriteria.changedBehaviorEvent) &&
      !validationProps.successTime)
  {
    validationProps.successTime = World.frameCount;
  }

  var earlyFailTime = 10;
  var failTime = 150;

  if (World.frameCount > earlyFailTime) {
    if (!validationProps.successCriteria.starterSprite) {
      levelFailure(3, "noSprites");
    }
  }

  if (World.frameCount > failTime) {
    if (!validationProps.successTime) {
      // fail
      levelFailure(3, "noBehavior");
    } else if (validationProps.successCriteria.changedBehaviorEvent) {
      // bonus pass
      levelFailure(0, "genericBonusSuccess");
    } else if (validationProps.successCriteria.changedBehavior) {
      // pass
      levelFailure(0, "genericSuccess");
    }
  }

  push();
  stroke("white");
  if (!validationProps.successCriteria.starterSprite) {
    fill(rgb(118,102,160));
    rect(0,390,(World.frameCount*400/earlyFailTime),10);
  } else if (!validationProps.successTime) {
    fill(rgb(118,102,160));
    rect(0,390,(World.frameCount*400/failTime),10);
  } else {
    fill(rgb(0,173,188));
    rect(0,390,((World.frameCount)*400/failTime),10);
  }
  pop();
}


function level10(){
  //This level requires zValidationHelperFunctions
  if (!validationProps.successCriteria) {
    validationProps.successCriteria = {
      starterSprite: false,
      changedSound: false,
      changedSoundEvent: false
    };
  }

  // Keep track of sprites' current sounds
  if (!validationProps.previous) {
    validationProps.previous = {
      numSounds: 0,
      chooseSound: false
    };
  }

  // Helper variables
  var spriteIds = getSpriteIdsInUse();
  var eventLog = getEventLog();
  var soundLog = getSoundLog();

  // Check for a sprite
  if (!validationProps.successCriteria.starterSprite) {
    validationProps.successCriteria.starterSprite = spriteIds.length>=1;
  }

  if (World.frameCount == 1) {
    if (soundLog.length > 0) {
      if (soundLog[soundLog.length - 1] == 'Choose') {
        validationProps.previous.chooseSound = true;
      } else {
        validationProps.successCriteria.changedSound = true;
        validationProps.previous.numSounds = soundLog.length;
      }
    }
  } else {
    // Check if new event happened
    if ((eventLog.length > validationProps.previous.eventLogLength) &&
        !validationProps.successCriteria.changedSoundEvent) {
      var currentEvent = eventLog[eventLog.length - 1];
      // check eventLog for WhenClick or WhileClick event
      if (currentEvent.includes("whenClick: ") || currentEvent.includes("whileClick: ")) {
        if (soundLog.length > validationProps.previous.soundLogLength) {
          if (soundLog[soundLog.length - 1] == 'Choose') {
            validationProps.previous.chooseSound = true;
          } else {
            validationProps.successCriteria.changedSoundEvent = true;
          }
        }
      }
    }
  }

  // Store previous event and sound log lengths
  validationProps.previous.eventLogLength = eventLog.length;
  validationProps.previous.soundLogLength = soundLog.length;

  // Set success time if success
  if ((validationProps.successCriteria.starterSprite &&
      validationProps.successCriteria.changedSound) ||
      (validationProps.successCriteria.starterSprite &&
      validationProps.successCriteria.changedSoundEvent) &&
      !validationProps.successTime)
  {
    validationProps.successTime = World.frameCount;
  }

  var earlyFailTime = 10;
  var failTime = 150;

  if (World.frameCount > earlyFailTime) {
    if (!validationProps.successCriteria.starterSprite) {
      levelFailure(3, "noSprites");
    }
  }

  if (World.frameCount > failTime) {
    if (!validationProps.successTime) {
      // fail
      if (validationProps.previous.chooseSound) {
        levelFailure(3, "chooseSound");
        console.log("You need to choose a sound from the drop-down menu.");
      } else {
        levelFailure(3, "noSound");
        console.log("You need to add a sound.");
      }
    } else if (validationProps.successCriteria.changedSoundEvent) {
      // bonus pass
      levelFailure(0, "genericBonusSuccess");
    } else if (validationProps.successCriteria.changedSound) {
      // pass
      levelFailure(0, "genericSuccess");
    }
  }

  push();
  stroke("white");
  if (!validationProps.successCriteria.starterSprite) {
    fill(rgb(118,102,160));
    rect(0,390,(World.frameCount*400/earlyFailTime),10);
  } else if (!validationProps.successTime) {
    fill(rgb(118,102,160));
    rect(0,390,(World.frameCount*400/failTime),10);
  } else {
    fill(rgb(0,173,188));
    rect(0,390,((World.frameCount)*400/failTime),10);
  }
  pop();
}