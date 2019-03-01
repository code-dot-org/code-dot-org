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
var customText = [];
var customTextHidden = false;
var animationGroups = {};
var thisSprite;
var otherSprite;

function initialize(setupHandler) {
  setupHandler();
}

// Behaviors
function addBehavior(sprite, behavior) {
  if(sprite && behavior) {
    behavior = normalizeBehavior(behavior);
    if(findBehavior(sprite, behavior) === -1) {
      sprite.behaviors.push(behavior);
    }
  }
}

function removeBehavior(sprite, behavior) {
  if(sprite && behavior) {
    behavior = normalizeBehavior(behavior);
    var index = findBehavior(sprite, behavior);
    if(index >= 0) {
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
  this.checkTerminate = function() {return false;};
  this.timeStarted = new Date().getTime();
  this.duration = Number.MAX_VALUE;
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

// New
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

// Updated
function whenPressedAndReleased(direction, pressedHandler, releasedHandler) {
  inputEvents.push({type: keyWentDown, event: pressedHandler, param: direction});
  inputEvents.push({type: keyWentUp, event: releasedHandler, param: direction});
}

// Updated
function clickedOn(condition, sprite, event) {
  if(condition === "when") {
  	inputEvents.push({type: whenSpriteClicked, event: event, param: sprite});
  } else {
  	inputEvents.push({type: mousePressedOver, event: event, param: sprite});
  }
}

// New
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

// Updated
function setAnimation(sprite, animation) {
  var setOneAnimation = function(sprite) {
    sprite.setAnimation(animation);
    sprite.scale /= sprite.baseScale;
    sprite.baseScale = 100 / Math.max(100,
                                      sprite.animation.getHeight(),
                                      sprite.animation.getWidth());
    sprite.scale *= sprite.baseScale;
    addToAnimationGroup(sprite);
  };
  if(!Array.isArray(sprite)) {
    // If the sprite already has an animation, remove that sprite from the animation group.
    if(sprite.getAnimationLabel()) {
      removeFromAnimationGroup(sprite, sprite.getAnimationLabel());
    }
  	setOneAnimation(sprite);
  } else {
    if(sprite.length > 0) {
      // If first sprite already has an animation, delete that animation group (everyone is leaving).
      if(sprite[0].getAnimationLabel()) {
        delete animationGroups[sprite[0].getAnimationLabel()];
      }
      sprite.forEach(function(s) { setOneAnimation(s); });
    }
  }
}

// New
function addToAnimationGroup(sprite) {
  var animation = sprite.getAnimationLabel();
  if(animationGroups.hasOwnProperty(animation)) {
     animationGroups[animation].push(sprite);
  } else {
    animationGroups[animation] = [sprite];
  }
}

// New
function removeFromAnimationGroup(sprite, oldAnimation) {
  var array = animationGroups[oldAnimation];
  var index = array.indexOf(sprite);
  array.splice(index, 1);
  if(animationGroups[oldAnimation].length < 1) {
    delete animationGroups[oldAnimation];
  }
}

// Updated
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
  sprite.collidable = false; //new
  sprite.collisionObjects = []; //new
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

// New
function runSpriteBehaviors() {
  sprites.forEach(function (sprite) {
    sprite.behaviors.forEach(function (behavior) {
      var timeElapsed = new Date().getTime() - behavior.timeStarted;
      if(behavior.checkTerminate() || timeElapsed >= behavior.duration) {
        removeBehavior(sprite, behavior);
      } else {
        behavior.func.apply(null, [sprite].concat(behavior.extraArgs));
      }
    });
  });
}

// New
function runCallbacks() {
  callbacks.forEach(function (callback) {
    callback();
  });
}

// New
function runInputEvents() {
  var eventType;
  var event;
  var param;
  for (var i = 0; i < inputEvents.length; i++) {
    eventType = inputEvents[i].type;
    event = inputEvents[i].event;
    param = typeof inputEvents[i].param === "function" ?
      inputEvents[i].param() :
      inputEvents[i].param;
    if(!Array.isArray(param)) {
      if(eventType(param)) {
        thisSprite = param;
        event();
      }
    } else {
      for(var j = 0; j < param.length; j++) {
        if(eventType(param[j])) {
          thisSprite = param[j];
          event();
        }
      }
    }
  }
}

// Updated
function runCollisionEvents() {
  collisionEvents.forEach(function(event) {
    var condition = event.condition;
    var a = event.a();
    var b = event.b();
    var e = event.event;
    var type;
    var collisionSubjects = [];
    var findCollisionObject = function(sprite, collisionObject) {
      for(var i = 0; i < sprite.collisionObjects.length; i++) {
      	if(sprite.collisionObjects[i].sprite === collisionObject) {
          return i;
        }
      }
      return -1;
    };
    var addCollisionObjects = function(a, b) {
      if(findCollisionObject(a, b) === -1) {
        a.collisionObjects.push({sprite: b, event: event, locked: false});
      }
      if(collisionSubjects.indexOf(a) === -1) {
        collisionSubjects.push(a);
      }
    };
    if(a && b) {
      if(!Array.isArray(a) && !Array.isArray(b)) {
        addCollisionObjects(a, b);
      } else if(Array.isArray(a) && !Array.isArray(b)) {
        a.forEach(function(s) {
          addCollisionObjects(s, b);
        });
      } else if(!Array.isArray(a) && Array.isArray(b)) {
        b.forEach(function(s) {
          addCollisionObjects(a, s);
        });
      } else {
        a.forEach(function(s) {
          b.forEach(function(p) {
          	addCollisionObjects(s, p);
          });
        });
      }
      collisionSubjects.forEach(function(s) {
        var relevantCollisionObjects = s.collisionObjects.filter(function(obj) {
          return obj.event === event;
        });
        relevantCollisionObjects.forEach(function(obj) {
          type = s.collidable && obj.sprite.collidable ? "collide" : "overlap";
      	  if(s[type](obj.sprite)) {
            if(!obj.locked) {
              thisSprite = s;
              otherSprite = obj.sprite;
              e();
              if(condition === "when") {
                obj.locked = true;
              }
            }
          } else {
          	obj.locked = false;
          }
        });
      });
    }
  });
}

// New
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

// New
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

// New
function printCustomText() {
  customText.forEach(function(textObj) {
    var timeElapsed = new Date().getTime() - textObj.timeStarted;
    if(textObj.duration > 0 && timeElapsed >= textObj.duration) {
      customText.splice(customText.indexOf(textObj), 1);
    } else {
      fill(textObj.color());
      textAlign(CENTER);
      textSize(textObj.size());
      text(textObj.text(), textObj.location().x, textObj.location().y);
    }
  });
}

// Updated
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
  if(!customTextHidden) {
    printCustomText();
  }
}