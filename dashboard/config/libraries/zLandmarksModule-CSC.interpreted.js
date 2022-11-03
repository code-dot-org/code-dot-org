console.log("This level uses the zLandmarksModule-CSC helper library.");
console.log("For a reminder of what's in this library, add");
console.log("-- if(World.frameCount == 1) { README(); }-- ");
console.log("to the validation code for this level to see more details of what this library contains");
/***************************************************
HELPER CODE FOR BLOCKS
***************************************************/

/***************************************************
GENERAL HELPER CODE FOR VALIDATION (can be used in multiple validation helper libraries)
***************************************************/

//General helper global variables that can be used in level validation
var spriteIds;
var animations;
var eventLog;
var soundLog;
var eventSpriteIds;
var spriteBehaviorsObj;

var DEBUG = true;

//Helper function
//This function is designed to be used in conjunction with code added to the level template (ie: if(DEBUG) { console.log() });
//There are no actual debuggin statements in the helper library
//This function is designed to be called just once within the code
function turnOnDebugging() {
  DEBUG = true;
}

// Helper function
// returns true if elt is a member of array
// equivalent to .includes() method on arrays, but .includes is not supported in this version of js
function member(elt, array) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] == elt) {
      return true;
    }
  }
  return false;
}

//Get current helper variables. 
//Designed to be called just after worldFrame == 1 conditional, before the main logic of the code
function getHelperVars() {
  spriteIds = getSpriteIdsInUse();
  animations = getAnimationsInUse();
  eventLog = getEventLog();
  printLog = getPrintLog();
  soundLog = getSoundLog();
  eventSpriteIds = getEventSpriteIds();

  spriteBehaviorsObj = {};
  for(var i = 0; i < spriteIds.length; i++) {
    spriteBehaviorsObj[spriteIds[i]] = getBehaviorsForSpriteId(spriteIds[i]);
  }
}

//Setup a 'previous' object to detect changes between frames. 
//Designed to be called within worldFrame == 1 conditional
function setupPrevious() {
  if (!validationProps.previous) {
    validationProps.previous = {};
    validationProps.previous.background = "";
    validationProps.previous.spriteIds = [];
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


//Update previous object.
//Designed to be called at the very end of level validation
function updatePrevious() {
  validationProps.previous.background = getBackground();
  validationProps.previous.spriteIds = spriteIds;
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

/*
CONVENTIONS
functions that start with _check_ always return boolean
functions that start with _get_ always return a value or -1 if not found
*/

/*
CHECKERS
*/

//Returns true if n unique sprites have been clicked over the course of the level
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

//Returns true if there is a new event this frame.
//Used as a helper in other functions.
function checkNewEventThisFrame() {
  if(!validationProps.previous) {
    console.log("Need to call setupPrevious() to use checkNewEventThisFrame() helper function");
    return false;
  }
  return eventLog.length > validationProps.previous.eventLog.length;
}

//Returns true if a sprite was clicked this frame.
function checkSpriteClickedThisFrame(){
  if(!validationProps.previous) {
    console.log("Need to call setupPrevious() to use checkSpriteClickedThisFrame() helper function");
    return false;
  }
  if (checkNewEventHisFrame()) {
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

//Checks if the background was set to something
//Designed to be implemented in levels without any background block, so setting background for first time
function checkSetBackground(){
  var background = getBackground();
  return background !== undefined && background !== "#ffffff";
}

//Checks if the background changed from the previous version
function checkNewBackground() {
  return getBackground() != validationProps.previous.background;
}

//Checks if a particular sprite was moved from the default (200, 200) location in a level
function checkMovedSpritePin(spriteId) {
  var sprite = {id: spriteId};
  var spriteX = getProp(sprite, "x");
  var spriteY = getProp(sprite, "y");
  if(spriteX != 200 || spriteY != 200) {
    return true;
  }
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

//Checks if the sprite's size has been changed from the default
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
function checkSpriteSpeech(spriteId) {
  var speech = getSpeechForSpriteId(spriteId);
  if(speech != null) {
    return true;
  } else {
    return false;
  }
}

/*
GETTERS
*/

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


function README() {
  console.log("This is the README for the zLandmarksModule-CSC Helper library");
  console.log("It includes the following global variables that can be used in validation: ");
  console.log("-- spriteIds - an array of the IDs of all sprites in use during this frame");
  console.log("-- animations - an array of the animations in use during this frame");
  console.log("-- eventLog - an array of the events that have occurred so far during the run of this level (not just this frame)");
  console.log("-- printLog - an array of the printed statements that have occurred so far during the run of this level (not just this frame)");
  console.log("-- soundLog - an array of the sounds that have occurred so far during the run of this level (not just this frame)");
  console.log("-- eventSpriteIds - an array of the sprite IDs that've had an event logged *this frame*. Events include: whenClick, whileClick, whenTouch, whileTouch, spriteCreated");
  console.log("-- spriteBehaviorsObj - an object whose keys are sprite Ids and whose values are getBehaviorsForSpriteId() for that sprite");
  console.log();
  console.log("It also includes the following helper functions:");
  console.log("-- getHelperVars() - regenerates the global vars above. This function is designed to be called just after worldFrame == 1 conditional, so it happens with every frame of the animation loop *and* before any validation checks have happened");
  console.log("-- setupPrevious() - creates a validationProps.previous object, which can be used to create a snapshot of global variables from the previous frame. This function is designed to be called within worldFrame == 1 conditional so it happens just once");
  console.log("-- updatePrevious() - stores the current global variables to the validationProps.previous object (ie: validationProps.previous.spriteIds). This function is designed to be called at the very end of the level validation, so it happens each frame of the animation *and* after all validation checks have happened.");
  console.log("-- drawHandsOnUnclickedSprites() - Draws hands and rings on all unclicked sprites. Designed to be called after the world.frameCount if statement so it happens each tick of the draw loop");
  console.log("-- turnOnDebugging() - This function sets a global DEBUG variable to true. It's designed to be used in conjunction with code added to the level template (ie: if(DEBUG) { console.log() }); There are no actual debuggin statements in the helper library. This function is designed to be called just once within the code");
  console.log("");
  console.log("It also includes the following criteria function designed to be used within addCritera()");
  console.log("-- checkNumClickedSprites(n) - Returns true if n unique sprites have been clicked over the course of the level");
  console.log("-- checkSpriteClickedThisFrame() - Returns true if a sprite was clicked this frame.");
  console.log("-- checkBackgroundChanged() - Checks if the background was set to something");
  console.log("-- checkMovedSpritePin(spriteId) - Checks if a particular sprite was moved from the default (200, 200) location in a level");
  console.log("-- getClickedSpriteId() - Returns the spriteId of a sprite clicked this frame, or -1 if not found");
  console.log("-- getSpritesThatTouched() - Returns an array of two spriteIds that touch that frame, or -1 if not found");
  console.log("");
  libraryREADME();
}

/***************************************************
SPECIFIC HELPER CODE FOR VALIDATION (contains things specifically for this CSC module)
***************************************************/
if (typeof validationProps !== 'undefined') {
  validationProps.landmarksValidation = {};
  validationProps.landmarksValidation.events = [];
}

function libraryREADME() {
  console.log("This library also includes validation helper objects that can be used when writing custom block functions");
  console.log("-- validationProps.landmarksValidation is an object for any particles module specific helpers");
  console.log("-- validationProps.landmarksValidation.events is an array for any particles module specific events");
}


/****************************************************
SNOWBALLING VALIDATION FUNCTIONS
Used for lessons that build a project across multiple levels and we want
to continue validating criteria from previous levels
****************************************************/

function level1Validation(validateBackground) {
  if(validateBackground) {
    addCriteria(function() {
      if(checkSetBackground()) {
        //If you made it here: we passed the criteria
        return true;
      }
      //If you made it here: we failed the criteria
      if(DEBUG) {
        console.log("You need to set a background");
      }
      return false;
    }, "setBackground");  // include i18n feedback string
  }
}

function level2Validation(validateNewSprite, validateNewLocation, validateNewSize) {
  if(validateNewSprite) {
    //Checks whether a sprite has been created
    addCriteria(function() {
      //You can reference global variables from helper library (use the README to remind what those are)

      if(spriteIds.length >= 1) {
        return true;
      }
      //If you made it here: we failed the criteria
      if(DEBUG) {
          console.log("Create a new sprite!");
      }
      return false;
    }, "createNewSprite");  // include i18n feedback string
  }
  
  if(validateNewLocation) {
    //checks if the sprite was moved from the default (200, 200) location
    addCriteria(function() {
      //You can reference global variables from helper library (use the README to remind what those are)

      if(spriteIds.length >= 1) {
        if(checkMovedSpritePin(spriteIds[0])) {
          return true;
        }
      }
      //If you made it here: we failed the criteria
      if(DEBUG) {
          console.log("Move the sprite!");
      }
      return false;
    }, "moveSpriteLocation");  // include i18n feedback string
  }
  
  if(validateNewSize) {
    //check for new size property
    addCriteria(function() {
      //You can reference global variables from helper library (use the README to remind what those are)

      if(spriteIds.length >= 1) {
        var sprite = {id: spriteIds[0]};
        var spriteScale = getProp(sprite, "scale");
        if(spriteScale != 100) {
          //If you made it here: we passed the criteria
          return true;
        }
      }
      //If you made it here: we failed the criteria
      if(DEBUG) {
          console.log("Change the sprite size!");
      }
      return false;
    }, "spriteSize");  // include i18n feedback string
  }
}

function level3Validation(validateSpriteSay) {
  if(validateSpriteSay) {
    //Checks if the first sprite says something
    addCriteria(function() {
      //You can reference global variables from helper library (use the README to remind what those are)
	  if(spriteIds.length >= 1) {
        var spriteId = spriteIds[0];
        var speech = getSpeechForSpriteId(spriteId);
        if(speech != null) {
          return true;
        }
      }
      //If you made it here: we failed the criteria
      if(DEBUG) {
        console.log("Make the sprite speak!");
      }
      return false;
    }, "saySomething");  // include i18n feedback string
  }
}

//check for 2 sprites
//check not default costume
//check for a new location
//check for a new size property
function level4Validation(validate2Sprites, validate2ndCostume, validate2ndLocation, validate2ndSize, validateMovingBehavior) {
  if(validate2Sprites) {
    //Checks whether 2 sprites exist
    addCriteria(function() {
      //You can reference global variables from helper library (use the README to remind what those are)

      if(spriteIds.length >= 2) {
        return true;
      }
      //If you made it here: we failed the criteria
      if(DEBUG) {
          console.log("Create 2 sprites!");
      }
      return false;
    }, "create2Sprites");  // include i18n feedback string
  }
  
  if(validate2ndCostume) {
    //Checks whether the 2nd sprite isn't wearing the default costume
    addCriteria(function() {
      if(spriteIds.length >= 2) {
        var secondSprite = {id: spriteIds[1]};
        var secondCostume = getProp(secondSprite, "costume");
        if(secondCostume != "red_shirt_wave2") {
          //This is only true while red_shirt_wave2 is the default costume for this level
          //If that ever changes, will need to update this if statement
          return true;
        }
      }
      //If you made it here: we failed the criteria
      if(DEBUG) {
          console.log("Change the sprite to a landmark!");
      }
      return false;
    }, "changeToLandmark");  // include i18n feedback string
  }
  
  if(validate2ndLocation) {
    //check that the 2nd sprite moved from the default (200, 200) location
    addCriteria(function() {
      if(spriteIds.length >= 2) {
        if(checkMovedSpritePin(spriteIds[1])) {
          return true;
        }
      }
      //If you made it here: we failed the criteria
      if(DEBUG) {
          console.log("Move the sprite!");
      }
      return false;
    }, "moveSpriteLocation");  // include i18n feedback string
  }
  
  if(validate2ndSize) {
    //checks that 2nd sprite changed sizes
    addCriteria(function() {
      if(spriteIds.length >= 2) {
        var secondSprite = {id: spriteIds[1]};
        var secondScale = getProp(secondSprite, "scale");
        if(secondScale != 100) {
          //If you made it here: we passed the criteria
          return true;
        }
      }
      //If you made it here: we failed the criteria
      if(DEBUG) {
          console.log("Change the sprite size!");
      }
      return false;
    }, "spriteSize");  // include i18n feedback string
  }
  
  if(validateMovingBehavior) {
    addCriteria(function() {
      if(interactiveBehaviorFound()) {
        //If you made it here: we passed the criteria
        return true;
      }
      //If you made it here: we failed the criteria
      console.log("Make sure to add a behavior!");
      return false;
    }, "addBehavior");  // include i18n feedback string
  }
}

//check for new touching event
//check that the sprite says something different from before
function level5Validation(validateNewTouchingEvent, validateNewSpriteSay) {
  if(validateNewTouchingEvent) {
    //checks for a touch event
    addCriteria(function() {
      var sprites = getSpritesThatTouched();
      if(sprites != -1) {
        //If you made it here: we passed the criteria
        return true;
      }
      //If you made it here: we failed the criteria
      if(DEBUG) {
        console.log("Move your character so they touch the landmark!");
      }
      return false;
    }, "noTouchEvent");  // include i18n feedback string
  }
  if(validateNewSpriteSay) {
    addCriteria(function() {
      var sprites = getSpritesThatTouched();
      if(sprites != -1) {
        var speechBubble = getSpeechForSpriteId(sprites[0]);
        if(speechBubble != null && speechBubble != validationProps.previous.speeches[sprites[0]]) {
          return true;
        }
      }
      //If you made it here: we failed the criteria
      if(DEBUG) {
        console.log("Make sure the sprite says something about the landmark!");
      }
      
      //Use this to keep a record of previous speech bubbles from sprites to make sure the sprite changed what they said when touching the landmark
      if(spriteIds.length >= 1 && World.frameCount > 1) {
        validationProps.previous.speeches = {};
        for(var i = 0; i < spriteIds.length; i++) {
        	validationProps.previous.speeches[spriteIds[i]] = getSpeechForSpriteId(spriteIds[i]);
        }
      }
      return false;
    }, "spriteSaySomething");  // include i18n feedback string
  }
}

//check that there are 3 sprites
//check for a new costume
//check for a new location
//check for a new size
function level6Validation(validate3Sprites, validateThirdCostume, validateThirdLocation, validateThirdSize) {
  if(validate3Sprites) {
    //Checks whether 3 sprites exist
    addCriteria(function() {
      //You can reference global variables from helper library (use the README to remind what those are)

      if(spriteIds.length >= 3) {
        return true;
      }
      //If you made it here: we failed the criteria
      if(DEBUG) {
          console.log("Create 3 sprites!");
      }
      return false;
    }, "create3Sprites");  // include i18n feedback string
  }
  if(validateThirdCostume) {
    //Checks whether the 3rd sprite isn't wearing the default costume
    addCriteria(function() {
      if(spriteIds.length >= 3) {
        var thirdSprite = {id: spriteIds[2]};
        var thirdCostume = getProp(thirdSprite, "costume");
        if(thirdCostume != "red_shirt_wave2") {
          //This is only true while red_shirt_wave2 is the default costume for this level
          //If that ever changes, will need to update this if statement
          return true;
        }
      }
      //If you made it here: we failed the criteria
      if(DEBUG) {
          console.log("Change the sprite to a landmark!");
      }
      return false;
    }, "changeToLandmark");  // include i18n feedback string
  }
  if(validateThirdLocation) {
    //check that the 3rd sprite moved from the default (200, 200) location
    addCriteria(function() {
      if(spriteIds.length >= 3) {
        if(checkMovedSpritePin(spriteIds[2])) {
          return true;
        }
      }
      //If you made it here: we failed the criteria
      if(DEBUG) {
          console.log("Move the sprite!");
      }
      return false;
    }, "moveSpriteLocation");  // include i18n feedback string
  }
  if(validateThirdSize) {
    //checks that 3rd sprite changed sizes
    addCriteria(function() {
      if(spriteIds.length >= 3) {
        var thirdSprite = {id: spriteIds[2]};
        var thirdScale = getProp(thirdSprite, "scale");
        if(thirdScale != 100) {
          //If you made it here: we passed the criteria
          return true;
        }
      }
      //If you made it here: we failed the criteria
      if(DEBUG) {
          console.log("Change the sprite size!");
      }
      return false;
    }, "spriteSize");  // include i18n feedback string
  }
}

//check that the sprite we touch is the 3rd sprite we added
//Check that the sprite actually spoke this frame, rather than continuing a previous speech bubble
//*This level relies on the same validation as level 5, so only 2 new validation property to check*
function level7Validation(validateTouchesThirdSprite, validateSpeechThisFrame) {
  if(validateTouchesThirdSprite) {
    addCriteria(function() {
      var sprites = getSpritesThatTouched();
      if(sprites != -1 && spriteIds.length >= 3) {
        //check if the sprite that was touched is the same as 3rd sprite
        if(sprites[1] == spriteIds[spriteIds[2]])
        	return true;
      }
      //If you made it here: we failed the criteria
      if(DEBUG) {
        console.log("Move your character so they touch the most recent landmark!");
      }
      return false;
    }, "touchingWrongLandmark");  // include i18n feedback string
  }
  if(validateSpeechThisFrame) {
    //Check that the sprite actually spoke this frame, rather than continuing a previous speech bubble
    addCriteria(function() {
      var sprites = getSpritesThatTouched();
      if(sprites != -1 && spriteIds.length >= 3) {
        //check if the sprite that was touched is the same as 3rd sprite
        if(sprites[1] == spriteIds[spriteIds[2]]) {
          if(strictSpriteSpeechRenderedThisFrame(sprites[0])) {
            return true;
          }
        }
      }
      //If you made it here: we failed the criteria
      if(DEBUG) {
        console.log("Move your character so they touch the most recent landmark!");
      }
      return false;
    }, "touchingWrongLandmark");  // include i18n feedback string
  }
}

//check that there are 4 sprites
//check for a new costume
//check for a new location
//check for a new size
function level8Validation(validate4Sprites, validateFourthCostume, validateFourthLocation, validateFourthSize) {
  if(validate4Sprites) {
    //Checks whether 4 sprites exist
    addCriteria(function() {
      if(spriteIds.length >= 4) {
        return true;
      }
      //If you made it here: we failed the criteria
      if(DEBUG) {
          console.log("Create 4 sprites!");
      }
      return false;
    }, "create4Sprites");  // include i18n feedback string
  }
  if(validateFourthCostume) {
    //Checks whether the 4th sprite isn't wearing the default costume
    addCriteria(function() {
      if(spriteIds.length >= 4) {
        var sprite = {id: spriteIds[3]};
        var spriteCostume = getProp(sprite, "costume");
        if(spriteCostume != "red_shirt_wave2") {
          //This is only true while red_shirt_wave2 is the default costume for this level
          //If that ever changes, will need to update this if statement
          return true;
        }
      }
      //If you made it here: we failed the criteria
      if(DEBUG) {
          console.log("Change the sprite to a landmark!");
      }
      return false;
    }, "changeToLandmark");  // include i18n feedback string
  }
  if(validateFourthLocation) {
    //check that the 4th sprite moved from the default (200, 200) location
    addCriteria(function() {
      if(spriteIds.length >= 4) {
        if(checkMovedSpritePin(spriteIds[3])) {
          return true;
        }
      }
      //If you made it here: we failed the criteria
      if(DEBUG) {
          console.log("Move the sprite!");
      }
      return false;
    }, "moveSpriteLocation");  // include i18n feedback string
  }
  if(validateFourthSize) {
    //checks that 4th sprite changed sizes
    addCriteria(function() {
      if(spriteIds.length >= 4) {
        var sprite = {id: spriteIds[3]};
        var spriteScale = getProp(sprite, "scale");
        if(spriteScale != 100) {
          //If you made it here: we passed the criteria
          return true;
        }
      }
      //If you made it here: we failed the criteria
      if(DEBUG) {
          console.log("Change the sprite size!");
      }
      return false;
    }, "spriteSize");  // include i18n feedback string
  }
}

//check that the sprite touches the 4th sprite we added
//*This level relies on the same validation as level 5, so only 1 new validation property to check*
function level9Validation(validateTouchesFourthSprite, validateSpeechThisFrame) {
  if(validateTouchesFourthSprite) {
    addCriteria(function() {
      var sprites = getSpritesThatTouched();
      if(sprites != -1 && spriteIds.length >= 4) {
        //check if the sprite that was touched is the 4th sprite
        if(sprites[1] == spriteIds[3]) {
        	return true;
        }
      }
      //If you made it here: we failed the criteria
      if(DEBUG) {
        console.log("Move your character so they touch the most recent landmark!");
      }
      return false;
    }, "touchingWrongLandmark");  // include i18n feedback string
  }
  if(validateSpeechThisFrame) {
    //Check that the sprite actually spoke this frame, rather than continuing a previous speech bubble
    addCriteria(function() {
      var sprites = getSpritesThatTouched();
      if(sprites != -1 && spriteIds.length >= 4) {
        //check if the sprite that was touched is the 4th sprite
        if(sprites[1] == spriteIds[3]) {
          if(strictSpriteSpeechRenderedThisFrame(sprites[0])) {
            return true;
          }
        }
      }
      //If you made it here: we failed the criteria
      if(DEBUG) {
        console.log("Move your character so they touch the most recent landmark!");
      }
      return false;
    }, "touchingWrongLandmark");  // include i18n feedback string
  }
}