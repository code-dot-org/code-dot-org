/* -------------- START OF CONSTANTS- Curriculum Owned -------------- */
var RECOVERY_TIME = 250;
var RECOVERY_BAR_HEIGHT = 5;
var PERCENT_SICK_AT_SETUP = 10;
var SPRITE_SIZE = 25;
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

function layoutSprites(format) {
  // TODO: Implement layoutSprites
  console.log(format);
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
  addMonsterBehavior(socialDistancingBehavior);
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