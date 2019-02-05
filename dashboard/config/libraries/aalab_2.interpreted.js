/* This file is only executed within JSInterpreter */

/* global
 *
 * CENTER,
 * World,
 * background,
 * createEdgeSprites,
 * createGroup,
 * createSprite,
 * drawSprites,
 * edges,
 * fill,
 * keyDown,
 * keyWentDown,
 * keyWentUp,
 * mousePressedOver,
 * mouseWentDown,
 * randomNumber,
 * rect,
 * text,
 * textAlign,
 * textSize,
*/

createEdgeSprites();
var inputEvents = [];
var collisionEvents = [];
var callbacks = [];
var loops = [];
var sprites = [];
var score = 0;
var game_over = false;
var show_score = false;
var title = '';
var subTitle = '';
var costumeGroups = {};

function initialize(setupHandler) {
  setupHandler();
}

// Behaviors
function addBehavior(sprite, behavior) {
  if(sprite && behavior) {
    behavior = normalizeBehavior(behavior);
    if(findBehavior(sprite, behavior) >= 0) {
      sprite.behaviors.push(behavior);
    }
  }
}

function removeBehavior(sprite, behavior) {
  if(sprite && behavior) {
    behavior = normalizeBehavior(behavior);
    if(findBehavior(sprite, behavior) >= 0) {
      sprite.behaviors.splice(index, 1);
    }
  }
}

function Behavior(func, extraArgs) {
  if (!extraArgs) {
    extraArgs = [];
  }
  this.func = func;
  this.extraArgs = extraArgs;
}

function normalizeBehavior(behavior) {
  if (typeof behavior === 'function')  {
    return new Behavior(behavior);
  }
  return behavior;
}

function findBehavior(sprite, behavior) {
  for (var i = 0; i < sprite.behaviors.length; i++) {
    var myBehavior = sprite.behaviors[i];
    if (behaviorsEqual(behavior, myBehavior)) {
      return i;
    }
  }
  return -1;
}

function behaviorsEqual(behavior1, behavior2) {
  // These are legacy behaviors, check for equality based only on the name.
  if (behavior1.func.name && behavior2.func.name) {
    return behavior1.func.name === behavior2.func.name;
  }
  if (behavior1.func !== behavior2.func) {
    return false;
  }
  if (behavior2.extraArgs.length !== behavior1.extraArgs.length) {
    return false;
  }
  var extraArgsEqual = true;
  for (var j = 0; j < behavior1.extraArgs.length && extraArgsEqual; j++) {
    if (behavior2.extraArgs[j] !== behavior1.extraArgs[j]) {
      extraArgsEqual = false;
    }
  }
  return extraArgsEqual;
}

//Events

// Aaron: I did some work here to clean things up.

function keyPressed(condition, key, event) {
  if(condition === "when") {
    inputEvents.push({type: keyWentDown, event: event, param: key});
  } else {
    inputEvents.push({type: keyDown, event: event, param: key});
  }
}

function whenMouseClicked(event) {
  inputEvents.push({type: mouseWentDown, event: event, param: 'leftButton'});
}

function whenPressedAndReleased(direction, pressedHandler, releasedHandler) {
  inputEvents.push({type: keyWentDown, event: pressedHandler, param: direction});
  inputEvents.push({type: keyWentUp, event: releasedHandler, param: direction});
}

function clickedOn(condition, sprite, event) {
  if(condition === "when") {
    if(!Array.isArray(sprite)) {
      inputEvents.push({type: whenSpriteClicked, event: event, param: sprite});
    } else {
      sprite.forEach(function(s) {
      	inputEvents.push({type: whenSpriteClicked, event: event, param: s});
      });
    }
  } else {
    if(!Array.isArray(sprite)) {
      inputEvents.push({type: mousePressedOver, event: event, param: sprite});
    } else {
      sprite.forEach(function(s) {
      	inputEvents.push({type: mousePressedOver, event: event, param: s});
      });
    }
  }
}

// New input event types (see above)
function whenSpriteClicked(sprite) {
  return mouseWentDown("leftButton") && mouseIsOver(sprite);
}

function spriteDestroyed(sprite, event) {
  inputEvents.push({type: isDestroyed, event: event, param: sprite});
}

function whenTouching(a, b, event) {
  collisionEvents.push({a: a, b: b, event: event});
}

function whileTouching(a, b, event) {
  collisionEvents.push({a: a, b: b, event: event, keepFiring: true});
}

function whenStartAndStopTouching(a, b, startHandler, stopHandler) {
  collisionEvents.push({a: a, b: b, event: startHandler, eventEnd: stopHandler});
}

// Loops
function repeatWhile(condition, loop) {
  loops.push({'condition': condition, 'loop': loop});
}

function forever(loop) {
  loops.push({'condition': function () {return true;}, 'loop': loop});
}

// Draw loop callbacks
function register(callback) {
  callbacks.push(callback);
}

// Sprite and Group creation
function makeNewSpriteLocation(animation, loc) {
  return makeNewSprite(animation, loc.x, loc.y);
}

function setAnimation(sprite, animation) {
  sprite.setAnimation(animation);
  sprite.scale /= sprite.baseScale;
  sprite.baseScale = 100 / Math.max(
    100,
    sprite.animation.getHeight(),
    sprite.animation.getWidth()
  );
  sprite.scale *= sprite.baseScale;
}

function makeNewSprite(animation, x, y) {
  var sprite = createSprite(x, y);
  sprite.baseScale = 1;
  if (animation) {
    setAnimation(sprite, animation);
  }
  sprites.push(sprite);
  sprite.speed = 10;
  sprite.patrolling = false;
  sprite.things_to_say = [];
  sprite.behaviors = [];
  sprite.setSpeed = function (speed) {
    sprite.speed = speed;
  };
  sprite.moveUp = function () {
    sprite.y = sprite.y - sprite.speed;
  };
  sprite.moveDown = function () {
    sprite.y = sprite.y + sprite.speed;
  };
  sprite.moveLeft = function () {
    sprite.x = sprite.x - sprite.speed;
  };
  sprite.moveRight = function () {
    sprite.x = sprite.x + sprite.speed;
  };
  sprite.jump = function () {
    sprite.velocityY = -7;
  };
  sprite.setTint = function (color) {
    sprite.tint = color;
  };
  sprite.removeTint = function () {
    sprite.tint = null;
  };
  sprite.setPosition = function (position) {
    if (position === "random") {
      sprite.x = randomNumber(50, 350);
      sprite.y = randomNumber(50, 350);
    } else {
      sprite.x = position.x;
      sprite.y = position.y;
    }
  };
  sprite.setScale = function (scale) {
    sprite.scale = scale * sprite.baseScale;
  };
  sprite.getScale = function () {
    return sprite.scale / sprite.baseScale;
  };
  sprite.say = function (text, time) {
    time = time || 50;
    sprite.things_to_say.push([text, time]);
  };
  sprite.stop_say = function () {
    sprite.things_to_say = [];
  };
  return sprite;
}

function makeNewGroup() {
  var group = createGroup();
  group.addBehaviorEach = function (behavior) {
    for (var i = 0; i < group.length; i++) {
      addBehavior(group[i], behavior);
    }
  };
  group.destroy = group.destroyEach;
  return group;
}

// Helper functions
function randomLoc() {
  return randomNumber(50, 350);
}

function setBackground(color) {
  World.background_color = color;
}

function showScore() {
  show_score = true;
}

function endGame() {
  game_over = true;
}

function isDestroyed(sprite) {
  return World.allSprites.indexOf(sprite) === -1;
}

function showTitleScreen(titleArg, subTitleArg) {
  title = titleArg;
  subTitle = subTitleArg;
}

function hideTitleScreen() {
  title = subTitle = '';
}

function shouldUpdate() {
  return World.frameCount > 1;
}

function unitVectorTowards(from, to) {
  var angle = Math.atan2(to.y - from.y, to.x - from.x);
  return p5.Vector.fromAngle(angle);
}

// Run functions
function runSpriteBehaviors() {
  sprites.forEach(function (sprite) {
    sprite.behaviors.forEach(function (behavior) {
      behavior.func.apply(null, [sprite].concat(behavior.extraArgs));
    });
  });
}

function runCallbacks() {
  callbacks.forEach(function (callback) {
    callback();
  });
}

function runInputEvents() {
  var eventType;
  var event;
  var param;
  for (var i = 0; i < inputEvents.length; i++) {
    eventType = inputEvents[i].type;
    event = inputEvents[i].event;
    param = inputEvents[i].param;
    if (param && eventType(param)) {
      event();
    }
  }
}

function runCollisionEvents() {
  var createCollisionHandler = function (collisionEvent) {
    return function (sprite1, sprite2) {
      if (!collisionEvent.touching || collisionEvent.keepFiring) {
        collisionEvent.event(sprite1, sprite2);
      }
    };
  };
  for (var i = 0; i < collisionEvents.length; i++) {
    var collisionEvent = collisionEvents[i];
    var a = collisionEvent.a && collisionEvent.a();
    var b = collisionEvent.b && collisionEvent.b();
    if (a && b) {
      if (a.overlap(b, createCollisionHandler(collisionEvent))) {
        collisionEvent.touching = true;
      } else {
        if (collisionEvent.touching && collisionEvent.eventEnd) {
          collisionEvent.eventEnd(a, b);
        }
        collisionEvent.touching = false;
      }
    }
  }
}

function runLoops() {
  for (var i = 0; i < loops.length; i++) {
    var loop = loops[i];
    if (!loop.condition()) {
      loops.splice(i, 1);
    } else {
      loop.loop();
    }
  }
}

function updateHUDText() {
  if (show_score) {
    fill("black");
    textAlign(CENTER);
    textSize(20);
    text("Score: " + score, 0, 20, 400, 20);
  }
  if (game_over) {
    fill("black");
    textAlign(CENTER);
    textSize(50);
    text("Game Over", 200, 200);
  } else if (title) {
    fill("black");
    textAlign(CENTER);
    textSize(50);
    text(title, 200, 150);
    textSize(35);
    text(subTitle, 200, 250);
  }
}

function draw() {
  background(World.background_color || "white");
  runCallbacks();
  if (shouldUpdate()) {
    runSpriteBehaviors();
    runInputEvents();
    runCollisionEvents();
  }
  drawSprites();
  updateHUDText();
}
