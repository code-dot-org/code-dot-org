var extraArgs = {};
var other = [];

function draw() {
  executeDrawLoopAndCallbacks();
  for (var i = 0; i < other.length; i++) {
    other[i]();
  }
}

/**
 * Must run in the interpreter, not natively, so that we can execute valueFn to get its value
 * and be able to use that value within beginCollectingData. If beginCollectingData ran natively,
 * calling valueFn would add a call into the interpreter on the call stack, but wouldn't execute
 * immediately, so we wouldn't be able to use the value from within beginCollectingData.
 */
function beginCollectingData(valueFn, label) {
  collectData(function() {
    printText(['Time: ',getTime("seconds"),' sec. | ', label || '', ': ', valueFn()].join(''));
  });
}


/**
 * Must run in the interpreter, not natively, so that callback executes before withPercentChance() returns,
 * rather than being added to the stack. For example, consider the following program:
 * var i = 10;
 * ifVarEquals(i, 10, function() {
 *   printText("first");
 * });
 * printText("second");
 *
 * If ifVarEquals() executed natively, the print statements would happen out of order.
 */
function ifVarEquals(variableName, value, callback) {
  if (variableName == value) {
    callback();
  }
}

/**
 * Must run in the interpreter, not natively, so that callback executes before withPercentChance() returns,
 * rather than being added to the stack. For example, consider the following program:
 * var i = 0;
 * for (var count = 0; count < 100; count++) {
 *   withPercentChance(50, function () {
 *     i = (typeof i == 'number' ? i : 0) + 1;
 *   });
 * }
 * printText(i)
 *
 * If withPercentChance() executed natively, i would still be 0 because the callbacks wouldn't have executed yet.
 * Instead, if we keep the whole execution within the interpreter, the callbacks will execute before printText(),
 * as expected.
 */

function withPercentChance(num, callback) {
  if (randomNumber(0, 100) < num) {
    callback();
  }
}

function withPercentChanceDropdown(num, callback) {
  withPercentChance(num, callback);
}

/* Legacy code only. Do not add any new code below here */
function clickedOn(spriteId, callback) {
  spriteClicked('when', spriteId, callback);
}

function draggable() {
  return {func: draggableFunc(), name: 'draggable'};
}

function avoidingTargets() {
  return {func: avoidingTargetsFunc(), name: 'avoiding targets'};
}

function followingTargets() {
  return {func: followingTargetsFunc(), name: 'following targets'};
}

function tumbling(spriteId) {
  var behavior = function(spriteId) {
    changePropBy(spriteId, 'rotation', -6);
    changePropBy(spriteId, 'x', -3);
  };
  return {func: behavior, name: 'tumbling'};
}

function patrollingUpDown(spriteId) {
  var behavior = function(spriteId) {
    if (getProp(spriteId, 'patrollingDirection') == undefined) {
      setProp(spriteId, 'patrollingDirection', 'up');
    }
    var patrollingDirection = getProp(spriteId, 'patrollingDirection');
    if (patrollingDirection == 'up') {
      changePropBy(spriteId, 'y', 6);
    }
    if (patrollingDirection == 'down') {
      changePropBy(spriteId, 'y', -6);
    }
    var y = getProp(spriteId, 'y');
    if (y <= 40) {
      setProp(spriteId, 'patrollingDirection', 'up');
    }
    if (y >= 360) {
      setProp(spriteId, 'patrollingDirection', 'down');
    }
  };
  return {func: behavior, name: 'patrollingUpDown'};
}

function pointInDirection(spriteId, direction) {
  if (direction == 'North') {
    setProp(spriteId, 'rotation', 360);
  } else if (direction == 'East') {
    setProp(spriteId, 'rotation', 90);
  } else if (direction == 'South') {
    setProp(spriteId, 'rotation', 180);
  } else if (direction == 'West') {
    setProp(spriteId, 'rotation', 270);
  } else {
    console.error('pointInDirection: invalid direction provided');
    return;
  }
}

function randColor() {
  return color(
    randomNumber(0, 255),
    randomNumber(0, 255),
    randomNumber(0, 255)
  ).toString();
}

function randomColor() {
  return randColor();
}

function mouseLocation() {
  return locationMouse();
}

function setSizes(spriteId, property, val) {
  setProp(spriteId, property, val);
}

function whenDownArrow(callback) {
  keyPressed('when', 'down', callback);
}

function whenKey(key, callback) {
  keyPressed('when', key, callback);
}

function whenLeftArrow(callback) {
  keyPressed('when', 'left', callback);
}

function whenRightArrow(callback) {
  keyPressed('when', 'right', callback);
}

function whenTouching(sprite1, sprite2, callback) {
  checkTouching('when', sprite1, sprite2, callback);
}

function whenUpArrow(callback) {
  keyPressed('when', 'up', callback);
}

function whileDownArrow(callback) {
  keyPressed('while', 'down', callback);
}

function whileKey(key, callback) {
  keyPressed('while', key, callback);
}

function whileLeftArrow(callback) {
  keyPressed('while', 'left', callback);
}

function whileRightArrow(callback) {
  keyPressed('while', 'right', callback);
}

function whileTouching(sprite1, sprite2, callback) {
  checkTouching('while', sprite1, sprite2, callback);
}

function whileUpArrow(callback) {
  keyPressed('while', 'up', callback);
}

function xLocationOf(spriteId) {
  return getProp(spriteId, 'x');
}

function yLocationOf(spriteId) {
  return getProp(spriteId, 'y');
}

//Mike's follow/avoid behavior blocks
function startFollowing(sprites,targets){
  addTarget(sprites, targets, "follow");
  addBehaviorSimple(sprites, followingTargets());
}

function stopFollowing(sprites){
  removeBehaviorSimple(sprites, followingTargets());
}

function startAvoiding(sprites,targets){
  addTarget(sprites, targets, "avoid");
  addBehaviorSimple(sprites, avoidingTargets());
}

function stopFollowing(sprites){
  removeBehaviorSimple(sprites, avoidingTargets());
}