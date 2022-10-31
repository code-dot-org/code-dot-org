var debugCondition = false;

var spriteIds;
var animations;
var eventLog;
var soundLog;
var eventSpriteIds;
var spriteBehaviorsObj;
var TESTINGSCOPE = true;

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

//FOR PARTICLES TESTING
validationProps.particlesValidation = {};
validationProps.particlesValidation.events = [];

//enables print statements within functions in this library.
//Designed to be called within worldFrame == 1 conditional.
function enableDebugging() {
  debugCondition = true;
  if(debugCondition) {
    console.log("This level uses a validation helper library");
  }
}

//Get current helper variables. 
//Designed to be called just after worldFrame == 1 conditional, before the main logic of the code
var onlyOnceHelpers = 0;
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
  
  if(onlyOnceHelpers == 0) {
    if(debugCondition) {
      console.log("Global helper variables:");
      console.log("var spriteIds = getSpritesInUse();");
      console.log("var animations = getAnimationsInUse();");
      console.log("var eventLog = getEventLog();");
      console.log("var printLog = getPrintLog();");
      console.log("var soundLog = getSoundLog();");
      console.log("var eventSpriteIds = getEventSpriteIds();");
      console.log("spriteBehaviorsObj is an object whose keys are sprite Ids and whose values are getBehaviorsForSpriteId() for that sprite");
    }
    onlyOnceHelpers++;
  }
}

//Setup a 'previous' object to detect changes between frames. 
//Designed to be called within worldFrame == 1 conditional
var onlyOncePrevSetup = 0;
function setupPrevious() {
  if (!validationProps.previous) {
    validationProps.previous = {};
  }
  if(onlyOncePrevSetup == 0) {
    if(debugCondition) {
        console.log("validationProps.previous is defined as an empty object. Calling updatePrevious() will add a snapshot of each global variable to .previous");
    }
    onlyOncePrevSetup++;
  }
}


//Update previous object. 
//Designed to be called at the very end of level validation
var onlyOncePrev = 0;
function updatePrevious() {
  validationProps.previous.spriteIds = spriteIds;
  validationProps.previous.animations = animations;
  validationProps.previous.eventLog = eventLog;
  validationProps.previous.printLog = printLog;
  validationProps.previous.soundLog = soundLog;
  validationProps.previous.eventSpriteIds = eventSpriteIds;
  validationProps.previous.spriteBehaviorsObj = spriteBehaviorsObj;
  if(onlyOncePrev == 0) {
    if(debugCondition) {
    	console.log("validationProps.previous is being updated with a snapshot of each global variable");
    }
    onlyOncePrev++;
  }
}