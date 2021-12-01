function level1(){
  //This level requires zValidationHelperFunctions
  var spriteIds = getSpriteIdsInUse();

  if (!validationProps.successCriteria) {
    setSuccessCriteria({
      starterSprite: checkOneSprite(spriteIds),
      usedSpeech: checkActiveSpeech(spriteIds),
    });
  }

  // Logic
  setSuccessTime(validationProps.successCriteria);

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
      differentCostumes: checkSpriteCostumes(spriteIds)
    });
  }

  // Logic
  setSuccessTime(validationProps.successCriteria);

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
    levelFailure(0, "genericSuccess");
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
      allSpritesSpeaking: false
    });
    validationProps.challengeCriteria = {
      changedBackground: checkBackgroundChanged()
    };
  }

  // Check sprites speaking
  for (var spriteId in spriteIds) {
    if(getSpeechForSpriteId(spriteId)){
      numSpritesWithSayBlocks = numSpritesWithSayBlocks + 1;
    }
  }
  validationProps.successCriteria.allSpritesSpeaking = numSpritesWithSayBlocks == spriteIds.length;

  // Logic
  setSuccessTime(validationProps.successCriteria);

  if (!validationProps.successCriteria.twoSprites ||
    !validationProps.successCriteria.differentLocations ||
    !validationProps.successCriteria.differentCostumes) {
    drawProgressBar("earlyFail");
  } else {
    determineAndDrawProgressBar(validationProps.successTime, false);
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
    if (validationProps.challengeCriteria.changedBackground) {
      levelFailure(0, "genericBonusSuccess");
    } else {
      levelFailure(0, "genericExplore");
    }
  }

}


function level4(){
  //This level requires zValidationHelperFunctions
  var spriteIds = getSpriteIdsInUse();
  var eventLog = getEventLog();

  if (!validationProps.successCriteria) {
    setSuccessCriteria({
      clickedAllSprites: false
    });
  }

  if(!validationProps.clickedSprites){
    validationProps.clickedSprites=[];
  }

  if(!validationProps.vars){
    validationProps.vars = {
      eventLogLength: 0,
      clickedSprite: 0,
      delay: 0
    };
  }

  //check for unclicked sprites, and show hand with rings
  if(World.seconds > 1){
    checkForUnclickedSprites(spriteIds, eventLog);
  }

  var newClickedSprite = getClickedSpriteIdCausedSpeech(eventLog, validationProps.vars.eventLogLength);
  if (newClickedSprite >= 0){
    if (validationProps.clickedSprites.indexOf(newClickedSprite) == -1) {
      validationProps.clickedSprites.push(newClickedSprite);
      validationProps.vars.delay = World.frameCount;
    }
  }

  validationProps.successCriteria.clickedAllSprites = validationProps.clickedSprites.length>=2;

  // Logic
  setSuccessTime(validationProps.successCriteria);

  determineAndDrawProgressBar(validationProps.successTime, validationProps.vars.delay);

  if (World.frameCount-validationProps.vars.delay > WAIT_TIME) {
    if (!validationProps.successTime) {
      levelFailure(3, "clickAllSprites");
    } else {
      levelFailure(0, "genericSuccess");
    }
  }

}


function level5(){
  //This level requires zValidationHelperFunctions
  var spriteIds = getSpriteIdsInUse();
  var eventLog = getEventLog();

  if (!validationProps.successCriteria) {
    setSuccessCriteria({
      twoSprites: checkTwoSprites(spriteIds),
      starterSprite: checkOneSprite(spriteIds),
      differentLocations: checkSpriteLocations(spriteIds),
      differentCostumes: checkSpriteCostumes(spriteIds),
      noSpritesTouching: checkSpritesTouching(spriteIds),
      clickedSprite: false,
      spriteClickCausesSpeech: false
    });
  }

  if (!validationProps.vars) {
    validationProps.vars = {
      delay : 0,
      numSpritesSpoken : 0,
      eventLogLength : 0,
      clickedSprite : -1
    };
  }

  var newId = getClickedSpriteIdCausedSpeech(eventLog, validationProps.vars.eventLogLength);
  if (newId == -2) {
    validationProps.successCriteria.clickedSprite = true;
  } else if (newId >= 0) {
    validationProps.successCriteria.clickedSprite = true;
    if (newId != validationProps.vars.clickedSprite) {
      validationProps.vars.clickedSprite = newId;
      validationProps.vars.numSpritesSpoken++;
      validationProps.vars.delay = World.frameCount;
    }
  }

  validationProps.vars.eventLogLength = eventLog.length;

  validationProps.successCriteria.spriteClickCausesSpeech = validationProps.vars.numSpritesSpoken>=1;

  // Logic
  setSuccessTime(validationProps.successCriteria);

  if (!validationProps.successCriteria.twoSprites ||
    !validationProps.successCriteria.starterSprite ||
    !validationProps.successCriteria.differentLocations ||
    !validationProps.successCriteria.differentCostumes) {
    drawProgressBar("earlyFail");
  } else {
    determineAndDrawProgressBar(validationProps.successTime, validationProps.vars.delay);
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

  if (World.frameCount-validationProps.vars.delay > WAIT_TIME) {
    if (!validationProps.successCriteria.noSpritesTouching) {
      levelFailure(3, "startingSpritesShouldNotTouch");
    } else if (!validationProps.successCriteria.clickedSprite) {
      // fail
      levelFailure(3, "singleSpriteNotClicked");
    } else if (validationProps.vars.numSpritesSpoken >= 2) {
      // bonus pass
      levelFailure(0, "genericBonusSuccess");
    } else if (validationProps.vars.numSpritesSpoken >= 1) {
      // pass
      levelFailure(0, "genericSuccess");
    } else {
      // fail
      levelFailure(3, "clickButNoSay");
    }
  }

}


function level6(){
  var spriteIds = getSpriteIdsInUse();
  var eventLog = getEventLog();
  var background = getBackground();

  if (!validationProps.successCriteria) {
    setSuccessCriteria({
      singleSprite: checkOneSprite(spriteIds),
      noSpritesTouching: checkSpritesTouching(spriteIds),
      changedBackground: false
    });
  }

  if (!validationProps.vars) {
    validationProps.vars = {
      delay: 0,
      eventLogLength : 0,
      clickedSprite: -1,
      background: background,
      numSpritesChangedBackground: 0
    };
  }

  // Check if new event happened
  var newId = getClickedSpriteId(eventLog, validationProps.vars.eventLogLength);
  if (newId >= 0) {
    if ((validationProps.vars.clickedSprite != newId) &&
        (background !== validationProps.vars.background)) {
      validationProps.vars.numSpritesChangedBackground++;
      validationProps.vars.background = background;
      validationProps.successCriteria.changedBackground = validationProps.vars.numSpritesChangedBackground>=1;
      validationProps.vars.delay = World.frameCount;
    }
    validationProps.vars.clickedSprite = newId;
  }

  validationProps.vars.eventLogLength = eventLog.length;

  // Logic
  setSuccessTime(validationProps.successCriteria);

  if (!validationProps.successCriteria.singleSprite) {
    drawProgressBar("earlyFail");
  } else {
    determineAndDrawProgressBar(validationProps.successTime, validationProps.vars.delay);
  }

  if (World.frameCount > EARLY_FAIL_TIME) {
    if (!validationProps.successCriteria.singleSprite) {
      levelFailure(3, "noSprites");
    }
  }

  if (World.frameCount-validationProps.vars.delay > WAIT_TIME) {
    if (!validationProps.successCriteria.noSpritesTouching) {
      levelFailure(3, "startingSpritesShouldNotTouch");
    } else if (!validationProps.successTime) {
      // fail
      levelFailure(3, "changeBackground");
    } else if (validationProps.vars.numSpritesChangedBackground >= 2) {
      // bonus pass
      levelFailure(0, "genericBonusSuccess");
    } else if (validationProps.vars.numSpritesChangedBackground >= 1) {
      // pass
      levelFailure(0, "genericSuccess");
    }
  }

}


function level7(){
  //This level requires zValidationHelperFunctions
  var spriteIds = getSpriteIdsInUse();
  var eventLog = getEventLog();

  if (!validationProps.successCriteria) {
    setSuccessCriteria({
      starterSprite: checkOneSprite(spriteIds),
      noSpritesTouching: checkSpritesTouching(spriteIds),
      changedCostume: false
    });
  }

  if (!validationProps.vars) {
    validationProps.vars = {
      delay: 0,
      clickedSprite: -1,
      eventLogLength: 0,
      numSpritesChangedCostume: 0,
      spritesCostumes: {}
    };

    for (var spriteId in  spriteIds) {
      validationProps.vars.spritesCostumes[spriteId] = getProp({id: spriteId}, "costume");
    }
  }

  // Check if new event happened
  var newId = getClickedSpriteId(eventLog, validationProps.vars.eventLogLength);
  if (newId >= 0) {
    if (validationProps.vars.clickedSprite != newId) {
      for (var spriteId_0 in spriteIds) {
        var spriteCostume = getProp({id: spriteId_0}, "costume");
        if (validationProps.vars.spritesCostumes[spriteId_0] == undefined) {
          validationProps.vars.spritesCostumes[spriteId_0] = spriteCostume;
        }
        // check if sprite has changed costume since previous frame
        if (spriteCostume != validationProps.vars.spritesCostumes[spriteId_0]) {
          validationProps.vars.spritesCostumes[spriteId_0] = spriteCostume;
          validationProps.vars.numSpritesChangedCostume++;
          validationProps.vars.delay = World.frameCount;
          validationProps.successCriteria.changedCostume = true;
          break;
        }
      }
    }
    validationProps.vars.clickedSprite = newId;
  }

  validationProps.vars.eventLogLength = eventLog.length;

  // Logic
  setSuccessTime(validationProps.successCriteria);

  if (!validationProps.successCriteria.starterSprite) {
    drawProgressBar("earlyFail");
  } else {
    determineAndDrawProgressBar(validationProps.successTime, validationProps.vars.delay);
  }

  if (World.frameCount > EARLY_FAIL_TIME) {
    if (!validationProps.successCriteria.starterSprite) {
      levelFailure(3, "noSprites");
    }
  }

  if (World.frameCount-validationProps.vars.delay > WAIT_TIME) {
    if (!validationProps.successCriteria.noSpritesTouching) {
      // fail
      levelFailure(3, "startingSpritesShouldNotTouch");
    } else if (!validationProps.successTime) {
      // fail
      levelFailure(3, "changeOrSetCostumeEvent");
    } else if (validationProps.vars.numSpritesChangedCostume >= 2) {
      // bonus pass
      levelFailure(0, "genericBonusSuccess");
    } else if (validationProps.vars.numSpritesChangedCostume >= 1) {
      // pass
      levelFailure(0, "genericSuccess");
    }
  }

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
      } else {
        levelFailure(3, "noSound");
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