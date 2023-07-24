// Documentation for this library can be found here: https://github.com/code-dot-org/code-dot-org/wiki/zCriterionValidationLibrary-Documentation
// The comment system template follows JSDoc format - https://jsdoc.app/index.html
// If you add new functions: please also add comments in that format so it can be exported and added to the documentation

// NEWSECTION
//# <a name="helperFunctions">Helper Functions</a>

/***************************************************
GENERAL HELPER FUNCTIONS
***************************************************/

//General helper global variables that can be used in level validation
var spriteIds;
var animations;
var eventLog;
var soundLog;
var eventSpriteIds;
var spriteBehaviorsObj;
var promptVars;

var DEBUG = true;

function turnOnDebugging() {
  DEBUG = true;
}

/**
Checks if an element is a member of an array. Equivalent to array.includes(elt).
@param elt - the element to check for
@param {array} array - the array to search through for the element
@return {boolean} true if member, false otherwise
@example
var colors = ["red", "green", "blue"];
// This will return true
member("red", colors);
// This will return false
member("orange", colors);
*/
function member(elt, array) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] == elt) {
      return true;
    }
  }
  return false;
}

function checkSpriteExists(id) {
  return member(id, getSpriteIdsInUse());
}

/**
Updates several helper variables that are used in validation code:
- spriteIds - an array of all the current sprite IDs
- animations - an array all the the animation costumes in use
- eventLog - an array of all events during the course of a level, where each element is a string representing an onscreen event
- printLog - an array of all printed text during the course of a level, where each element is a string that is created using print blocks
- soundLog - an array of all sounds played during the running of a level
- eventSpriteIds - an array of just the spriteIds who were involved in an event during the current frame of the level
- promptVars - an object of all prompts that students have answered during the running of a level, in the form of {promptVariable: "response"}
- spriteBehaviorsObj - an object of all current behaviors for any sprite on the screen
This function should get called in the validation code for every validation level (see example);
@summary Updates several helper variables that are used in validation code
@example
if(World.frameCount == 1) {
  setFailTime(150);
  setDelayTime(90);
  setupPrevious();

  // addCriteria functions here

}
getHelperVars(); //<-----------
check();
updatePrevious();
*/
function getHelperVars() {
  spriteIds = getSpriteIdsInUse();
  animations = getAnimationsInUse();
  eventLog = getEventLog();
  printLog = getPrintLog();
  soundLog = getSoundLog();
  eventSpriteIds = getEventSpriteIds();
  promptVars = getPromptVars();

  spriteBehaviorsObj = {};
  for(var i = 0; i < spriteIds.length; i++) {
    spriteBehaviorsObj[spriteIds[i]] = getBehaviorsForSpriteId(spriteIds[i]);
  }
}

/**
Sets up a `previous` object that's a snapshot of the state of the level from the previous frame. This is necessary to detect things like:
- Did a new event happen?
- Did a sprite start speaking as a result of touching another sprite?
- Did the background change when something happened?
This function should get called in the validation code for every validation level (see example);
@example
if(World.frameCount == 1) {
  setFailTime(150);
  setDelayTime(90);
  setupPrevious(); //<-----------

  // addCriteria functions here

}
getHelperVars();
check();
updatePrevious();
*/
function setupPrevious() {
  if (!validationProps.previous) {
    validationProps.previous = {};
    validationProps.previous.background = "";
    validationProps.previous.spriteIds = [];
    validationProps.previous.promptVars = {};
    validationProps.previous.animations = [];
    validationProps.previous.eventLog = [];
    validationProps.previous.printLog = [];
    validationProps.previous.soundLog = [];
    validationProps.previous.eventSpriteIds = [];
    validationProps.previous.spriteBehaviorsObj = {};
  }
}

//Helper function
function checkForPreviousObject() {
  if(!validationProps.previous) {
    console.log("Need to call setupPrevious() to use checkSpriteClicked() helper function");
    return false;
  }
}


/**
Updates the previous object at the very end of the validation code. This function should get called in the validation code for every validation level (see example);
@example
if(World.frameCount == 1) {
  setFailTime(150);
  setDelayTime(90);
  setupPrevious();

  // addCriteria functions here

}
getHelperVars();
check();
updatePrevious(); // <-----------
*/
function updatePrevious() {
  validationProps.previous.background = getBackground();
  validationProps.previous.spriteIds = spriteIds;
  validationProps.previous.promptVars = promptVars;
  validationProps.previous.animations = animations;
  validationProps.previous.eventLog = eventLog;
  validationProps.previous.printLog = printLog;
  validationProps.previous.soundLog = soundLog;
  validationProps.previous.eventSpriteIds = eventSpriteIds;
  validationProps.previous.spriteBehaviorsObj = spriteBehaviorsObj;
}

/*
HAND DRAWING HELPER FUNCTIONS
*/
function drawRings(x,y){
  push();
  stroke("rgba(0,0,0,0.5)");
  noFill();
  strokeWeight(3);
  ellipse(x,y,Math.cos(World.frameCount/10)*30,Math.cos(World.frameCount/10)*30);
  stroke("rgba(255,255,255,0.5)");
  noFill();
  strokeWeight(3);
  ellipse(x,y,Math.sin(World.frameCount/10)*30,Math.sin(World.frameCount/10)*30);
  pop();
}

function drawHand(x, y){
  y+=5;
  push();
  var gray1=Math.cos(World.frameCount/10)*30;
  var gray2=Math.sin(World.frameCount/10)*30+225;
  //background(color);
  noStroke();
  fill(rgb(224, 224, 224));
  //palm
  shape(x-5.5,y+12,x+35.5,y+20,x+35.5,y+37,x-5.5,y+37);
  //index finger
  rect(x-5.5,y-5,10,30);
  ellipse(x,y-5,10);
  //middle
  ellipse(x+10,y+15,10);
  //ring
  ellipse(x+20,y+17.5,10);
  //pinky
  ellipse(x+30,y+20,10);
  //wrist
  ellipse(x,y+37,10);
  ellipse(x+30,y+37,10);
  rect(x,y+32,30,15);
  //thumb
  shape(x-5.5,y+37,x-20.5,y+22,x-13.5,y+15,x-5.5,y+25);
  ellipse(x-17,y+18.5,10);
  stroke(rgb(96, 96, 96));
  strokeWeight(3);
  noFill();
  //palm
  line(x-5.5,y-5,x-5.5,y+25);
  line(x+35,y+20,x+35,y+37);
  //index finger
  line(x+4.5,y-5,x+4.5,y+15);
  arc(x,y-5,10,10,180,0);
  //middle
  arc(x+10,y+15,10,10,180,0);
  //ring
  arc(x+20,y+17.5,10,10,180,0);
  //pinky
  arc(x+30,y+20,10,10,180,0);
  //wrist
  arc(x,y+37,10,10,90,180);
  arc(x+30,y+37,10,10,0,90);
  line(x,y+42,x,y+47);
  line(x+30,y+42,x+30,y+47);
  line(x,y+47,x+30,y+47);
  //thumb
  line(x-5.5,y+37,x-20.5,y+22);
  line(x-13.5,y+15,x-5.5,y+25);
  arc(x-17,y+18.5,10,10,135,315);
  pop();
}

//Call this to draw hands on all unclicked sprites.
//Designed to be called after the world.frameCount if statement so it happens each tick of the draw loop
//Dan Note: this doesn't actually check for CLICK events - technically this works for any type of event
//And: doesn't actually use clickedSprites - do I need it?
function drawHandsOnUnclickedSprites(){
  if(World.seconds < 1){
    return;
  }
  if(!validationProps.clickedSprites) {
    validationProps.clickedSprites = [];
  }
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


/**
Extends the fail time in a level, such as when the user interacts with a sprite.
@see [Click here for example - extending after answering prompt](https://levelbuilder-studio.code.org/levels/41449/)
@see [Click here for example - extending whenever a click event happens regardless of validation](https://levelbuilder-studio.code.org/levels/41451/)
@param {number} n - the amount of frames to extend the fail time by.
@returns {boolean} always returns true so it can be used within the `return` part of criterion commands.
@example
//Extends the fail time by 45 frames (1.5 seconds)
addCriteria(function() {
   return checkAtLeastNPromptsAnswered(1) && extendFailTime(45);
 }, "cscFunctionsPromptNotAnswered");
*/
function extendFailTime(n) {
  var currentFailTime = getFailTime();
  setFailTime(currentFailTime + n);
  //var currentFrame = World.frameCount;
  //var framesLeft = currentFailTime - currentFrame;
  return true;
}

// NEWSECTION
// # <a name="spriteValidation">Sprite Validation</a>

/***************************************************
SPRITE VALIDATION
***************************************************/

//Checks if a particular sprite was moved from the default (200, 200) location in a level
/**
 * Checks if a particular sprite was moved from the default (200, 200) location in a level
 * @param spriteId - the sprite to check if it was touched, usually accessed via spriteIds[] array
 * @returns {boolean} true if the specific sprite was moved before the level started, and false otherwise
 * @see [Click here for example - Check if we move the sprite](https://levelbuilder-studio.code.org/levels/41259/)
 * @example
 addCriteria(function() {
   return spriteIds.length >= 1 && checkMovedSpritePin(spriteIds[0]);
 }, "changeLocation");  // include i18n feedback string
 */
function checkMovedSpritePin(spriteId) {
  if (checkSpriteExists(spriteId)) {
    var sprite = {id: spriteId};
    var spriteX = getProp(sprite, "x");
    var spriteY = getProp(sprite, "y");
    if(spriteX != 200 || spriteY != 200) {
      return true;
 	}
  }
  return false;
}


// Checks if the sprite's size has been changed from the default
/**
 * Checks if the sprite's size has been changed from the default. *Not* designed to be used in an event.
 * @param spriteId - the sprite to check the size, usually accessed via spriteIds[] array
 * @returns {boolean} true if the specific sprite is not still the default size, and false otherwise
 * @see [Click here for example - Check if we resized a sprite](https://levelbuilder-studio.code.org/levels/41221/)
 * @example
 * addCriteria(function() {
    return checkNotDefaultSize(spriteIds[0]);
  }, "useSetpropBlock");
 */
function checkNotDefaultSize(spriteId) {
  if (checkSpriteExists(spriteId)) {
    var sprite = {id: spriteId};
    var spriteScale = getProp(sprite, "scale");
    if(spriteScale != 100) {
      return true;
    } else {
      return false;
    }
  }
  return false;
}

//Checks if the sprite has been changed from the default costume
//Requires the default costume from that level
/**
 * Checks if the sprite's costume has been changed from the default. *Not* designed to be used in an event.
 * @param spriteId - the sprite to check the costume, usually accessed via spriteIds[] array
 * @param {string} defaultCostume - the default costume in the level. This can be accessed by dragging out a sprite block, then viewing the code and looking at the costume that is generated
 * @returns {boolean} true if the specific sprite is not the default costume, and false otherwise
 * @see [Click here for example - Add a landmark](https://levelbuilder-studio.code.org/levels/41276/)
 * @example
 //Checks whether the second sprite is not the default costume
 addCriteria(function() {
   return spriteIds.length >= 2 && checkNotDefaultCostume(spriteIds[1], "red_shirt_wave2");
 }, "cscLandmarkChangeCostume");  // include i18n feedback string
 */
function checkNotDefaultCostume(spriteId, defaultCostume) {
  if (checkSpriteExists(spriteId)) {
    var sprite = {id: spriteId};
    var spriteCostume = getProp(sprite, "costume");
    if(spriteCostume != defaultCostume) {
      return true;
    } else {
      return false;
    }
  }
  return false;
}


//Checks if the sprite is currently speaking
//Designed to be used when a sprite is speaking when the program is run, _not_ during an event
/**
 * Checks if a particular sprite was speaking when the program started running. _Not_ designed to be used in an event.
 * @param spriteId - the sprite to check if it is speaking, usually accessed via spriteIds[] array
 * @returns {boolean} true if the specific sprite is speaking when the program is run, and false otherwise
 * @see [Click here for example - Make your characters say something](https://levelbuilder-studio.code.org/levels/41231/)
 * @example
 * addCriteria(function() {
    return checkSpriteSpeech(spriteIds[0]);
  }, "noSpeech");
 */
function checkSpriteSpeech(spriteId) {
  var speech = getSpeechForSpriteId(spriteId);
  if(speech != null) {
    return true;
  } else {
    return false;
  }
}

//Gets the sprite ID that has that costume
function getSpecificSpriteByCostume(costume) {
  for(var i = 0; i < spriteIds.length; i++) {
    var sprite = spriteIds[i];
    if(isCostumeEqual({"id": sprite}, costume)) {
       return spriteIds[i];
    }
  }
  return -1;
}

/**
 * Checks if at least one of the costumes (in an array) is set to a sprite in the scene
 * @param spriteCostumes - An array of costumes (as strings) to check for
 * @returns {boolean} true if at least one of these costumes is in the scene, false otherwise
 * @see [Click here for example - checking for an octopus](https://levelbuilder-studio.code.org/levels/47067/)
 * @example
 * addCriteria(function() {
    return World.frameCount == 1 && atLeastOneFromCostumes(["octopus_green", "octopus_purple", "octopus_red"]);
  }, "There is no octopus at the beginning of the scene!");
 */
function atLeastOneFromCostumes(spriteCostumes) {
  for(var i = 0; i < spriteCostumes.length; i++) {
    var costume = spriteCostumes[i];
    var spriteId = getSpecificSpriteByCostume(costume);
    if(spriteId != -1) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if there is exactly one of the costumes from the array of costumes (ie: the level expects just one character, but a student added many)
 * @param spriteCostumes - An array of costumes (as strings) to check for
 * @returns {boolean} true if exactly one of these costumes is in the scene, false otherwise
 * @see [Click here for example - checking for an octopus](https://levelbuilder-studio.code.org/levels/47067/)
 * @example
 * addCriteria(function() {
    return World.frameCount == 1 && exactlyOneFromCostumes(["octopus_green", "octopus_purple", "octopus_red"]);
  }, "There are too many octopi in the beginning of this scene!");
 */
function exactlyOneFromCostumes(spriteCostumes) {
  var count = 0;
  for(var i = 0; i < spriteCostumes.length; i++) {
    var costume = spriteCostumes[i];
    var spriteId = getSpecificSpriteByCostume(costume);
    if(spriteId != -1) {
      count += 1;
    }
  }
  return count == 1;
}

/**
 * Returns the spriteId of a sprite that has the costume in the array. Should be used with exactlyOneFromCostumes() to ensure there is a unique ID returned. If there is no sprite: -1 is returned
 * @param spriteCostumes - An array of costumes (as strings) to check for
 * @returns {number} number representing the spriteId; -1 otherwise
 * @see [Click here for example - checking for an octopus](https://levelbuilder-studio.code.org/levels/47067/)
 * @example
 * addCriteria(function() {
    var octopusId = getExactlyOneSpriteIdFromCostumes(["octopus_green", "octopus_purple", "octopus_red"]);
    return checkSpriteTouchedThisFrame() && checkNewSpriteCostumeThisFrame(octopusId);
  }, "There was an event, but the octopus sprite didn't change costume!");
 */
function getExactlyOneSpriteIdFromCostumes(spriteCostumes) {
  for(var i = 0; i < spriteCostumes.length; i++) {
    var costume = spriteCostumes[i];
    var spriteId = getSpecificSpriteByCostume(costume);
    if(spriteId != -1) {
      return spriteId;
    }
  }
  return -1;
}



// NEWSECTION
// # <a name="eventValidation">Event Validation</a>

/***************************************************
EVENT VALIDATION
***************************************************/

/**
 *  Checks for the number of **unique** sprites that have been clicked over the course of the entire level.
 * @param {number} n - number of unique click events to test for
 * @returns {boolean} true if at least n sprites have been clicked throughout the level, false otherwise
 * @see [Click here for example - Click 2 sprites level](https://levelbuilder-studio.code.org/levels/41269/)
 * @example
 * addCriteria(function() {
    return checkNumClickedSprites(2);
  }, "clickAllSprites");
 */
function checkNumClickedSprites(n) {
  if(!validationProps.clickedSprites) {
    validationProps.clickedSprites = [];
  }

  var newClickedSprite = getClickedSpriteId();
  if (newClickedSprite >= 0){
    if (validationProps.clickedSprites.indexOf(newClickedSprite) == -1) {
      validationProps.clickedSprites.push(newClickedSprite);
    }
  }
  if(validationProps.clickedSprites.length >= n) {
    return true;
  }
  return false;
}

//Returns true if n unique sprites have been touched over the course of the level
/**
 *  Checks for the number of **unique** sprites that have been touched over the course of the entire level.
 * @param {number} n - number of unique click events to test for
 * @returns {boolean} true if at least n sprites have been touched throughout the level, false otherwise
 * @see [Click here for example - Touch all landmarks level](https://levelbuilder-studio.code.org/levels/41466/)
 * @example
 * addCriteria(function() {
    return checkNumTouchedSprites(2);
  }, "touchAllSprites");
 */
function checkNumTouchedSprites(n) {
  if(!validationProps.touchedSprites) {
    validationProps.touchedSprites = [];
  }

  var sprites = getSpritesThatTouched();
  if (sprites != -1){
    var newTouchedSprite = sprites[1];
    if (validationProps.touchedSprites.indexOf(newTouchedSprite) == -1) {
      validationProps.touchedSprites.push(newTouchedSprite);
    }
  }
  if(validationProps.touchedSprites.length >= n) {
    return true;
  }
  return false;
}

//Returns true if a new event happened this frame
/**
 *  Checks if a new event happened this frame
 * @returns {boolean} true if a new event happened this frame, and false otherwise
 * @example
 * addCriteria(function() {
    return checkNewEventThisFrame();
  }, "noEvent");
 */
function checkNewEventThisFrame() {
  if(!validationProps.previous) {
    console.log("Need to call setupPrevious() to use checkNewEventThisFrame() helper function");
    return false;
  }
  return eventLog.length > validationProps.previous.eventLog.length;
}

//Returns true if a sprite was clicked this frame.
/**
 *  Checks if a sprite was clicked this frame
 * @returns {boolean} true if a sprite was clicked this frame, and false otherwise
 * @example
 * addCriteria(function() {
    return checkSpriteClickedThisFrame();
  }, "noSpriteClicked");
 */
function checkSpriteClickedThisFrame(){
  if(!validationProps.previous) {
    console.log("Need to call setupPrevious() to use checkSpriteClickedThisFrame() helper function");
    return false;
  }
  if (checkNewEventThisFrame()) {
    //If we're here: a new event happened this frame.
    var currentEvent = eventLog[eventLog.length - 1];
    var clickedSpriteId = parseInt(currentEvent.split(" ")[1]);
    if ((currentEvent.includes("whenClick: ") || currentEvent.includes("whileClick: ")) &&
        clickedSpriteId) {
      return true;
    }
  }
  return false;
}

//Returns true if a sprite was touched this frame.
/**
 *  Checks if a sprite was touched this frame
 * @returns {boolean} true if a sprite was touched this frame, and false otherwise
 * @example
 * addCriteria(function() {
    return checkSpriteTouchedThisFrame();
  }, "noSpriteTouched");
 */
function checkSpriteTouchedThisFrame(){
  if(!validationProps.previous) {
    console.log("Need to call setupPrevious() to use checkSpriteClickedThisFrame() helper function");
    return false;
  }
  if (checkNewEventThisFrame()) {
    //If we're here: a new event happened this frame.
    var currentEvent = eventLog[eventLog.length - 1];
    var clickedSpriteId = parseInt(currentEvent.split(" ")[1]);
    if (currentEvent.includes("Touch")) {
      return true;
    }
  }
  return false;
}

//Checks if a particular sprite was touched during an event this frame
/**
 *  Checks if a particular sprite was touched this frame
 * @param spriteId - the sprite to check if it was touched, usually accessed via spriteIds[] array
 * @returns {boolean} true if the specific sprite was touched this frame, and false otherwise
 * @see [Click here for example - Check touching most recent landmark](https://levelbuilder-studio.code.org/levels/41281/)
 * @example
 * addCriteria(function() {
    return spriteIds.length >= 3 && checkThisSpriteTouchedThisFrame(spriteIds[2]);
  }, "cscLandmarkMostRecent");
 */
function checkThisSpriteTouchedThisFrame(spriteId) {
  if(checkSpriteTouchedThisFrame()) {
    var sprites = getSpritesThatTouched();
    //Check that the sprite we touched (sprites[1]) is the 3rd sprite (spriteIds[2])
    if(sprites[1] == spriteId) {
      return true;
    }
  }
  return false;
}

/**
 *  Checks if a particular sprite was clicked this frame
 * @param spriteId - the sprite to check if it was touched, usually accessed via spriteIds[] array
 * @returns {boolean} true if the specific sprite was clicked this frame, and false otherwise
 * @see [Click here for example - Check if Hank says something when clicked](https://levelbuilder-studio.code.org/levels/41265/)
 * @example
 * addCriteria(function() {
    return spriteIds.length >= 2 && checkThisSpriteClickedThisFrame(spriteIds[1]);
  }, "cscBookcoverNoClick");
 */
function checkThisSpriteClickedThisFrame(spriteId) {
  var clickedSprite = getClickedSpriteId();
  if(clickedSprite != -1) {
    return clickedSprite == spriteId;
  }
  return false;
}

//Checks if the background changed from the previous version
/**
 * Checks if the background changed from the previous version. Designed to be used to check with an event
 * @returns {boolean} true if the background changed from the previous frame
 * @see [Click here for example - Check if storytellers change background](https://levelbuilder-studio.code.org/levels/41464/)
 * @example
 * //For second sprite: check that the background changed when we touch the sprite
  addCriteria(function() {
    return spriteIds.length >= 3 && checkThisSpriteTouchedThisFrame(spriteIds[1]) && checkNewBackground();
  }, "cscLandmarkBackgroundStoryteller");

  //For third sprite: check that the background changed
  addCriteria(function() {
    return spriteIds.length >= 3 && checkThisSpriteTouchedThisFrame(spriteIds[2]) && checkNewBackground();
  }, "cscLandmarkBackgroundStoryteller");  // include i18n feedback string
  */
function checkNewBackground() {
  if (getBackground() != '' && getBackground() != null) {
  	return getBackground() != validationProps.previous.background;
  }
  return false;
}

//Checks if n unique touch events have happened
//For example: in levels where the sprite needs to visit 2 things, use checkUniqueTouchEvents(2) to validate that level
//Passing in delayTime will also delay the fail time after each unique event (to give time to visit new sprites)
function checkUniqueTouchEvents(n, delayTime) {
  //Create a global variable that will persist through frames of the draw loop
  if(!validationProps.uniqueTouchEvents) {
    validationProps.uniqueTouchEvents = [];
  }
  //See if any sprites touched this frame
  var sprites = getSpritesThatTouched();
  //If we found some sprites that touched:
  if(sprites != -1) {
    //sprites is an array of [source sprite, destination sprite]
    //See if we haven't already touched this destination sprite
    if(!member(sprites[1], validationProps.uniqueTouchEvents)) {
      //If we made it here: we've touched a unique sprite, so add it to our global list
      validationProps.uniqueTouchEvents.push(sprites[1]);
      if(delayTime) {
        //Add more time to the timer when there's a unique event
        var currentFrame = World.frameCount;
        setFailTime(currentFrame + delayTime);
      }
    }
  }
  //If our list of unique events is n, then we touched all n people
  if(validationProps.uniqueTouchEvents.length == n) {
    return true;
  }
  return false;
}

//Checks if at least n events have occured through the running of the animation
/**
 * Checks if at least n events have occured through the running of the level
 * @param {number} n - the number of events to check for
 * @returns {boolean} true if at least _n_ events have been detected
 * @example
 addCriteria(function() {
   return checkAtLeastNEvents(1);
 }, "noEvents");
 */
function checkAtLeastNEvents(n) {
  if (eventLog) {
      return eventLog.length >= n;
  }
  return false;
}

//Checks if a prompt appeared with an event
/**
 * Checks if Checks if a prompt appeared with an event
 * @returns {boolean} true if a prompt is detected with an event
 * @example
 addCriteria(function() {
   return checkAtLeastNEvents(1);
 }, "noEvents");
 */
function checkPromptWithEvent() {
  //if an event happened this frame:
  if(eventLog.length > validationProps.previous.eventLog.length) {
    var numCurrentPrompts = Object.keys(promptVars).length;
    var numPrevPrompts = Object.keys(validationProps.previous.promptVars).length;
    return(numCurrentPrompts > numPrevPrompts);
  }
  return false;
}

//Returns the spriteId of a sprite clicked this frame, or -1 if not found
function getClickedSpriteId(){
  if(!validationProps.previous) {
    console.log("Need to call setupPrevious() to use getClickedSpriteId() helper function");
    return false;
  }
  if (checkNewEventThisFrame()) {
    var currentEvent = eventLog[eventLog.length - 1];
    var clickedSpriteId = parseInt(currentEvent.split(" ")[1]);
    if (currentEvent.includes("whenClick: ") || currentEvent.includes("whileClick: ")) {
      return clickedSpriteId;
    }
  }
  return -1;
}

//Returns an array of the spriteIDs that touched
//Can then use getProp({id: spriteIds[i]}, "{{property}}") to check other properties of sprites
function getSpritesThatTouched(){
  if(!validationProps.previous) {
    console.log("Need to call setupPrevious() to use getSpritesThatTouched() helper function");
    return false;
  }
  if (checkNewEventThisFrame()) {
    var currentEventArray = eventLog[eventLog.length - 1].split(" ");
    if (currentEventArray[0].includes("whenTouch") || currentEventArray[0].includes("whileTouch")) {
      return [currentEventArray[1], currentEventArray[2]];
    }
  }
  return -1;
}


/**
 * Returns whether two specific sprite costumes are touching, such as wanting to check that a certain sprite interacted with a another specific 
 * @param costume1 - A string of one costume to check
 * @param costume2 - A string of one costume to check
 * @returns {boolean} Whether or not two sprites with these costumes are touching
 * @see [Click here for example - checking for an octopus adapting to its environment](https://levelbuilder-studio.code.org/levels/47067/)
 * @example
 * addCriteria(function() {
    var octopusId = getExactlyOneSpriteIdFromCostumes(["octopus_green", "octopus_purple", "octopus_red"]);
    return checkSpriteTouchedThisFrame() && checkNewSpriteCostumeThisFrame(octopusId) &&
      	  (checkTheseTwoSpriteCostumesTouched("octopus_green", "underseadeco_34") || 
          checkTheseTwoSpriteCostumesTouched("octopus_red", "underseadeco_25") ||
          checkTheseTwoSpriteCostumesTouched("octopus_purple", "underseadeco_24"));
  }, "cscAdaptationsMoveOctopusToPlant");
 */
function checkTheseTwoSpriteCostumesTouched(costume1, costume2) {
  var sprites = getSpritesThatTouched();
  var movingSprite = parseInt(sprites[0]);
  var touchedSprite = parseInt(sprites[1]);
  return (isCostumeEqual({"id": movingSprite}, costume1) && isCostumeEqual({"id": touchedSprite}, costume2)) ||
    (isCostumeEqual({"id": touchedSprite}, costume1) && isCostumeEqual({"id": movingSprite}, costume2));
}

/**
 * Updates current sprite speech for given sprite id. Meant to be called every frame, similar to getHelperVars()
 @param {number} spriteId - the id of the sprite to track, usually by passing an index of the spriteIds object
 @see [Click here - checking if a sprite speaks with a prompt](https://levelbuilder-studio.code.org/levels/42305/)
 @example
 if(World.frameCount == 1) {
  setFailTime(150);
  setDelayTime(90);
  setupPrevious();

  addCriteria(function() {
    //Check that a sprite started speaking the same frame a prompt was answered
    return checkPromptUpdatedThisFrame() && checkNewSpriteSpeakThisFrame(spriteIds[0]);
  }, "cscFunctionsAddSpeachToPrompt");
}
getHelperVars();
trackSpriteSpeech(spriteIds[0]); // <-------------
check();
updatePrevSpriteSpeech(spriteIds[0]);
updatePrevious();
 */
function trackSpriteSpeech(spriteId) {
  if(!validationProps.spriteSpeeches) {
    validationProps.spriteSpeeches = {};
  }
  if(!validationProps.previous.spriteSpeeches) {
    validationProps.previous.spriteSpeeches = {};
  }
  
  validationProps.spriteSpeeches[spriteId] = getSpeechForSpriteId(spriteId);
}

/**
 * Keeps track of previous frame sprite speech. Meant to be called just before the end of the validation loop, similar to updatePrevious();
 @param {number} spriteId - the id of the sprite to track, usually by passing an index of the spriteIds object
 @see [Click here - checking if a sprite speaks with a prompt](https://levelbuilder-studio.code.org/levels/42305/)
 @example
 if(World.frameCount == 1) {
  setFailTime(150);
  setDelayTime(90);
  setupPrevious();

  addCriteria(function() {
    //Check that a sprite started speaking the same frame a prompt was answered
    return checkPromptUpdatedThisFrame() && checkNewSpriteSpeakThisFrame(spriteIds[0]);
  }, "cscFunctionsAddSpeachToPrompt");
}
getHelperVars();
trackSpriteSpeech(spriteIds[0]);
check();
updatePrevSpriteSpeech(spriteIds[0]); // <-------------
updatePrevious();
 */
function updatePrevSpriteSpeech(spriteId) {
  if(!validationProps.spriteSpeeches) {
    validationProps.spriteSpeeches = {};
  }
  if(!validationProps.previous.spriteSpeeches) {
    validationProps.previous.spriteSpeeches = {};
  }
  
  validationProps.previous.spriteSpeeches[spriteId] = validationProps.spriteSpeeches[spriteId];
}

/**
 * Checks if the sprite's speech changed this frame, either because started speaking or because saying something new
 @param {number} spriteId - the id of the sprite to track, usually by passing an index of the spriteIds object
 @see [Click here - checking if a sprite speaks with a prompt](https://levelbuilder-studio.code.org/levels/42305/)
 @example
 if(World.frameCount == 1) {
  setFailTime(150);
  setDelayTime(90);
  setupPrevious();

  addCriteria(function() {
    //Check that a sprite started speaking the same frame a prompt was answered
    return checkPromptUpdatedThisFrame() && checkNewSpriteSpeakThisFrame(spriteIds[0]); // <-------------
  }, "cscFunctionsAddSpeachToPrompt");
}
getHelperVars();
trackSpriteSpeech(spriteIds[0]);
check();
updatePrevSpriteSpeech(spriteIds[0]); 
updatePrevious();
 */
function checkNewSpriteSpeakThisFrame(spriteId) {
  if(!validationProps.spriteSpeeches) {
    console.log("Validation error - in order to use checkNewSpriteSpeakThisFrame, you must also call trackSpriteSpeech() and updatePrevSpriteSpeech(). See documentation for more information.");
    return false;
  }
  return validationProps.spriteSpeeches[spriteId] != validationProps.previous.spriteSpeeches[spriteId];
}

/**
 * Updates current sprite costume for given sprite id. Meant to be called every frame, similar to getHelperVars()
 @param {number} spriteId - the id of the sprite to track, usually by passing an index of the spriteIds object
 @example
if(World.frameCount == 1) {
  setFailTime(150);
  setDelayTime(90);
  setupPrevious(); 
  addCriteria(function() {
    //update to the criteria you want
    return minimumSprites(1) && checkThisSpriteClickedThisFrame(spriteIds[0]) && checkNewSpriteCostumeThisFrame(spriteIds[0]);
  }, "Make sure you change the costume of your sprite!");
}
getHelperVars();
trackSpriteCostume(spriteIds[0]); // <-------
check();
updatePrevSpriteCostume(spriteIds[0]);
updatePrevious();
 */
function trackSpriteCostume(spriteId) {
  if(!validationProps.spriteCostumes) {
    validationProps.spriteCostumes = {};
  }
  if(!validationProps.previous.spriteCostumes) {
    validationProps.previous.spriteCostumes = {};
  }
  
  validationProps.spriteCostumes[spriteId] = getProp({id: spriteId}, "costume");
}

/**
 * Keeps track of previous frame sprite costume. Meant to be called just before the end of the validation loop, similar to updatePrevious();
 @param {number} spriteId - the id of the sprite to track, usually by passing an index of the spriteIds object
 @example
if(World.frameCount == 1) {
  setFailTime(150);
  setDelayTime(90);
  setupPrevious(); 
  addCriteria(function() {
    //update to the criteria you want
    return minimumSprites(1) && checkThisSpriteClickedThisFrame(spriteIds[0]) && checkNewSpriteCostumeThisFrame(spriteIds[0]);
  }, "Make sure you change the costume of your sprite!");
}
getHelperVars();
trackSpriteCostume(spriteIds[0]); 
check();
updatePrevSpriteCostume(spriteIds[0]); // <-------
updatePrevious();
 */
function updatePrevSpriteCostume(spriteId) {
  if(!validationProps.spriteCostumes) {
    validationProps.spriteCostumes = {};
  }
  if(!validationProps.previous.spriteCostumes) {
    validationProps.previous.spriteCostumes = {};
  }
  
  validationProps.previous.spriteCostumes[spriteId] = validationProps.spriteCostumes[spriteId];
}

/**
 * Checks if the sprite's costume changed this frame
 @param {number} spriteId - the id of the sprite to track, usually by passing an index of the spriteIds object
 @example
if(World.frameCount == 1) {
  setFailTime(150);
  setDelayTime(90);
  setupPrevious(); 
  addCriteria(function() {
    //update to the criteria you want
    return minimumSprites(1) && checkThisSpriteClickedThisFrame(spriteIds[0]) && checkNewSpriteCostumeThisFrame(spriteIds[0]); // <-------
  }, "Make sure you change the costume of your sprite!");
}
getHelperVars();
trackSpriteCostume(spriteIds[0]); 
check();
updatePrevSpriteCostume(spriteIds[0]); 
updatePrevious();
 */
function checkNewSpriteCostumeThisFrame(spriteId) {
  if(!validationProps.spriteCostumes) {
    console.log("Validation error - in order to use checkNewSpriteCostumeThisFrame, you must also call trackSpriteCostume() and updatePrevSpriteCostume(). See documentation for more information.");
    return false;
  }
  return validationProps.spriteCostumes[spriteId] != validationProps.previous.spriteCostumes[spriteId];
}

// NEWSECTION
// # <a name="promptPrintValidation">Prompt & Print Validation</a>

/***************************************************
PROMPT AND PRINT VALIDATION
***************************************************/


//Checks that there are at least n things printed
/**
 * Checks if there are at least n things printed using the print block
 * @param {number} n - the number of print statements to check for
 * @returns {boolean} true if at least _n_ print logs are detected
 * @see [Click here for example - Check for prints when run](https://levelbuilder-studio.code.org/levels/41262/)
 * @see [Click here for example - Check for prints after an event](https://levelbuilder-studio.code.org/levels/41267)
 * @example
 addCriteria(function() {
   return checkAtLeastNPrints(1);
 }, "addPrintBlock");
 */
function checkAtLeastNPrints(n) {
  return printLog.length >= n;
}

//Checks that there's at least N prompt in the workspace, as evidenced by a promptVars object with N keys
//Don't use - use checkAtLeastNPrimptsAnswered(n) instead
function checkAtLeastNPrompts(n) {
  var promptVars = getPromptVars();
  if (promptVars == {}) {
    return false;
  }
  //Helper libraries use ES5, so need to use this stuff I think
  var keys = Object.keys(promptVars);
  return keys.length >= n;
}

/**
 * Checks that there's at least N prompts have been answered in the workspace. This only works after the prompt appears on the screen -
   for example, if a level has 3 prompts but they're all in events, the user needs to activate all 3 events first before we can
   detect the 3 prompts.
 * @param {number} n - the number of prompts to check for
 * @returns {boolean} true if at least _n_ prompts are detected
 * @see [Click here for example - Check for a prompt after a click event](https://levelbuilder-studio.code.org/levels/41267/)
 * @example
 addCriteria(function() {
   return checkAtLeastNPromptsAnswered(1);
 }, "cscBookcoverNoPromptAnswered");
 */
function checkAtLeastNPromptsAnswered(n) {
  var promptVars = getPromptVars();
  if (promptVars == {}) {
    return false;
  }
  //Helper libraries use ES5, so need to use this stuff I think
  var keys = Object.keys(promptVars);
  var nonNullKeys = 0;
  for(var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var val = promptVars[key];
    if(val != null) {
      nonNullKeys++;
    }
  }
  return nonNullKeys >= n;
}

/**
 * Checks that all the prompt variables have been set by a student in the level (ie: are not still ???). This function can be called in multiple criteria functions, especially if multiple prompts are used in a level (ie: once when the first prompt is answered, then again when the second prompt is answered).
 * @returns {boolean} true if all prompt variables are not ???; false if any of them are ???
 * @see [Click here for example - check the prompt variable changed](https://levelbuilder-studio.code.org/levels/42304/)
 * @example
 addCriteria(function() {
   return checkAllPromptVariablesSet();
 }, "cscFunctionsUpdatePromptVariable");
 */
function checkAllPromptVariablesSet() {
  var keys = Object.keys(promptVars);
  for(var i = 0; i < keys.length; i++) {
    var variableName = keys[i];
    //If any of the variable names haven't been set (ie: are still "___"), immediately return false.
    if(variableName == "___") {
      return false;
    }
  }
  //If we made it here: all of the variable names have been set, so return true
  return true;
}

/**
 * Checks if a prompt was answered this frame. If the level has a `when [X] answered` block, this will be true and we can validate if other things happened with the event
 * @returns {boolean} true if a prompt was asked or answered this frame; false otherwise
 * @see [Click here for example - checking when a prompt has been answered](https://levelbuilder-studio.code.org/levels/42305/)
 * @example
 addCriteria(function() {
   //Assumes there's a variable called output.
   //This will be true if someone answered a prompt and the output variable got updated to not be 0 (assuming it was 0 before)
   return checkPromptUpdatedThisFrame() && output != 0;
 }, "");
 */
function checkPromptUpdatedThisFrame() {
  var keys = Object.keys(promptVars);
  var prevKeys = Object.keys(validationProps.previous.promptVars);
  if(keys.length != prevKeys.length) {
    //means a prompt was asked this frame
    return false;
  }
  for(var i = 0; i < keys.length; i++) {
    var variableName = keys[i];
    if(promptVars[variableName] != validationProps.previous.promptVars[variableName]) {
      //If we made it here: one of our variable names changed this frame
      return true;
    }
  }
  //If we made it here: none of our variable names changed
  return false;
}

// NEWSECTION
//# <a name="worldValidation">World Validation</a>

/***************************************************
WORLD VALIDATION
***************************************************/

//Checks if the background was set to something. Designed to be implemented in levels without any background block, so setting background for first time
/**
 * Checks if the background was set to something. Designed to be implemented in levels without any background block, so setting background for first time
 * @returns {boolean} true if the background exists
 * @see [Click here for example - Check background in first level](https://levelbuilder-studio.code.org/levels/41257/)
 * @example
 * addCriteria(function() {
   return checkSetBackground();
 }, "spritelabFeedbackChangeBackgroundColor");
 */
function checkSetBackground(){
  var background = getBackground();
  return background !== undefined && background !== "#ffffff";
}

// NEWSECTION
//# <a name="variableFunction">Variable and Function Validation</a>

/***************************************************
VARIABLE & FUNCTION VALIDATION
***************************************************/

/**
 * Updates value of a student variable. Meant to be called every frame, similar to getHelperVars()
 @see [Click here for example level](https://levelbuilder-studio.code.org/levels/42308/)
 @param {string} variableName - the name of the variable we want to track
 @example
 if(World.frameCount == 1) {
  setFailTime(250);
  setDelayTime(150);
  setupPrevious();

  addCriteria(function() {
    //Check we clicked the sprite and the output variable changed
    return checkThisSpriteClickedThisFrame(spriteIds[0]) && checkStudentVariableChangedThisFrame("output");
  }, "cscFunctionsNoFunctionBlock");

}
getHelperVars();
drawHandsOnUnclickedSprites(0);
trackStudentVariable("output"); // <--------
check();
updateStudentVariable("output");
updatePrevious();
 */
function trackStudentVariable(variableName) {
  if(!validationProps.variableValues) {
    validationProps.variableValues = {};
    validationProps.variableIndices = {};
  }
  if(!validationProps.previous.variableValues) {
    validationProps.previous.variableValues = {};
  }
  
  validationProps.variableValues[variableName] = window[variableName];
  
  /*
  //Thought I needed this, but I don't! Way simpler!
  var windowKeys = Object.keys(window);
  if(!validationProps.variableValues[variableName]) {
    //variable name doesn't exist, so go searching for it.
    var firstFunctionIndex = windowKeys.indexOf("trackStudentVariable");
    var lastFunctionIndex = windowKeys.indexOf("math_random_int");
    if(lastFunctionIndex == -1) {
      console.log("Validation error: make sure to enable 'Make shared functions and behaviors available'.");
      return false;
    }
    for(var i = firstFunctionIndex + 1; i < lastFunctionIndex - 1; i++) {
      if(windowKeys[i] == variableName) {
        validationProps.variableValues[variableName] = windowKeys[i];
        validationProps.variableIndices[variableName] = i;
        return;
      }
    }
    //If we made it here: didn't find the variable, to leave both as undefined
    validationProps.variableValues[variableName] = undefined;
    validationProps.variableIndices[variableName] = undefined;
  } else {
    //we've found the variable before, so just need to update it.
    validationProps.variableValues[variableName] = windowKeys[validationProps.variableIndices[variableName]];
  }
  */
}

/**
 * Keeps track of previous frame variable. Meant to be called just before the end of the validation loop, similar to updatePrevious();
 @see [Click here for example level](https://levelbuilder-studio.code.org/levels/42308/)
 @param {string} variableName - the name of the variable we want to update
 @example
 if(World.frameCount == 1) {
  setFailTime(250);
  setDelayTime(150);
  setupPrevious();

  addCriteria(function() {
    //Check we clicked the sprite and the output variable changed
    return checkThisSpriteClickedThisFrame(spriteIds[0]) && checkStudentVariableChangedThisFrame("output");
  }, "cscFunctionsNoFunctionBlock");

}
getHelperVars();
drawHandsOnUnclickedSprites(0);
trackStudentVariable("output"); 
check();
updateStudentVariable("output"); // <--------
updatePrevious();
 */
function updateStudentVariable(variableName) {
  if(!validationProps.variableValues) {
    validationProps.variableValues = {};
    validationProps.variableIndices = {};
  }
  if(!validationProps.previous.variableValues) {
    validationProps.previous.variableValues = {};
  }
  
  validationProps.previous.variableValues[variableName] = validationProps.variableValues[variableName];
}

/**
 * Checks if the variable changed this frame
 @see [Click here for example level](https://levelbuilder-studio.code.org/levels/42308/)
 @param {string} variableName - the name of the variable we want to check
 @return {boolean} true if the variable changed this frame; false if it didn't.
 @example
 if(World.frameCount == 1) {
  setFailTime(250);
  setDelayTime(150);
  setupPrevious();

  addCriteria(function() {
    //Check we clicked the sprite and the output variable changed
    return checkThisSpriteClickedThisFrame(spriteIds[0]) && checkStudentVariableChangedThisFrame("output"); // <--------
  }, "cscFunctionsNoFunctionBlock");

}
getHelperVars();
drawHandsOnUnclickedSprites(0);
trackStudentVariable("output");
check();
updateStudentVariable("output");
updatePrevious();
 
 */
function checkStudentVariableChangedThisFrame(variableName) {
  if(!validationProps.variableValues) {
    console.log("Validation error - in order to use checkStudentVariableChangedThisFrame, you must also call trackStudentVariable() and updateStudentVariable(). See documentation for more information.");
    return false;
  }
  return validationProps.variableValues[variableName] != validationProps.previous.variableValues[variableName];
}

/**
 * Checks that the last thing printed by the user contains a given string. For example, if this criterion function was passed the string "example", then the criterion function would return true if the user printed "this is an example" or "example" but not "examp".
 * @param {string} string - the string to search for in the last print statement
 * @returns {boolean} true if the statement printed by a print block contains <string>
 * @see [Click here for example](https://levelbuilder-studio.code.org/levels/43122)
 * @example
 addCriteria(function() {
   return checkLastPrintStatementContains(example);
 }, "genericFailure");
 */

function checkLastPrintStatementContains(string) {
  	if (printLog.length > 0) {
		return printLog[printLog.length - 1].indexOf(string) !== -1;
    }
  	return false;
}

/**
 * Checks that a user caused a sprite to move with the arrow keys by detecting arrow keypresses and comparing the position of each sprite between the previous and current frames.
 * @returns {boolean} true if the any sprite moved in the same frame that a user pressed an arrow key
 * @see [Click here for example](https://levelbuilder-studio.code.org/levels/43127)
 * @example
 addCriteria(function() {
   return checkInteractiveSpriteMovement()
 }, "genericFailure");
 */

function checkInteractiveSpriteMovement() {
  	// Uses functions from the NativeSpriteLab helper library to detect if a user pressed a key this frame
	var keyPressedNow = isKeyPressed("up") || isKeyPressed("down") || isKeyPressed("left") || isKeyPressed("right");

  	var spriteIds = getSpriteIdsInUse();
 
  	if(!validationProps.previous) {
      	validationProps.previous = {};
    }
  	for (i=0; i<spriteIds.length; i++) {
      var currentX = getProp({id: spriteIds[i]}, "x");
      var currentY = getProp({id: spriteIds[i]}, "y");

      // Performs 2 checks: 1. Did the user press a key this frame? 2. Did the sprites position change from the last frame?
      if (
        validationProps.previous[spriteIds[i]] &&
        (currentX != validationProps.previous[spriteIds[i]].x || currentY != validationProps.previous[spriteIds[i]].y) &&
        keyPressedNow
      ) {
      	return true;
      }

      // Update validationProps.previous for the next position comparison
      validationProps.previous[spriteIds[i]] = {
      	x: currentX,
        y: currentY,
      };
    }
}


/**
 * Checks that a sprite has been moved from their default position in one given dimension by a given amount. 
 * @returns {boolean} true if the sprite with the given `spriteID` moved an `amount` of pixels in a given `direction`
 * @see [Click here for example](https://levelbuilder-studio.code.org/levels/44327?show_callouts=1)
 * @example
if (World.frameCount == 1) {

  setFailTime(400); // Frames to wait before failing student
  setDelayTime(90); // Frames to wait after success before stopping program
  setupPrevious(); //Defines the validationProps.previous{} object. To use it, call updatePrevious() at the end of this box
  
  addCriteria(function() {
    return spriteIds.length >= 1 && checkSpriteMoved(spriteIds[0], 'x', 30);
  }, "didntMoveUp");  // include i18n feedback string

}
getHelperVars();
check();
updatePrevious();

 */

function checkSpriteMoved(spriteId, direction, amount) {
	validationProps.initialPosition = validationProps.initialPosition || undefined;
  	if (validationProps.initialPosition == undefined) {
		validationProps.initialPosition = [];
      	validationProps.initialPosition.push(locationOf({"id": spriteId}).x);
      	validationProps.initialPosition.push(locationOf({"id": spriteId}).y);
      	console.log(validationProps.initialPosition[1]);
    }
 	if (!amount) { console.log("Amount missing or malformed from checkSpriteMoved call"); }
  	var sign = 1;
  	if (amount < 0) { sign = -1; }
	if (direction !== 'x' && direction !== 'y') { console.log("Direction missing or malformated from checkSpriteMoved call"); }
  	if (direction === 'x') {
		return (sign*locationOf({"id": spriteId}).x - (sign * validationProps.initialPosition[0])) > Math.abs(amount);
	} else if ( direction === 'y') {
		return (-1*sign*locationOf({"id": spriteId}).y - (-1 * sign * validationProps.initialPosition[1])) > Math.abs(amount);
    }
}

function checkSpriteHasBehavior(spriteId, behaviorString) {
  if (spriteId == undefined) { console.log("No sprite ID supplied to checkSpriteHasBehavior"); return; }
  if (behaviorString == undefined) { console.log("No behavior string supplied to checkSpriteHasBehavior"); return; }

  return member(behaviorString, getBehaviorsForSpriteId(spriteId));
}