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
  if(checkNewEventThisFrame()) {
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




