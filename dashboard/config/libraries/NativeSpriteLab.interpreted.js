var extraArgs = null;
var other = [];

function draw() {
  executeDrawLoopAndCallbacks();
  for (var i = 0; i < other.length; i++) {
    other[i]();
  }
}

/* Legacy code only. Do not add any new code below here */
function clickedOn(spriteId, callback) {
  spriteClicked('when', spriteId, callback);
}

function draggable() {
  return {func: draggableFunc(), name: 'draggable'};
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

// Setup sim
function setupSim(
  s1number,
  s1costume,
  s1speed,
  s2number,
  s2costume,
  s2speed,
  s3number,
  s3costume,
  s3speed
) {
  World.s1ToCollect = [];
  World.s2ToCollect = [];
  World.sprite1score = 0;
  World.sprite2score = 0;

  // Wandering behavior at a certain speed, will be added to both s1 and s2 sprites.
  function movementBehavior(speed) {
    return function(spriteId) {
      if (randomNumber(0, 5) == 0) {
        changePropBy(spriteId, 'direction', randomNumber(-25, 25));
      }
      moveForward(spriteId, speed);
      if (isTouchingEdges(spriteId)) {
        edgesDisplace(spriteId);
        changePropBy(spriteId, 'direction', randomNumber(135, 225));
      }
    };
  }

  // We don't allow certain list functions in the interpreter apparently, so writing my own.
  function removeFromList(list, item) {
    var newList = [];
    for (var removeCounter = 0; removeCounter < list.length; removeCounter++) {
      if (list[removeCounter] != item) {
        newList.push(list[removeCounter]);
      }
    }
    return newList;
  }
  function listIncludes(list, item) {
    for (var includesCounter = 0; includesCounter < list.length; includesCounter++) {
      if (list[includesCounter] == item) {
        return true;
      }
    }
    return false;
  }

  // Initialize sprites
  var counter_i = 0;
  for (counter_i = 0; counter_i < s1number; counter_i++) {
    makeNewSpriteAnon(s1costume, randomLocation());
  }
  addBehaviorSimple({costume: s1costume}, new Behavior(movementBehavior(s1speed)));

  for (counter_i = 0; counter_i < s2number; counter_i++) {
    makeNewSpriteAnon(s2costume, randomLocation());
  }
  addBehaviorSimple({costume: s2costume}, new Behavior(movementBehavior(s2speed)));

  for (counter_i = 0; counter_i < s3number; counter_i++) {
    makeNewSpriteAnon(s3costume, randomLocation());
  }
  setProp({costume: s3costume}, 'scale', 50);


  // We want to be able to randomize which sprite gets the point in the case of a tie. So the approach here is
  // to use checkTouching() to detect all the collisions, but delay until the next frame to actually give a point
  // and remove the s3 sprite. I'm using World.s1ToCollect and World.s2ToCollect to keep track of which sprite ids
  // will be removed the following frame. Then if there's a tie (ie. s2 wants to remove a sprite id that's already
  // in World.s1ToCollect or vice versa), use randomNumber(0,1) to give the sprite a 50-50 chance of "stealing" the
  // s3 sprite.
  // Then to actually remove the s3 sprites and keep track of the score, I'm using a behavior. I have the behavior
  // attached to sprite id 0, but it doesn't really matter which sprite (as long as it's not an s3 sprite that
  // might get deleted). A behavior is just the simplest way to add a snippet of code that will get executed each frame.
  // The behavior basically just tallies the score and deletes the sprites from the previous frame, then checks
  // whether the simulation should end. The one-frame delay isn't really noticeable since frames are so fast.

  checkTouching('while', {costume: s1costume}, {costume: s3costume}, function(extraArgs) {
    if (listIncludes(World.s1ToCollect, extraArgs.target)) {
      // another s1 is also touching. Either way, s1 gets the point, but only count once, so don't add it again.
    } else if (listIncludes(World.s2ToCollect, extraArgs.target)) {
      // an s2 is also touching. We should decide randomly whether s1 or s2 gets the point.
      if (randomNumber(0, 1) == 1) {
        // s1 wins the coin toss, so remove from s2ToCollect and add to s1ToCollect
        World.s1ToCollect.push(extraArgs.target);
        World.s2ToCollect = removeFromList(World.s2ToCollect, extraArgs.target);
      }
    } else {
      // no other sprite is touching
      World.s1ToCollect.push(extraArgs.target);
    }
  });

  checkTouching('while', {costume: s2costume}, {costume: s3costume}, function(extraArgs) {
    if (listIncludes(World.s2ToCollect, extraArgs.target)) {
      // another s2 is also touching. Either way, s2 gets the point, but only count once, so don't add it again.
    } else if (listIncludes(World.s1ToCollect, extraArgs.target)) {
      // an s1 is also touching. We should decide randomly whether s1 or s2 gets the point.
      if (randomNumber(0, 1) == 1) {
        // s2 wins the coin toss, so remove from s1ToCollect and add to s2ToCollect
        World.s2ToCollect.push(extraArgs.target);
        World.s1ToCollect = removeFromList(World.s1ToCollect, extraArgs.target);
      }
    } else {
      // no other sprite is touching
      World.s2ToCollect.push(extraArgs.target);
    }
  });

  function collectBehavior() {
    for (var s1ToDelete_i = 0; s1ToDelete_i < World.s1ToCollect.length; s1ToDelete_i++) {
      World.sprite1score += 1;
      printText(s1costume + ' has collected ' + World.sprite1score);
      destroy({id: World.s1ToCollect[s1ToDelete_i]});
    }
    World.s1ToCollect = [];
    for (var s2ToDelete_i = 0; s2ToDelete_i < World.s2ToCollect.length; s2ToDelete_i++) {
      World.sprite2score += 1;
      printText(s2costume + ' has collected ' + World.sprite2score);
      destroy({id: World.s2ToCollect[s2ToDelete_i]});
    }
    World.s2ToCollect = [];
    checkSimulationEnd();
  }
  // We just need to run collectBehavior() each tick, doesn't actually matter which sprite it's attached to,
  // as long as it's not one of the s3 sprites that might get destroyed at some point.
  addBehaviorSimple({id: 0}, new Behavior(collectBehavior));

  function checkSimulationEnd() {
    if (countByAnimation(s3costume) === 0) {
      destroy({costume: s1costume});
      destroy({costume: s2costume});
      printText('The simulation has ended after ' + World.seconds + ' seconds');
      printText(s1costume + ' has collected ' + World.sprite1score);
      printText(s2costume + ' has collected ' + World.sprite2score);
    }
  }
}
