//zFunctionMachine Validation Helper Library

// NEWSECTION
//# <a name="helperFunctions">Helper Functions</a>

/** Adds special variables to track specific behaviors with special function machine blocks
created in the [FunctionBlocks](https://levelbuilder-studio.code.org/pools/FunctionBlocks/blocks) pool. This function is designed to be called **just once, inside the if-statment** when writing validation code.
@example
if(World.frameCount == 1) {
  setFailTime(150);
  setDelayTime(90);
  setupPrevious();
  setupFunctionValidation(); // <-----------

  // addCriteria functions here

}
getHelperVars(); 
check();
updatePrevious();
updateFunctionValidation();
*/
function setupFunctionValidation() {
  if(typeof validationProps === 'undefined') {
    return false;
  }
  //Because validation code runs _after_ the code within a sprite lab level, an existing
  //function block may have already created these objects, so this checks to make sure
  //we don't accidentally overwrite them.
  if(!validationProps.functions) {
  	validationProps.functions = {};
  	validationProps.functions.blocks = [];
  }
  if(!validationProps.functions.previous) {
  	validationProps.functions.previous = {};
  	validationProps.functions.previous.blocks = [];
  }
  return true;
}

/** Keeps track of `previous` state of specific variables for the special function machine blocks. This function is designed to be called **every frame, outside the if-statement** when writing validation code.
@example
if(World.frameCount == 1) {
  setFailTime(150);
  setDelayTime(90);
  setupPrevious();
  setupFunctionValidation(); 

  // addCriteria functions here

}
getHelperVars(); 
check();
updatePrevious();
updateFunctionValidation(); // <-----------
*/
function updateFunctionValidation() {
  //Because of how object references work, need to do a deep copy of elements to keep previous updated
  validationProps.functions.previous.blocks = [];
  for(var i = 0; i < validationProps.functions.blocks.length; i++) {
    validationProps.functions.previous.blocks.push(validationProps.functions.blocks[i]);
  }
}

/** Checks if we're in a level that involves validation. This function is designed to be called **within the helper code for a custom block, _not_ in validation code itself**.
@return {boolean} true if we're in a level we want to validate and false otherwise. Does _not_ check if the zFunctionMachine helper library has been added to the level.
@see [addTwoBlock Custom Block](https://levelbuilder-studio.code.org/pools/FunctionBlocks/blocks/FunctionBlocks_addTwoBlock/edit)
@example
function addTwoBlock() {
  //For Validation
  if(typeof checkValidation === 'function' && checkValidation()) { // <-------------
    var newBlockObj = {
      blockName: 'addTwo',
      input: input
    };
    addFunctionBlock(newBlockObj);
  }
  //Function
  input = input + 2;
  output = input;
}
*/
function checkValidation() {
  //Check that we're in a level that we want to validate
  return typeof validationProps !== 'undefined';
}

/** Adds a new custom block to the special variable keeping track of things for the special function machine blocks. The block should be an object with properties, but the specific format can be whatever makes the most sense **as long as it's consistent**. This function is designed to be called **within the helper code for a custom block, _not_ in validation code itself**.
@param {object} blockObj - an object representing a custom block in this level.
@see [addTwoBlock Custom Block](https://levelbuilder-studio.code.org/pools/FunctionBlocks/blocks/FunctionBlocks_addTwoBlock/edit)
@example
function addTwoBlock() {
  //For Validation
  if(typeof checkValidation === 'function' && checkValidation()) {
    var newBlockObj = { // <---- this is the custom block object
      blockName: 'addTwo',
      input: input
    };
    addFunctionBlock(newBlockObj);  // <-------------
  }
  //Function
  input = input + 2;
  output = input;
}
*/
function addFunctionBlock(blockObj) {
  if(checkValidation()) {
    //These if-statements are for the case where a function block is added
    //to the 'When Run' block, which means it will try to add its block to the validation code
    //before the validation code has run.
    if(!validationProps.functions) {
      validationProps.functions = {};
    }
    if(!validationProps.functions.blocks) {
      validationProps.functions.blocks = [];
    }
    validationProps.functions.blocks.push(blockObj);
  }
}

// NEWSECTION
//# <a name="ValidationFunctions">Validation Functions</a>

/** Gets the current block log for the custom function machine blocks.
@return {array} An array of the blocks that have occurred so far in the level. Each element of the array is an object in a specific format.
@see [Click here for an example Level that uses this function](https://levelbuilder-studio.code.org/levels/42512)
@example
addCriteria(function() {
  var functionBlocks = getFunctionBlocks();
  return functionBlocks.length >= 1;
}, "noFunctionBlocks");
*/
function getFunctionBlocks() {
  if(checkValidation()) {
    return validationProps.functions.blocks;
  }
}

/** Checks if a new function machine block was used with an event.
@return {boolean} True if the function machine block was used with an event, false otherwise
@see [Click here for an example Level that uses this function](https://levelbuilder-studio.code.org/levels/42512)
@example
addCriteria(function() {
  //Check if the first sprite had an event that caused a function block to run
  return checkThisSpriteClickedThisFrame(spriteIds[0]) && checkNewFunctionBlockThisFrame();
}, "noFunctionBlocks");
*/
function checkNewFunctionBlockThisFrame() {
  if(checkNewEventThisFrame() || checkPromptUpdatedThisFrame()) {
    // If we're here: a new event happened this frame
    // Now check that the function block array also grew in size compared to the previous frame
    if(validationProps.functions.blocks.length > validationProps.functions.previous.blocks.length) {
      return true;
    }
  }
  return false;
}

/** Gets the most recent function block object that occurred
@return {Object} The function block object, which always has a `blockName` property but the other properties may vary based on the block.
@example
addCriteria(function() {
  //Check if a represent block had an input of 5 was added to a 'when run' block
  var block = getMostRecentFunctionBlock();
  return block.blockName == "represent" && block.input == 5;
}, "wrongRepresentBlock");
@example
addCriteria(function() {
  //Check if a represent block had an input of 5 was added to a click event
  var block = getMostRecentFunctionBlock();
  return checkNewFunctionBlockThisFrame() && block.blockName == "represent" && block.input == 5;
}, "noRepresentWithClick");
*/
function getMostRecentFunctionBlock() {
  return validationProps.functions.blocks[validationProps.functions.blocks.length - 1];
}

/** Checks if a specific function machine block was used with an event.
@param {String} blockName - the name of the block. Must be the same as the hard-coded name used when creating block objects within the block helper function (see addFunctionBlock() for an example)
@return {boolean} True if the function machine block was used with an event, false otherwise
@example
addCriteria(function() {
  //Check if the first sprite caused a represent block to trigger
  return checkThisSpriteClickedThisFrame(spriteIds[0]) && checkThisFunctionBlockThisFrame("represent");
}, "noFunctionBlocks");
*/
function checkThisFunctionBlockThisFrame(blockName) {
  if(checkNewFunctionBlockThisFrame()) {
    // If we're here: a new function block happened this frame
    // Now check that it's the function block we want
    var block = getMostRecentFunctionBlock();
    return block.blockName == blockName;
  }
  return false;
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
function drawHandsOnUnclickedSprites(spriteId){
  if(World.seconds < 1){
    return;
  }
  if(!validationProps.clickedSprites) {
    validationProps.clickedSprites = [];
  }
  //for(var i=0;i<spriteIds.length;i++){
    var foundClick=false;
    for(var j=0;j<eventLog.length;j++){
      if(eventLog[j].includes(spriteId)){
        foundClick=true;
        if(validationProps.clickedSprites.indexOf(spriteId)==-1){
          validationProps.clickedSprites.push(spriteId);
        }
      }
    }
    if(!foundClick){
      drawRings(getProp({id: spriteId}, "x"),400-getProp({id: spriteId}, "y"));
      drawHand(getProp({id: spriteId}, "x"),400-getProp({id: spriteId}, "y"));
    }
  //}
}

