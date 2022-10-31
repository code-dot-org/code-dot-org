console.log("This level uses the zParticlesModule helper library.");
console.log("For a reminder of what's in this library, add");
console.log("if(World.frameCount == 1) { README(); }");
console.log("to the validation code for this level to see more details of what this library contains");
/***************************************************
HELPER CODE FOR BLOCKS
***************************************************/
var microscope = 0;

function getMicroscope(value) {
 	if(microscope == value) {
     	return true;
    } else {
     	return false;
    }
}

function setMicroscope(value) {
  microscope = value;
}

//Equivalent of getSpriteIdsInUse({costume: costume})
function filterSprites(costume) {
  var spriteIds = getSpriteIdsInUse();
  var count = spriteIds.length;
  var matterSprites = [];
  //Filter by sprites that match out costume
  for(var j = 0; j < count; j++) {
    if(isCostumeEqual({id: spriteIds[j]}, costume)) {
      matterSprites.push(spriteIds[j]);
    }
  }
  return matterSprites;
}

//Equivalent of layoutAsGrid({costume: costume})
function helperGrid(costume) {
    spriteIds = filterSprites(costume);
    count = spriteIds.length;
    //Now this is essentially the same code as layoutGrid block
    var numRows = Math.ceil(Math.sqrt(count));
    var numCols = Math.ceil(count / numRows);
    for (var i = 0; i < count; i++) {
      var spriteIdArg = {id: spriteIds[i]};
      var row = Math.floor(i / numCols);
      var col = i % numCols;
      var colFraction = col / (numCols - 1) || 0;
      var x = MIN_XY + colFraction * (MAX_XY - MIN_XY);
      var rowFraction = row / (numRows - 1) || 0;
      var y = MIN_XY + rowFraction * (MAX_XY - MIN_XY);

      jumpTo(spriteIdArg, {x: x, y: y});
    }
}

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

function README() {
  console.log("This is the README for the zParticlesModule Helper library");
  console.log("It includes the following global variables that can be used in validation: ");
  console.log("-- spriteIds - an array of the IDs of all sprites in use during this frame");
  console.log("-- animations - an array of the animations in use during this frame");
  console.log("-- eventLog - an array of the events that have occurred so far during the run of this level (not just this frame)");
  console.log("-- printLog - an array of the printed statements that have occurred so far during the run of this level (not just this frame)");
  console.log("-- soundLog - an array of the sounds that have occurred so far during the run of this level (not just this frame)");
  console.log("-- eventSpriteIds - an array of the sprite IDs that've had an event logged *this frame*. Events include: whenClick, whileClick, whenTouch, whileTouch, spriteCreated");
  console.log("-- spriteBehaviorsObj - an object whose keys are sprite Ids and whose values are getBehaviorsForSpriteId() for that sprite");
  console.log("It also includes the following helper functions:");
  console.log("-- getHelperVars() - regenerates the global vars above. This function is designed to be called just after worldFrame == 1 conditional, so it happens with every frame of the animation loop *and* before any validation checks have happened");
  console.log("-- setupPrevious() - creates a validationProps.previous object, which can be used to create a snapshot of global variables from the previous frame. This function is designed to be called within worldFrame == 1 conditional so it happens just once");
  console.log("-- updatePrevious() - stores the current global variables to the validationProps.previous object (ie: validationProps.previous.spriteIds). This function is designed to be called at the very end of the level validation, so it happens each frame of the animation *and* after all validation checks have happened.");
  particlesREADME();
}

/***************************************************
SPECIFIC HELPER CODE FOR VALIDATION (contains things specifically for this CSC module)
***************************************************/

validationProps.particlesValidation = {};
validationProps.particlesValidation.events = [];

function particlesREADME() {
  console.log("This library also includes validation helper objects that can be used when writing custom block functions");
  console.log("-- validationProps.particlesValidation is an object for any particles module specific helpers");
  console.log("-- validationProps.particlesValidation.events is an array for any particles module specific events");
}