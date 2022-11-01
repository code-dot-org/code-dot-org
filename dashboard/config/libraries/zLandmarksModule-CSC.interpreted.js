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

var DEBUG = false;

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
  console.log("-- getClickedSpriteId() - Returns the spriteId of a sprite clicked this frame, or -1 if not found");
  console.log("-- getSpritesThatTouched() - Returns an array of two spriteIds that touch that frame, or -1 if not found");
  console.log("");
  libraryREADME();
}

/***************************************************
SPECIFIC HELPER CODE FOR VALIDATION (contains things specifically for this CSC module)
***************************************************/

validationProps.landmarksValidation = {};
validationProps.landmarksValidation.events = [];

function libraryREADME() {
  console.log("This library also includes validation helper objects that can be used when writing custom block functions");
  console.log("-- validationProps.landmarksValidation is an object for any particles module specific helpers");
  console.log("-- validationProps.landmarksValidation.events is an array for any particles module specific events");
}