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


/**
Displays animated hands on sprites that need to be clicked to complete a level
@see [Sprite Click Example](https://levelbuilder-studio.code.org/levels/41269)
@example
if(World.frameCount == 1) {
  setFailTime(150);
  setDelayTime(90);
  setupPrevious(); //<-----------

  addCriteria(function() {
    return checkNumClickedSprites(2);
  }, "clickAllSprites");

}
getHelperVars();
drawHandsOnUnclickedSprites(); // <-----------
check();
updatePrevious();
*/
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
 * @see [Check if we move the sprite](https://levelbuilder-studio.code.org/levels/41259/)
 * @example
 addCriteria(function() {
   return spriteIds.length >= 1 && checkMovedSpritePin(spriteIds[0]);
 }, "changeLocation");  // include i18n feedback string
 */
function checkMovedSpritePin(spriteId) {
  var sprite = {id: spriteId};
  var spriteX = getProp(sprite, "x");
  var spriteY = getProp(sprite, "y");
  if(spriteX != 200 || spriteY != 200) {
    return true;
  }
}


// Checks if the sprite's size has been changed from the default
/**
 * Checks if the sprite's size has been changed from the default. *Not* designed to be used in an event.
 * @param spriteId - the sprite to check the size, usually accessed via spriteIds[] array
 * @returns {boolean} true if the specific sprite is not still the default size, and false otherwise
 * @see [Check if we resized a sprite](https://levelbuilder-studio.code.org/levels/41221/)
 * @example
 * addCriteria(function() {
    return checkNotDefaultSize(spriteIds[0]);
  }, "useSetpropBlock");
 */
function checkNotDefaultSize(spriteId) {
  var sprite = {id: spriteId};
  var spriteScale = getProp(sprite, "scale");
  if(spriteScale != 100) {
    return true;
  } else {
  	return false;
  }
}

//Checks if the sprite has been changed from the default costume
//Requires the default costume from that level
/**
 * Checks if the sprite's costume has been changed from the default. *Not* designed to be used in an event.
 * @param spriteId - the sprite to check the costume, usually accessed via spriteIds[] array
 * @param {string} defaultCostume - the default costume in the level. This can be accessed by dragging out a sprite block, then viewing the code and looking at the costume that is generated
 * @returns {boolean} true if the specific sprite is not the default costume, and false otherwise
 * @see [Add a landmark](https://levelbuilder-studio.code.org/levels/41276/)
 * @example
 //Checks whether the second sprite is not the default costume
 addCriteria(function() {
   return spriteIds.length >= 2 && checkNotDefaultCostume(spriteIds[1], "red_shirt_wave2");
 }, "cscLandmarkChangeCostume");  // include i18n feedback string
 */
function checkNotDefaultCostume(spriteId, defaultCostume) {
  var sprite = {id: spriteId};
  var spriteCostume = getProp(sprite, "costume");
  if(spriteCostume != defaultCostume) {
    return true;
  } else {
    return false;
  }
}


//Checks if the sprite is currently speaking
//Designed to be used when a sprite is speaking when the program is run, _not_ during an event
/**
 * Checks if a particular sprite was speaking when the program started running. _Not_ designed to be used in an event.
 * @param spriteId - the sprite to check if it is speaking, usually accessed via spriteIds[] array
 * @returns {boolean} true if the specific sprite is speaking when the program is run, and false otherwise
 * @see [Make your characters say something](https://levelbuilder-studio.code.org/levels/41231/)
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

// NEWSECTION
// # <a name="eventValidation">Event Validation</a>

/***************************************************
EVENT VALIDATION
***************************************************/

/**
 *  Checks for the number of **unique** sprites that have been clicked over the course of the entire level.
 * @param {number} n - number of unique click events to test for
 * @returns {boolean} true if at least n sprites have been clicked throughout the level, false otherwise
 * @see [Click 2 sprites level](https://levelbuilder-studio.code.org/levels/41269/)
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
 * @see [Touch all landmarks level](https://levelbuilder-studio.code.org/levels/41466/)
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
 * @see [Check touching most recent landmark](https://levelbuilder-studio.code.org/levels/41281/)
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
 * @see [Check if Hank says something when clicked](https://levelbuilder-studio.code.org/levels/41265/)
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
 * @see [Check if storytellers change background](https://levelbuilder-studio.code.org/levels/41464/)
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
  return getBackground() != validationProps.previous.background;
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
  return eventLog.length >= n;
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
 * @see [Check for prints when run](https://levelbuilder-studio.code.org/levels/41262/)
 * @see [Check for prints after an event](https://levelbuilder-studio.code.org/levels/41267)
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
 * @see [Check for a prompt after a click event](https://levelbuilder-studio.code.org/levels/41267/)
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

// NEWSECTION
//# <a name="worldValidation">World Validation</a>

/***************************************************
WORLD VALIDATION
***************************************************/

//Checks if the background was set to something. Designed to be implemented in levels without any background block, so setting background for first time
/**
 * Checks if the background was set to something. Designed to be implemented in levels without any background block, so setting background for first time
 * @returns {boolean} true if the background exists
 * @see [Check background in first level](https://levelbuilder-studio.code.org/levels/41257/)
 * @example
 * addCriteria(function() {
   return checkSetBackground();
 }, "spritelabFeedbackChangeBackgroundColor");
 */
function checkSetBackground(){
  var background = getBackground();
  return background !== undefined && background !== "#ffffff";
}
