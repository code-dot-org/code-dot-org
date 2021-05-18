/* -------------- START OF CONSTANTS- Curriculum Owned -------------- */
var RECOVERY_TIME = 250;
var RECOVERY_BAR_HEIGHT = 5;
var PERCENT_SICK_AT_SETUP = 10;
var SPRITE_SIZE = 25;
// min and max coordinates to prevent sprites from going off the edge
var MIN_XY = SPRITE_SIZE / 2 + 5;
var MAX_XY = 400 - MIN_XY;
/* --------------- END OF CONSTANTS- Curriculum Owned --------------- */

/* -------------- START OF CALCULATED CONSTANTS - Engineering Owned --------------*/
var ANIMATION_WIDTH = 280; // from animationJson
var ANIMATION_HEIGHT = 290; // from animationJson
var BASE_SCALE = 100 / Math.max(ANIMATION_WIDTH, ANIMATION_HEIGHT);
var SPRITE_WIDTH = ANIMATION_WIDTH * BASE_SCALE * SPRITE_SIZE / 100;
var SPRITE_HEIGHT = ANIMATION_HEIGHT * BASE_SCALE * SPRITE_SIZE / 100;
/* --------------- END OF CALCULATED CONSTANTS - Engineering Owned ---------------*/

/* -------------- START OF MONSTER BEHAVIOR DEFINITIONS- Curriculum Owned -------------- */
function congregatingBehavior(spriteIdArg) {
  var speed = getProp(spriteIdArg, "speed") || 1;
  var targetX = 200 + randomNumber(-20, 20);
  var targetY = 200 + randomNumber(-20, 20);
  moveToward(spriteIdArg, speed, {x: targetX, y: targetY});
}

function quarantiningBehavior(spriteIdArg) {
  var isSick = getProp(spriteIdArg, "sick");
  if (isSick) {
    removeBehaviorSimple(spriteIdArg, new Behavior(congregatingBehavior, []));
    removeBehaviorSimple(spriteIdArg, new Behavior(wanderingBehavior, []));
    //added this 
    addTarget({costume: "all"}, "all", "avoid");
  	addBehaviorSimple({costume: "sick"}, avoidingTargets());
  }
}

function socialDistancingBehavior(spriteIdArg) {
  var speed = getProp(spriteIdArg, "speed") || 1;
  moveToward(spriteIdArg, -speed, locationOf({costume: "all"}));
  edgesDisplace(spriteIdArg);
}

function wanderingBehavior(spriteIdArg) {
  var speed = getProp(spriteIdArg, "speed") || 1;
  if (randomNumber(0, 5) == 0) {
    changePropBy(spriteIdArg, "direction", randomNumber(-25, 25));
  }
  moveForward(spriteIdArg, speed);
  if (isTouchingEdges(spriteIdArg)) {
    edgesDisplace(spriteIdArg);
    changePropBy(spriteIdArg, "direction", randomNumber(135, 225));
  }
}

function recoveringBehavior(spriteIdArg) {
  var isSick = getProp(spriteIdArg, "sick");
  if (isSick) {
    var currentRecovery = getProp(spriteIdArg, "recovery");
    if (currentRecovery == 0) {
      getHealthy(spriteIdArg);
    } else {
      setProp(spriteIdArg, "recovery", currentRecovery - 1);
    }
  }
}
/* ------------------------ END OF MONSTER BEHAVIOR DEFINITIONS ------------------------ */


/* --------------- START OF LIBRARY LOGIC- Curriculum Owned --------------- */
function getSickWithProbability(spriteIdArg, probability) {
  if (randomNumber(0, 100) < probability) {
    getSick(spriteIdArg);
  }
}

checkTouching("when", {costume: "healthy"}, {costume: "sick"}, function (extraArgs) {
  getSickWithProbability({id: extraArgs.subjectSprite}, 100);
});

checkTouching("when", {costume: "healthy_mask"}, {costume: "sick"}, function (extraArgs) {
  getSickWithProbability({id: extraArgs.subjectSprite}, 75);
});

checkTouching("when", {costume: "healthy"}, {costume: "sick_mask"}, function (extraArgs) {
  getSickWithProbability({id: extraArgs.subjectSprite}, 50);
});

checkTouching("when", {costume: "healthy_mask"}, {costume: "sick_mask"}, function (extraArgs) {
  getSickWithProbability({id: extraArgs.subjectSprite}, 37.5);
});

repeatForever(function () {
  addRecoveryBars();
});
/* ------------------------- END OF LIBRARY LOGIC ------------------------- */


/* --------------- START OF BLOCKS API - Engineering Owned --------------- */
function setupOutbreak(numMonsters, callback) {
  var numSick = Math.round(PERCENT_SICK_AT_SETUP * 0.01 * numMonsters);
  setDefaultSpriteSize(SPRITE_SIZE);
  makeNumSprites(numMonsters - numSick, "healthy");
  makeNumSprites(numSick, "sick");
  getSick({costume: "sick"});
  callback();
}

function layoutBorder() {
  var spriteIds = getSpriteIdsInUse();
  var count = spriteIds.length;

  // Layout monster in each corner first
  if (count > 0) {
    jumpTo({id: spriteIds[0]}, {x: MIN_XY, y: MIN_XY});
  }
  if (count > 1) {
    jumpTo({id: spriteIds[1]}, {x: MAX_XY, y: MIN_XY});
  }
  if (count > 2) {
    jumpTo({id: spriteIds[2]}, {x: MIN_XY, y: MAX_XY});
  }
  if (count > 3) {
    jumpTo({id: spriteIds[3]}, {x: MAX_XY, y: MAX_XY});
  }

  // Fill in the sides with however many monsters are left
  if (count > 4) {
    var topCount = Math.ceil((count - 4 - 0) / 4);
    var rightCount = Math.ceil((count - 4 - 1) / 4);
    var bottomCount = Math.ceil((count - 4 - 2) / 4);
    var leftCount = Math.ceil((count - 4 - 3) / 4);
    var i, frac;

    for (i = 0; i < topCount; i++) {
      // add 1 to i and count to account for the sprites in the corners
      frac = (i + 1) / (topCount + 1);
      jumpTo(
        {id: spriteIds[4 + i]},
        {x: MIN_XY + frac * (MAX_XY - MIN_XY), y: MIN_XY}
      );
    }

    for (i = 0; i < rightCount; i++) {
      // add 1 to i and count to account for the sprites in the corners
      frac = (i + 1) / (rightCount + 1);
      jumpTo(
        {id: spriteIds[4 + topCount + i]},
        {x: MAX_XY, y: MIN_XY + frac * (MAX_XY - MIN_XY)}
      );
    }

    for (i = 0; i < bottomCount; i++) {
      // add 1 to i and count to account for the sprites in the corners
      frac = (i + 1) / (bottomCount + 1);
      jumpTo(
        {id: spriteIds[4 + topCount + rightCount + i]},
        {x: MIN_XY + frac * (MAX_XY - MIN_XY), y: MAX_XY}
      );
    }

    for (i = 0; i < leftCount; i++) {
      // add 1 to i and count to account for the sprites in the corners
      frac = (i + 1) / (leftCount + 1);
      jumpTo(
        {id: spriteIds[4 + topCount + rightCount + bottomCount + i]},
        {x: MIN_XY, y: MIN_XY + frac * (MAX_XY - MIN_XY)}
      );
    }
  }
}

function layoutClusters(clusterSize) {
  var spriteIds = getSpriteIdsInUse();
  var count = spriteIds.length;
  var numClusters = Math.ceil(count / clusterSize);
  for (var i = 0; i < numClusters; i++) {
    var clusterX = randomNumber(MIN_XY, MAX_XY);
    var clusterY = randomNumber(MIN_XY, MAX_XY);
    for (var j = 0; j < clusterSize; j++) {
      var spriteId = spriteIds[i * clusterSize + j];
      jumpTo(
        {id: spriteId},
        {x: clusterX + randomNumber(-10, 10), y: clusterY + randomNumber(-10, 10)}
      );
    }
  }
}

function layoutGrid() {
  var spriteIds = getSpriteIdsInUse();
  var count = spriteIds.length;
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

function layoutRandom() {
  var spriteIds = getSpriteIdsInUse();
  for (var i = 0; i < spriteIds.length; i++) {
    jumpTo({id: spriteIds[i]}, randomLocation());
  }
}

function setSpeed(speed) {
  setProp({costume: "all"}, "speed", speed);
}

function beginCongregating() {
  addMonsterBehavior(congregatingBehavior);
}

function beginQuarantining() {
  addMonsterBehavior(quarantiningBehavior);
}

function beginSocialDistancing() {
  //addMonsterBehavior(socialDistancingBehavior);
  addTarget({costume: "all"}, "all", "avoid");
  addBehaviorSimple({costume: "all"}, avoidingTargets());
  //addMonsterBehavior(avoidingTargets());
}

function beginWandering() {
  addMonsterBehavior(wanderingBehavior);
}

function beginWearingMasks() {
  setProp({costume: "all"}, "mask", true);
  setAnimation({costume: "healthy"}, "healthy_mask");
  setAnimation({costume: "sick"}, "sick_mask");
}

function stopMoving() {
  removeBehaviorSimple({costume: "all"}, new Behavior(congregatingBehavior, []));
  removeBehaviorSimple({costume: "all"}, new Behavior(socialDistancingBehavior, []));
  removeBehaviorSimple({costume: "all"}, new Behavior(wanderingBehavior, []));
}
/* -------------------------- END OF BLOCKS API -------------------------- */

/* --------------- START OF HELPER FUNCTIONS - Engineering Owned --------------- */
function getSick(spriteIdArg) {
  setProp(spriteIdArg, "sick", true);
  var isWearingMask = getProp(spriteIdArg, "mask");
  var newAnimation = isWearingMask ? "sick_mask" : "sick";
  setAnimation(spriteIdArg, newAnimation);

  setProp(spriteIdArg, "recovery", RECOVERY_TIME);
  addBehaviorSimple(spriteIdArg, new Behavior(recoveringBehavior, []));
}

function getHealthy(spriteIdArg) {
  setProp(spriteIdArg, "sick", false);
  var isWearingMask = getProp(spriteIdArg, "mask");
  var newAnimation = isWearingMask ? "healthy_mask" : "healthy";
  setAnimation(spriteIdArg, newAnimation);

  removeBehaviorSimple(spriteIdArg, new Behavior(recoveringBehavior, []));
}

function addMonsterBehavior(behaviorFunc) {
  addBehaviorSimple({costume: "all"}, new Behavior(behaviorFunc, []));
}

function addRecoveryBars() {
  push();
  var spriteIds = getSpriteIdsInUse();
  for (var i = 0; i < spriteIds.length; i++) {
    var spriteIdArg = {id: spriteIds[i]};
    var isSick = getProp(spriteIdArg, "sick");
    if (!isSick) {
      continue;
    }
    var spriteX = getProp(spriteIdArg, "x");
    var spriteY = 400 - getProp(spriteIdArg, "y");
    var recovery = getProp(spriteIdArg, "recovery");

    var barWidth = 0.65 * SPRITE_WIDTH;
    var barY = spriteY - (SPRITE_HEIGHT / 2) - RECOVERY_BAR_HEIGHT * 1.5;
    var percentFilled = 1 - recovery / RECOVERY_TIME;

    fill("white");
    rect(spriteX - barWidth / 2, barY, barWidth, RECOVERY_BAR_HEIGHT);

    if (percentFilled > 0) {
      fill("lime");
      rect(spriteX - barWidth / 2, barY, percentFilled * barWidth, RECOVERY_BAR_HEIGHT);
    }
  }
  pop();
}
/* -------------------------- END OF HELPER FUNCTIONS -------------------------- */