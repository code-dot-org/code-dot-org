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
var console_queue = [];
var animationGroups = {};
var emptyGroup = makeNewGroup();
var thisSprite;
var otherSprite;

function initialize(setupHandler) {
  setupHandler();
}

// Behaviors
function addBehavior(sprite, behavior) {
  if (sprite && behavior) {
    behavior = normalizeBehavior(behavior);
    singleOrGroup(sprite, function(sprite, behavior) {
      if (findBehavior(sprite, behavior) === -1) {
        sprite.behaviors.push(behavior);
      }
    }, [behavior]);
  }
}

function addBehaviorSimple(sprite, behavior) {
  if (sprite && behavior) {
    addBehavior(sprite, behavior, behavior.name);
  }
}

function removeBehavior(sprite, behavior) {
  if (sprite && behavior) {
    behavior = normalizeBehavior(behavior);
    singleOrGroup(sprite, function(sprite, behavior) {
      var index = findBehavior(sprite, behavior);
      if (index >= 0) {
        sprite.behaviors.splice(index, 1);
      }
    }, [behavior]);
  }
}

function removeBehaviorSimple(sprite, behavior) {
  if (sprite && behavior) {
    removeBehavior(sprite, behavior, behavior.name);
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

function keyPressed(condition, key, event) {
  if (condition === "when") {
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

function clickedOn(sprite, event) {
  touchEvents.push({type: mousePressedOver, event: event, sprite: sprite});
}

function spriteClicked(condition, sprite, event) {
  if (condition === "when") {
  	inputEvents.push({type: whenSpriteClicked, event: event, param: sprite});
  } else {
  	inputEvents.push({type: mousePressedOver, event: event, param: sprite});
  }
}

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

function checkTouching(condition, a, b, event) {
  collisionEvents.push({condition: condition, a: a, b: b, event: event});
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

function makeNewSpriteAnon(animationName, location) {
  if (!location) {
    location = {x: 200, y: 200};
  } else if(typeof location === "function") {
    location = location();
  }
  var newSprite = makeNewSprite(animationName, location.x, location.y);
  return newSprite;
}

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
  if (!Array.isArray(sprite)) {
    // If the sprite already has an animation, remove that sprite from the animation group.
    if (sprite.getAnimationLabel()) {
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

// Costume-based groups
function addToAnimationGroup(sprite) {
  var animation = sprite.getAnimationLabel();
  if(!animationGroups.hasOwnProperty(animation)) {
    animationGroups[animation] = makeNewGroup();
  }
  animationGroups[animation].add(sprite);
}

function removeFromAnimationGroup(sprite, oldAnimation) {
  animationGroups[oldAnimation].remove(sprite);
}

function allSpritesWithAnimation(animationName) {
  if(animationGroups.hasOwnProperty(animationName)) {
    return animationGroups[animationName];
  }
  return emptyGroup;
}

// Run a sprite action regardless of individual or group
function singleOrGroup(sprite, func, args) {
  if (!sprite) {
    return;
  }
  if (!sprite.isGroup) {
    func.apply(this, [sprite].concat(args));
  } else {
    sprite.forEach(function(s) {
      func.apply(this, [s].concat(args));
    });
  }
}

function makeNewSprite(animation, x, y) {
  var sprite = createSprite(x, y);
  sprite.baseScale = 1;
  if (animation) {
    setAnimation(sprite, animation);
  }
  sprites.push(sprite);
  sprite.name = sprite.getAnimationLabel(); // ToDo: if sprite is assigned a variable, use it here
  sprite.speed = 10;
  sprite.patrolling = false;
  sprite.things_to_say = [];
  sprite.behaviors = [];
  sprite.collidable = false;
  sprite.collisionObjects = [];
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
  sprite.say = function (text) {
    console_queue.push({sprite: sprite, txt: text, time: millis() + 2000});
  };
  sprite.stop_say = function () {
    sprite.things_to_say = [];
  };

  sprite.isGroup = false;
  return sprite;
}

function makeNewGroup() {
  var group = createGroup();
  group.addBehaviorEach = function (behavior) {
    for (var i = 0; i < group.length; i++) {
      addBehavior(group[i], behavior);
    }
  };

  // Map sprite methods to group each methods
  group.destroy = group.destroyEach;
  group.setTint = group.setTintEach;
  group.setScale = group.setScaleEach;
  group.setVisible = group.setVisibleEach;

  group.say = function (text) {
    console_queue.push({sprite: group.get(0), txt: text, time: millis() + 2000});
  };

  group.collisionObjects = [];

  // Used to determine whether referencing individual sprite or group
  group.isGroup = true;
  return group;
}

// Sprite actions
function setProp(sprite, property, val) {
  if (!sprite || val === undefined) {
    return;
  }
  singleOrGroup(sprite, function(sprite, property, val) {
    if (property == "scale") {
      sprite.setScale(val / 100);
    }
    else if (property=="costume") {
      sprite.setAnimation(val);
    } else if (property=="tint" && typeof(val)=="number") {
      sprite.tint = "hsb(" + (Math.round(val) % 360) + ", 100%, 100%)";
    } else if (property=="y" && typeof(val)=="number") {
      sprite.y = 400-val;
    } else {
    sprite[property]=val;
    }
  }, [property, val]);
}

function getProp(sprite, property) {
  if (!sprite) {
    return undefined;
  }
  // Unclear how getters should function with groups. For now just use first element
  if (sprite.isGroup) {
    return getProp(sprite.get(0), property);
  }
  if (property=="scale") {
    return sprite.getScale() * 100;
  } else if (property=="costume") {
   	return sprite.getAnimationLabel();
  } else if (property=="direction") {
   	return getDirection(sprite);
  } else if (property=="y") {
   	return 400-sprite.y;
  } else {
  	return sprite[property];
  }
}

function changePropBy(sprite,  property, val) {
  if (!sprite || val === undefined) {
    return;
  }
  singleOrGroup(sprite, function (sprite, property, val) {
    if (property == "scale") {
      sprite.setScale(sprite.getScale() + val / 100);
      if (sprite.scale < 0) {
        sprite.scale = 0;
      }
    }
    else if (property=="direction") {
      sprite.direction = getDirection(sprite) + val;
    } else if (property=="y"){
      sprite.y-=val;
    }else {
    sprite[property] += val;
    }
  }, [property, val]);
}

function getDirection(sprite) {
  // Unclear how getters should function with groups. For now just use first element
  if (sprite.isGroup) {
    return getDirection(sprite.get(0));
  }
  if (!sprite.hasOwnProperty("direction")) {
    sprite.direction = 0;
  }
  return sprite.direction % 360;
}

function moveInDirection(sprite, distance, direction) {
  singleOrGroup(sprite, function (sprite, distance, direction) {
    if (direction === "North") {
      sprite.y-=distance;
    }
 	else if (direction === "East") {
      sprite.x+=distance;
 	}
    else if (direction === "South") {
      sprite.y+=distance;
    }
	else if (direction === "West") {
      sprite.x-=distance;
    }
    else {
      console.error("moveInDirection: invalid direction provided");
    }
  }, [distance, direction]);
}

function moveToward(sprite, distance, direction) {
  singleOrGroup(sprite, function(sprite, distance, direction) {
    var vector = unitVectorTowards(sprite, direction);
    sprite.position.add(vector.mult(distance));
  }, [distance, direction]);
}

function moveForward(sprite, distance) {
  singleOrGroup(sprite, function(sprite, distance) {
  	var direction = getDirection(sprite);
    sprite.x += distance * Math.cos(direction * Math.PI / 180);
    sprite.y += distance * Math.sin(direction * Math.PI / 180);
  }, [distance]);
}

function jumpTo(sprite,location) {
  singleOrGroup(sprite, function(sprite, location) {
    sprite.x = location.x;
    sprite.y = location.y;
  }, [location]);
}

function mirrorSprite(sprite, direction) {
  singleOrGroup(sprite, function(sprite, direction) {
    if (direction == "right") {
      sprite.mirrorX(1);
    } else {
      sprite.mirrorX(-1);
    }
  }, [direction]);
}

function turn(sprite, n, direction) {
  if (!sprite || n === undefined) {
    return;
  }
  singleOrGroup(sprite, function(sprite, n, direction) {
    if (direction=="right") {
      sprite.rotation+=n;
    }
    else {
      sprite.rotation-=n;
    }
  }, [n, direction]);
}

function debugSprite(sprite, val) {
  singleOrGroup(sprite, function(sprite, val) {
  	sprite.debug = val;
  }, [val]);
}

// Helper functions

function printText(text) {
  console_queue.push({txt: text, time: millis() + 2000});
}

function randomLoc() {
  return randomNumber(50, 350);
}

function setBackground(color) {
  World.background_color = color;
}

function setBackgroundImage(img) {
  World.background_image = loadImage(img);
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

// Draw loop functions

function drawBackground() {
  background(World.background_color || "white");
  if (typeof(World.background_image) === "object") {
    image(World.background_image);
  }
}

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

function runCollisionEvents() {
  collisionEvents.forEach(function(event) {
    var condition = event.condition;
    var a = event.a();
    var b = event.b();
    var e = event.event;
    var type;
    var collisions = [];
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
      if(collisions.indexOf(a) === -1) {
        collisions.push(a);
      }
    };
    if(a && b) {

      // This feels unnecessarily complicated - we should be able to use group collisions
      // to deal with this more elegantly
      if(!a.isGroup && !b.isGroup) {
        addCollisionObjects(a, b);
      } else if(a.isGroup && !b.isGroup) {
        a.forEach(function(s) {
          addCollisionObjects(s, b);
        });
      } else if(!a.isGroup && b.isGroup) {
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

      addCollisionObjects(a, b);
      collisions.forEach(function(s) {
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

// Text display functions

// Temporary RPG-like console display
function printConsoleText() {
    if (console_queue.length > 0) {
    var txt = "";
    var time = millis();
    for (var j = 0; j<console_queue.length; j++) {
      var line = console_queue[j];
      if (line.hasOwnProperty("sprite")) {
        txt = txt + line.sprite.getAnimationLabel() + ": ";
      }
      txt += line.txt;
      if (j < (console_queue.length - 1)) {
        txt += '\n';
      }
      if (time > line.time) {
        console_queue.splice(console_queue.indexOf(line), 1);
      }
    }
    push();
    fill(200, 200, 200, 127);
    noStroke();
    var h = Math.min((console_queue.length * 15), 100) + 10;
    rect(0, 0, World.width, h);
    fill("black");
    textAlign(BOTTOM, LEFT);
    text(txt, 5, 5, World.width - 10, h);
    pop();
  }
}

// V1 text output
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

// Experimental timed text output
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

// The draw loop!
function draw() {
  drawBackground();
  runCallbacks();
  if (shouldUpdate()) {
    runSpriteBehaviors();
    runInputEvents();
    runCollisionEvents();
  }
  drawSprites();
  updateHUDText();
  printCustomText();
  printConsoleText();
}