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
  validationProps.functions = {};
  validationProps.functions.events = [];
  validationProps.functions.previous = {};
  validationProps.functions.previous.events = [];
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
  validationProps.functions.previous.events = validationProps.functions.events;
}

/** Checks if we're in a level that involves validation. This function is designed to be called **within the helper code for a custom block, _not_ in validation code itself**.
@return {boolean} true if we're in a level we want to validate and has the `zFunctionMachine` helper library imported, and false otherwise
@see [addTwoBlock Custom Block](https://levelbuilder-studio.code.org/pools/FunctionBlocks/blocks/FunctionBlocks_addTwoBlock/edit)
@example
function addTwoBlock() {
  //For Validation
  if(typeof checkValidation === 'function' && checkValidation()) { // <-------------
    var newEventObj = {
      blockName: 'addTwo',
      input: input
    };
    addFunctionEvent(newEventObj);
  }
  //Function
  input = input + 2;
  output = input;
}
*/
function checkValidation() {
  //Check that we're in a level that we want to validate
  if(typeof validationProps === 'undefined') {
    return false;
  }
  //Check that we've imported the zFunctionMachine library which sets up this validation object
  if(validationProps.functions == false) {
    return false;
  }
  return true;
}

/** Adds a new custom event to the special variable keeping track of things for the special function machine blocks. The event should be an object with properties, but the specific format can be whatever makes the most sense **as long as it's consistent**. This function is designed to be called **within the helper code for a custom block, _not_ in validation code itself**.
@param {object} eventObj - an object representing a custom event for the custom blocks in this level.
@see [addTwoBlock Custom Block](https://levelbuilder-studio.code.org/pools/FunctionBlocks/blocks/FunctionBlocks_addTwoBlock/edit)
@example
function addTwoBlock() {
  //For Validation
  if(typeof checkValidation === 'function' && checkValidation()) {
    var newEventObj = { // <---- this is the custom event object
      blockName: 'addTwo',
      input: input
    };
    addFunctionEvent(newEventObj);  // <-------------
  }
  //Function
  input = input + 2;
  output = input;
}
*/
function addFunctionEvent(eventObj) {
  if(checkValidation()) {
    if(validationProps.functions.events) {
      validationProps.functions.events.push(eventObj);
    }
  }
}

// NEWSECTION
//# <a name="ValidationFunctions">Validation Functions</a>

/** Gets the current event log for the special function events created from custom function machine blocks**.
@return {array} An array of the events that have occurred so far in the level. Each element of the array is an object in a specific format.
@example
if(World.frameCount == 1) {
  setFailTime(150);
  setDelayTime(90);
  setupPrevious();
  setupFunctionValidation();

  // addCriteria functions here
  addCriteria(function() {
    var functionEvents = getFunctionEvents(); // <------------
    return functionEvents.length >= 1;
  }, "noFunctionBlocks");

}
getHelperVars();
check();
updatePrevious();
updateFunctionValidation();
*/
function getFunctionEvents() {
  if(checkValidation()) {
    return validationProps.functions.events;
  }
}
