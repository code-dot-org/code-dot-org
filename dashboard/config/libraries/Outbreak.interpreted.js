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
var RECOVERY_TIME = 250;

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
/* ------------------------- END OF LIBRARY LOGIC ------------------------- */


/* --------------- START OF BLOCKS API : Engineering Owned --------------- */
function setupOutbreak(numMonsters, callback) {
  var percentSick = 10;
  var numSick = Math.round(percentSick * 0.01 * numMonsters);
  makeNumSprites(numMonsters - numSick, "healthy");
  makeNumSprites(numSick, "sick");
  getSick({costume: "sick"}, "sick");
  setProp({costume: "all"}, "scale", 25);
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

/* --------------- START OF HELPER FUNCTIONS : Engineering Owned --------------- */
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
/* -------------------------- END OF HELPER FUNCTIONS -------------------------- */