/***************************************************
HELPER CODE FOR BLOCKS
***************************************************/

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


//zParticlesModule Validation Helper Library

// NEWSECTION
//# <a name="helperFunctions">Helper Functions</a>

/** Adds special variables to track specific behaviors with special particles blocks
created in the [ParticlesBlocks](https://levelbuilder-studio.code.org/pools/ParticlesBlocks/blocks) pool. This function is designed to be called **just once, inside the if-statment** when writing validation code.
@example
if(World.frameCount == 1) {
  setFailTime(150);
  setDelayTime(90);
  setupPrevious();
  setupParticlesValidation(); // <-----------

  // addCriteria functions here

}
getHelperVars(); 
check();
updatePrevious();
updateParticlesValidation();
*/
function setupParticlesValidation() {
  if(typeof validationProps === 'undefined') {
    return false;
  }
  //Because validation code runs _after_ the code within a sprite lab level, an existing
  //function block may have already created these objects, so this checks to make sure
  //we don't accidentally overwrite them.
  if(!validationProps.particles) {
  	validationProps.particles = {};
  	validationProps.particles.blocks = [];
  }
  if(!validationProps.particles.previous) {
  	validationProps.particles.previous = {};
  	validationProps.particles.previous.blocks = [];
  }
  return true;
}

/** Keeps track of `previous` state of specific variables for the special particles blocks. This function is designed to be called **every frame, outside the if-statement** when writing validation code.
@example
if(World.frameCount == 1) {
  setFailTime(150);
  setDelayTime(90);
  setupPrevious();
  setupParticlesValidation(); 

  // addCriteria functions here

}
getHelperVars(); 
check();
updatePrevious();
updateParticlesValidation(); // <-----------
*/
function updateParticlesValidation() {
  //Because of how object references work, need to do a deep copy of elements to keep previous updated
  validationProps.particles.previous.blocks = [];
  for(var i = 0; i < validationProps.particles.blocks.length; i++) {
    validationProps.particles.previous.blocks.push(validationProps.particles.blocks[i]);
  }
}

/** Checks if we're in a level that involves validation. This function is designed to be called **within the helper code for a custom block, _not_ in validation code itself**.
@return {boolean} true if we're in a level we want to validate and false otherwise. Does _not_ check if the zParticlesModule helper library has been added to the level.
@see [statesOfMatter Custom Block](https://levelbuilder-studio.code.org/pools/ParticlesBlocks/blocks/ParticlesBlocks_statesOfMatter2/edit)
@example
function statesOfMatter2(costume, behaviorStr) {
    //For Validation
    if(typeof checkValidation === 'function' && checkValidation()) { // <---------
      var newBlockObj = {
        blockName: 'statesOfMatter',
        costume: costume,
        matter: behaviorStr
      };
      addParticlesBlock(newBlockObj);
    }
	//Function
	// Code omitted for brevity 
}
*/
function checkValidation() {
  //Check that we're in a level that we want to validate
  return typeof validationProps !== 'undefined';
}

/** Adds a new custom block to the special variable keeping track of things for the special particles blocks. The block should be an object with properties, but the specific format can be whatever makes the most sense **as long as it's consistent**. This function is designed to be called **within the helper code for a custom block, _not_ in validation code itself**.
@param {object} blockObj - an object representing a custom block in this level.
@see [statesOfMatter Custom Block](https://levelbuilder-studio.code.org/pools/ParticlesBlocks/blocks/ParticlesBlocks_statesOfMatter2/edit)
@example
function statesOfMatter2(costume, behaviorStr) {
    //For Validation
    if(typeof checkValidation === 'function' && checkValidation()) {
      var newBlockObj = { // <----- new block object
        blockName: 'statesOfMatter',
        costume: costume,
        matter: behaviorStr
      };
      addParticlesBlock(newBlockObj); <------
    }
	//Function
	// Code omitted for brevity 
}
*/
function addParticlesBlock(blockObj) {
  if(checkValidation()) {
    //These if-statements are for the case where a function block is added
    //to the 'When Run' block, which means it will try to add its block to the validation code
    //before the validation code has run.
    if(!validationProps.particles) {
      validationProps.particles = {};
    }
    if(!validationProps.particles.blocks) {
      validationProps.particles.blocks = [];
    }
    validationProps.particles.blocks.push(blockObj);
  }
}

// NEWSECTION
//# <a name="ValidationFunctions">Validation Functions</a>

/** Gets the current block log for the custom particles blocks.
@return {array} An array of the blocks that have occurred so far in the level. Each element of the array is an object in a specific format.
@see [Click here for an example level that uses this function](https://levelbuilder-studio.code.org/levels/42619)
@example
addCriteria(function() {
  var particlesBlocks = getParticlesBlocks();
  return particlesBlocks.length >= 1;
}, "noParticlesBlocks");
*/
function getParticlesBlocks() {
  if(checkValidation()) {
    return validationProps.particles.blocks;
  }
}

/** Checks if a new particles block was used with an event.
@return {boolean} True if the particles block was used with an event, false otherwise
@see [Click here for an example level that uses this function](https://levelbuilder-studio.code.org/levels/42650/)
@example
addCriteria(function() {
  //Check if the first sprite had an event that caused a particles block to run
  return checkThisSpriteClickedThisFrame(spriteIds[0]) && checkNewParticlesBlockThisFrame();
}, "noParticlesBlocks");
*/
function checkNewParticlesBlockThisFrame() {
  if(checkNewEventThisFrame()) {
    // If we're here: a new event happened this frame
    // Now check that the particles block array also grew in size compared to the previous frame
    if(validationProps.particles.blocks.length > validationProps.particles.previous.blocks.length) {
      return true;
    }
  }
  return false;
}

/** Gets the most recent particles block object that occurred
@return {Object} The particles block object, which always has a `blockName` property but the other properties may vary based on the block.
@see [Click here for an example level that uses this function](https://levelbuilder-studio.code.org/levels/42650/)
@example
addCriteria(function() {
  //Check if a statesOfMatter block was set to a gas behavior
  var block = getMostRecentParticlesBlock();
  return block.blockName == "statesOfMatter" && block.matter == "gas";
}, "wrongStateOfMatter");
@example
addCriteria(function() {
  //Check if a statesOfMatter block was set to a gas behavior when a sprite was clicked
  var block = getMostRecentParticlesBlock();
  return checkNewParticlesBlockThisFrame() && block.blockName == "statesOfMatter" && block.matter == "gas";
}, "noParticlesBlockWithClick");
*/
function getMostRecentParticlesBlock() {
  return validationProps.particles.blocks[validationProps.particles.blocks.length - 1];
}

/** Checks if a specific particles block was used with an event.
@param {String} blockName - the name of the block. Must be the same as the hard-coded name used when creating block objects within the block helper function (see addParticlesBlock() for an example)
@return {boolean} True if the particles block was used with an event, false otherwise
@example
addCriteria(function() {
  //Check if the first sprite caused a represent block to trigger
  return checkThisSpriteClickedThisFrame(spriteIds[0]) && checkThisParticlesBlockThisFrame("statesOfMatter");
}, "noParticlesBlocks");
*/
function checkThisParticlesBlockThisFrame(blockName) {
  if(checkNewParticlesBlockThisFrame()) {
    // If we're here: a new function block happened this frame
    // Now check that it's the function block we want
    var block = getMostRecentParticlesBlock();
    return block.blockName == blockName;
  }
  return false;
}