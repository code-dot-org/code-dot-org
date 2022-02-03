var PLAYSPACE_SIZE = 400;	//replace var with const in GitHub
var EARLY_FAIL_TIME = 60;
var WAIT_TIME = 150;
var FAIL_COLOR = rgb(118,102,160);
var PASS_COLOR = rgb(0,173,188);
var CHALLENGE_PASS_COLOR = rgb(0,0,0);

//Helper Functions

/**
 * Category: SPRITE WORLD
 *
 * Sets successCriteria dictionary to input dictionary.
 */
function setSuccessCriteria(criteria){
  validationProps.successCriteria = criteria;
}

/**
 * Category: SPRITE WORLD
 *
 * Sets successTime if all success criteria
 * have been met.
 */
function setSuccessTime(criteria){
  if (!validationProps.successTime) {
    var success = true;
    for (var criterion in criteria) {
      if ((!criteria[criterion])) {
        success = false;
        break;
      }
    }
    if (success) {
      validationProps.successTime = World.frameCount;
    }
  }
}

/* Removed January 27, 2022
function drawProgress(state,currentTime,endTime){
  if(state=="fail"){
    fill(rgb(118,102,160));
  } else if (state=="pass"){
    fill(rgb(0,173,188));
  } else if (state=="challenge"){
	fill(rgb(0,World.frameCount*10%255,0));
  }
  rect(0,390,currentTime*400/endTime);
}
*/

/**
 * Category: HELLO WORLD
 *
 * Checks if there is at least one sprite.
 *
 * @return {boolean} Returns true if there is at least
 *         one sprite and false otherwise.
 */
function checkOneSprite(spriteIds){
  return spriteIds.length >= 1;
}

/**
 * Category: HELLO WORLD
 *
 * Checks if there are at least two sprites.
 *
 * @return {boolean} Returns true if there are at least
 *         two sprites and false otherwise.
 */
function checkTwoSprites(spriteIds){
  return spriteIds.length >= 2;
}

/**
 * Category: SPRITE LAB
 *
 * Checks if there are a specified minimum number of sprites.
 *
 * @return {boolean} Returns true if there are at least
 *         n sprites and false otherwise.
 */
function minimumSprites(spriteIds, n){
  return spriteIds.length >= n;
}

/**
 * Category: HELLO WORLD LEVEL
 *
 * Checks if the background was changed.
 *
 * @return {boolean} Returns true if the background
 *         was changed and false otherwise.
 */
function checkBackgroundChanged(){
  var background = getBackground();
  return background !== undefined && background !== "#ffffff";
}
/**
 * Category: HELLO WORLD
 *
 * Draws animated rings around object's inputted coordinates.
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


/**
 * Category: HELLO WORLD
 *
 * Draws hand pointing to object, given its coordinates.
 */
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

/**
 * Category: HELLO WORLD
 *
 * Checks for unclicked sprites, and show hand with rings 
 * at unclicked sprites.
 */
function checkForUnclickedSprites(spriteIds, eventLog){
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
 * Category: HELLO WORLD
 *
 * Checks the locations of all sprites.
 *
 * @return {boolean} Returns true if all sprites have 
 *         different locations and false otherwise.
 */
function checkSpriteLocations(spriteIds){
  var uniqueStartingSpriteLocations = [];
  for (var i=0; i<spriteIds.length; i++) {
    var coords = [getProp({id: spriteIds[i]}, "x"), getProp({id: spriteIds[i]}, "y")];
    var noDuplicateCoords = true;
    for (var j=0; j<uniqueStartingSpriteLocations.length; j++) {
      if ((coords[0] == uniqueStartingSpriteLocations[j][0]) &&
          (coords[1] == uniqueStartingSpriteLocations[j][1])){
        noDuplicateCoords = false;
        break;
      }
    }
    if (!noDuplicateCoords) {
      break;
    } else {
      uniqueStartingSpriteLocations.push(coords);
    }
  }

  if (spriteIds.length == uniqueStartingSpriteLocations.length) {
    return true;
  } else {
    return false;
  }
}

/**
 * Category: HELLO WORLD
 *
 * Checks the costumes of all sprites.
 *
 * @return {boolean} Returns true if all sprites have 
 *         different costumes and false otherwise.
 */
function checkSpriteCostumes(spriteIds){
  var uniqueStartingSpriteCostumes = [];
  for (var i=0; i<spriteIds.length; i++) {
    var costume = getProp({id: spriteIds[i]}, "costume");
    var noDuplicateCostumes = true;
    for (var j=0; j<uniqueStartingSpriteCostumes.length; j++) {
      if (costume == uniqueStartingSpriteCostumes[j]) {
        noDuplicateCostumes = false;
        break;
      }
    }
    if (!noDuplicateCostumes) {
      break;
    } else {
      uniqueStartingSpriteCostumes.push(costume);
    }
  }

  if (spriteIds.length == uniqueStartingSpriteCostumes.length) {
    return true;
  } else {
    return false;
  }
}

/**
 * Category: SPRITE LAB
 *
 * Checks the costumes of all sprites.
 *
 * @return {boolean} Returns true if all sprites have 
 *         the SAME costume and false otherwise.
 */
function checkMatchingSpriteCostumes(spriteIds){
  console.log(getAnimationsInUse());
  return getAnimationsInUse().length === 1;
}

/**
 * Category: HELLO WORLD
 *
 * Checks if sprites are touching.
 *
 * @return {boolean} Returns true if no sprites are
 *         touching and false otherwise.
 */
function checkSpritesTouching(spriteIds){
  for (var i=0; i<spriteIds.length; i++) {
    for (var j=i+1; j<spriteIds.length; j++) {
      if (isTouchingSprite({id: spriteIds[i]}, {id: spriteIds[j]})) {
        setProp({id: spriteIds[i]}, "debug", true);
        setProp({id: spriteIds[j]}, "debug", true);
        return false;
      }
    }
  }
  return true;
}

/**
 * Category: HELLO WORLD LEVEL
 *
 * Checks if any sprite has active speech.
 *
 * @return {boolean} Returns true if any sprite has
 *         active speech and false otherwise.
 */
function checkActiveSpeech(spriteIds){
  for (var spriteId in spriteIds) {
    if(getSpeechForSpriteId(spriteId)){
      return true;
    }
  }
  return false;
}

/**
 * Category: SPRITE WORLD (not used in Hello World)
 *
 * Checks if new event occurred in playspace.
 *
 * @return {boolean} Returns true if new event
 *         occurred and false otherwise.
 */
function checkForNewEvent(eventLog, prevEventLogLength){
  if (eventLog.length > prevEventLogLength) {
    return true;
  } else {
    return false;
  }
}

/**
 * Category: SPRITE WORLD (not used in Hello World)
 *
 * Checks if new click event occurred in playspace.
 *
 * @return {boolean} Returns true if new click
 *         event occurred and false otherwise.
 */
function checkForNewClickEvent(eventLog, prevEventLogLength){
  if (eventLog.length > prevEventLogLength) {
    var currentEvent = eventLog[eventLog.length - 1];
    if (currentEvent.includes("whenClick: ") || currentEvent.includes("whileClick: ")) {
      return true;
    }
  }
  return false;
}

/**
 * Category: HELLO WORLD
 *
 * Checks if a sprite was clicked in current frame.
 *
 * @return {boolean} Returns true if a sprite was
 *         clicked and false otherwise.
 */
function checkSpriteClicked(eventLog, prevEventLogLength){
  if (eventLog.length > prevEventLogLength) {
    var currentEvent = eventLog[eventLog.length - 1];
    var clickedSpriteId = parseInt(currentEvent.split(" ")[1]);
    if ((currentEvent.includes("whenClick: ") || currentEvent.includes("whileClick: ")) &&
        clickedSpriteId) {
      return true;
    }
  }
  return false;
}

/**
 * Category: HELLO WORLD
 *
 * Checks if a sprite was clicked in current frame and, if yes, returns that spriteId.
 *
 * @return {int} Returns spriteId of the sprite that was
 *         clicked and -1 otherwise.
 */
function getClickedSpriteId(eventLog, prevEventLogLength){
  if (eventLog.length > prevEventLogLength) {
    var currentEvent = eventLog[eventLog.length - 1];
    var clickedSpriteId = parseInt(currentEvent.split(" ")[1]);
    if (currentEvent.includes("whenClick: ") || currentEvent.includes("whileClick: ")) {
      return clickedSpriteId;
    }
  }
  return -1;
}

/**
 * Category: SPRITE WORLD (not used in Hello World)
 *
 * Checks if a clicked sprite causes some sprite to speak in the frame.
 *
 * @return {boolean} Returns true if a clicked sprite
 *         caused speech and false otherwise.
 */
function checkSpriteSay(eventLog, prevEventLogLength){
  // TODO: don't know if first if statement this should be in every event check method......
  var spriteIds = getSpriteIdsInUse();
  if (eventLog.length > prevEventLogLength) {
    var currentEvent = eventLog[eventLog.length - 1];
    if (currentEvent.includes("whenClick: ") || currentEvent.includes("whileClick: ")) {
      //var spriteIds = getSpriteIdsInUse(); Removed January 27, 2022
      for (var spriteId in spriteIds) {
        if (getSpeechForSpriteId(spriteId) && spriteSpeechRenderedThisFrame(spriteId)) {
          // clicked sprite caused speech in some sprite
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Category: HELLO WORLD
 *
 * Checks if a clicked sprite causes some sprite to speak in the frame and, if true, 
 * returns spriteId that was clicked.
 *
 * @return {int} Returns spriteId of the sprite that was clicked and caused speech in some sprite,
 *		  		 -2 if a sprite was clicked but didn't cause speech,
 *				 and -1 otherwise.
 */
function getClickedSpriteIdCausedSpeech(eventLog, prevEventLogLength){
  // TODO: don't know if first if statement this should be in every event check method......
  if (eventLog.length > prevEventLogLength) {
    var currentEvent = eventLog[eventLog.length - 1];
    var clickedSpriteId = parseInt(currentEvent.split(" ")[1]);
    if (currentEvent.includes("whenClick: ") || currentEvent.includes("whileClick: ")) {
      var spriteIds = getSpriteIdsInUse();
      for (var spriteId in spriteIds) {
        if (getSpeechForSpriteId(spriteId) && spriteSpeechRenderedThisFrame(spriteId)) {
          // clicked sprite caused speech in some sprite
          return clickedSpriteId;
        }
      }
      return -2;
    }
  }
  return -1;
}

/**
 * Checks if there is at least one sprite.
 *
 * @return {boolean} Returns true if there is at least
 *         one sprite and false otherwise.
 */
function checkOneSprite(spriteIds){
  return spriteIds.length>=1;
}

/**
 * Checks if there are at least two sprites.
 *
 * @return {boolean} Returns true if there are at least
 *         two sprites and false otherwise.
 */
function checkTwoSprites(spriteIds){
  return spriteIds.length>=2;
}

/**
 * Checks if the background was changed.
 *
 * @return {boolean} Returns true if the background
 *         was changed and false otherwise.
 */
function checkBackgroundChanged(){
  var background = getBackground();
  return background !== undefined && background !== "#ffffff";
}



/**
 * Checks for unclicked sprites, and show hand with rings
 *
 * @return 
 */
function checkForUnclickedSprites(spriteIds, eventLog){
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
 * Category: SPRITE WORLD
 *
 * Draws progress bar in playspace based on status.
 * 
 * @param {string} status Keyword representing the current state
 *                 of the level (i.e. pass, fail, challenge, etc.).
 */
function drawProgressBar(status){
  push();
  stroke("white");

  switch (status) {
    case "earlyFail":
      fill(FAIL_COLOR);
      rect(0,PLAYSPACE_SIZE - 10,(World.frameCount*PLAYSPACE_SIZE/EARLY_FAIL_TIME),10);
      break;
    case "fail":
      fill(FAIL_COLOR);
      rect(0,PLAYSPACE_SIZE - 10,(World.frameCount*PLAYSPACE_SIZE/WAIT_TIME),10);
      break;
    case "pass":
      fill(PASS_COLOR);
      rect(0,PLAYSPACE_SIZE - 10,((World.frameCount-validationProps.successTime)*PLAYSPACE_SIZE/WAIT_TIME),10);
      break;
    case "newEventFail":
      fill(FAIL_COLOR);
      rect(0,PLAYSPACE_SIZE - 10,((World.frameCount-validationProps.vars.delay)*PLAYSPACE_SIZE/WAIT_TIME),10);
      break;
    case "newEventPass":
      fill(PASS_COLOR);
      rect(0,PLAYSPACE_SIZE - 10,((World.frameCount-validationProps.vars.delay)*PLAYSPACE_SIZE/WAIT_TIME),10);
      break;
    case "challengePass":
    //Do something for challengePass
  }

  pop();
}

/**
 * Category: SPRITE WORLD
 *
 * Uses delay variable logic to determine which progress bar to draw
 * in the playspace.
 */
function determineAndDrawProgressBar(successTime, delay){
  //console.log("delay: " + delay);
  if (!successTime) {
    if (delay && delay > 0) {
      drawProgressBar("newEventFail");
    } else {
      drawProgressBar("fail");
    }
  } else {
    if (delay && delay > 0) {
      drawProgressBar("newEventPass");
    } else {
      drawProgressBar("pass");
    }
  }
}