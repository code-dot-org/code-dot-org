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

//This exists for backcompat purposes with the first release of SpriteLab.
//This version of the block is no longer provided, but it may exist in student code.
function clickedOn(sprite, event) {
  inputEvents.push({type: whenSpriteClicked, event: event, param: sprite});
}

function spriteClicked(condition, sprite, event) {
  if (condition === "when") {
  	inputEvents.push({type: whenSpriteClicked, event: event, param: sprite});
  } else {
  	inputEvents.push({type: mousePressedOver, event: event, param: sprite});
  }
}

function spriteClickedSet(condition, sprite, clicked, event) {
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
  if (!sprite.isGroup) {
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

function countByCostume(animationName) {
  return allSpritesWithAnimation(animationName).length;
}

/**
 * Given a group with an abitrary number of sprites, arrange them in a particular
 * layout. This is likely to change some or all of position/rotation/scale for
 * the sprites in the group.
 */
function layoutSprites(animation, format) {
  group = allSpritesWithAnimation(animation);

  // Begin by resizing the entire group.
  // group.forEach(sprite => this.setProp(sprite, 'scale', 30));

  var count = group.length;
  var minX = 20;
  var maxX = 400 - minX;
  var minY = 35;
  var maxY = 400 - 40;
  var radiansToDegrees = 180 / Math.PI;
  var maxCircleRadius = 165;
  var i, sprite, pct, radius, maxRadius, numRings;

  if (format === "circle") {
    // Adjust radius of circle and size of the sprite according to number of
    // sprites in our group.
    pct = constrain(count / 10, 0, 1);
    radius = lerp(50, maxCircleRadius, pct);
    var scale = lerp(0.8, 0.3, pct * pct);
    var startAngle = -Math.PI / 2;
    var deltaAngle = 2 * Math.PI / count;

    group.forEach(function (sprite, i) {
      var angle = deltaAngle * i + startAngle;
      sprite.x = 200 + radius * Math.cos(angle);
      sprite.y = 200 + radius * Math.sin(angle);
      sprite.rotation = (angle - startAngle) * radiansToDegrees;
    });
  } else if (format === 'plus') {
    pct = constrain(count / 10, 0, 1);
    maxRadius = lerp(50, maxCircleRadius, pct);
    numRings = Math.ceil(count / 4);
    group.forEach(function (sprite, i) {
      var ring = Math.floor(i / 4) + 1;
      var angle = [
        -Math.PI / 2, // above
        Math.PI / 2,  // below
        -Math.PI,     // left
        0             // right
      ][i % 4];
      var ringRadius = lerp(0, maxRadius, ring / numRings);

      sprite.x = 200 + ringRadius * Math.cos(angle);
      sprite.y = 200 + ringRadius * Math.sin(angle);
      sprite.rotation = 0;
    });
  } else if (format === 'x') {
    pct = constrain(count / 10, 0, 1);
    // We can have a bigger radius here since we're going to the corners.
    maxRadius = lerp(0, Math.sqrt(2 * maxCircleRadius * maxCircleRadius), pct);
    numRings = Math.ceil(count / 4);
    group.forEach(function (sprite, i) {
      var ring = Math.floor(i / 4) + 1;
      var angle = [
        -Math.PI / 4 + -Math.PI / 2,
        -Math.PI / 4 + Math.PI / 2,
        -Math.PI / 4 + 0,
        -Math.PI / 4 + -Math.PI,
      ][i % 4];
      var ringRadius = lerp(0, maxRadius, ring / numRings);

      sprite.x = 200 + ringRadius * Math.cos(angle);
      sprite.y = 200 + ringRadius * Math.sin(angle);
      sprite.rotation = (angle + Math.PI / 2) * radiansToDegrees;
    });
  } else if (format === "grid") {
    // Create a grid where the width is the square root of the count, rounded up,
    // and the height is the number of rows needed to fill in count cells.
    // For our last row, we might have empty cells in our grid (but the row
    // structure will be the same).
    var numCols = Math.ceil(Math.sqrt(count));
    var numRows = Math.ceil(count / numCols);
    group.forEach(function (sprite, i) {
      var row = Math.floor(i / numCols);
      var col = i % numCols;
      // || 0 so that we recover from div 0.
      sprite.x = lerp(minX, maxX, col / (numCols - 1) || 0);
      sprite.y = lerp(minY, maxY, row / (numRows - 1) || 0);
      sprite.rotation = 0;
    });
  } else if (format === "inner") {
    pct = constrain(count / 10, 0, 1);
    radius = lerp(0, 100, pct);
    var size = Math.ceil(Math.sqrt(count));
    group.forEach(function (sprite, i) {
      var row = Math.floor(i / size);
      var col = i % size;
      sprite.x = lerp(200 - radius, 200 + radius, col / (size - 1));
      sprite.y = lerp(200 - radius, 200 + radius, row / (size - 1));
      sprite.rotation = 0;
    });
  } else if (format === "row") {
    for (i=0; i<count; i++) {
      sprite = group[i];
      sprite.x = (i+1) * (400 / (count + 1));
      sprite.y = 200;
      sprite.rotation = 0;
    }
  } else if (format === "column") {
    for (i=0; i<count; i++) {
      sprite = group[i];
      sprite.x = 200;
      sprite.y = (i+1) * (400 / (count + 1));
      sprite.rotation = 0;
    }
  } else if (format === "border") {
    // First fill the four corners.
    // Then split remainder into 4 groups. Distribute group one along the top,
    // group 2 along the right, etc.
    if (count > 0) {
      group[0].x = minX;
      group[0].y = minY;
      group[0].rotation = 0;
    }
    if (count > 1) {
      group[1].x = maxX;
      group[1].y = minY;
      group[1].rotation = 0;
    }
    if (count > 2) {
      group[2].x = maxX;
      group[2].y = maxY;
      group[2].rotation = 0;
    }
    if (count > 3) {
      group[3].x = minX;
      group[3].y = maxY;
      group[3].rotation = 0;
    }
    if (count > 4) {
      var topCount = Math.ceil((count - 4 - 0) / 4);
      var rightCount = Math.ceil((count - 4 - 1) / 4);
      var bottomCount = Math.ceil((count - 4 - 2) / 4);
      var leftCount = Math.ceil((count - 4 - 3) / 4);

      for (i = 0; i < topCount; i++) {
        sprite = group[4 + i];
        // We want to include the corners in our total count so that the first
        // inner sprite is > 0 and the last inner sprite is < 1 when we lerp.
        sprite.x = lerp(minX, maxX, (i + 1) / (topCount + 1));
        sprite.y = minY;
        sprite.rotation = 0;
      }

      for (i = 0; i < rightCount; i++) {
        sprite = group[4 + topCount + i];
        sprite.x = maxX;
        sprite.y = lerp(minY, maxY, (i + 1) / (rightCount + 1));
        sprite.rotation = 0;
      }

      for (i = 0; i < bottomCount; i++) {
        sprite = group[4 + topCount + rightCount + i];
        sprite.x = lerp(minX, maxX, (i + 1) / (bottomCount + 1));
        sprite.y = maxY;
        sprite.rotation = 0;
      }

      for (i = 0; i < leftCount; i++) {
        sprite = group[4 + topCount + rightCount + bottomCount + i];
        sprite.x = minX;
        sprite.y = lerp(minY, maxY, (i + 1) / (leftCount + 1));
        sprite.rotation = 0;
      }
    }
  } else if (format === "random") {
    group.forEach(function (sprite) {
      sprite.x = randomNumber(minX, maxX);
      sprite.y = randomNumber(minY, maxY);
      sprite.rotation = 0;
    });
  } else {
    throw new Error('Unexpected format: ' + format);
  }

  // We want sprites that are lower in the canvas to show up on top of those
  // that are higher.
  // We also add a fractional component based on x to avoid z-fighting (except
  // in cases where we have identical x and y).
  // group.forEach(sprite => {
  //   this.adjustSpriteDepth_(sprite);
  // });
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
    appendSpriteConsole({name: sprite.getAnimationLabel(), text: text});
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
  group.setScale = function (scale) {
    group.forEach(function (sprite) {
      sprite.scale = scale * sprite.baseScale;
    });
  };
  group.setVisible = group.setVisibleEach;

  group.setSpeed = function (speed) {
    group.forEach(function (sprite) {
    	sprite.speed = speed;
    });
  };
  group.moveUp = function () {
    group.forEach(function (sprite) {
    	sprite.y = sprite.y - sprite.speed;
    });
  };
  group.moveDown = function () {
    group.forEach(function (sprite) {
    	sprite.y = sprite.y + sprite.speed;
    });
  };
  group.moveLeft = function () {
    group.forEach(function (sprite) {
    	sprite.x = sprite.x - sprite.speed;
    });
  };
  group.moveRight = function () {
    group.forEach(function (sprite) {
    	sprite.x = sprite.x + sprite.speed;
    });
  };
  group.jump = function () {
    group.forEach(function (sprite) {
    	sprite.velocityY = -7;
    });
  };
  group.setPosition = function (position) {
    group.forEach(function (sprite) {
      if (position === "random") {
        sprite.x = randomNumber(50, 350);
        sprite.y = randomNumber(50, 350);
      } else {
        sprite.x = position.x;
        sprite.y = position.y;
      }
    });
  };
  group.removeTint = function () {
    group.forEach(function (sprite) {
    	sprite.tint = null;
    });
  };
  group.getScale = function () {
    if (group.length > 0) {
      var sprite = group[group.length - 1]; 
      return sprite.scale / sprite.baseScale;
    } else {
      return;
    }
  };

  group.say = function (text) {
    appendSpriteConsole({name: group.get(0).getAnimationLabel(), text: text});
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
  appendSpriteConsole({text: text});
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
    World.background_image.resize(400,400);
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
    // Need to fix scope bleed with thisSprite and otherSprite.
    if (typeof(param) === "object") {
      if(!param.isGroup) {
        if(eventType(param)) {
          thisSprite = param;
          event();
          thisSprite = null;
        }
      } else {
        for(var j = 0; j < param.length; j++) {
          if(eventType(param[j])) {
            thisSprite = param[j];
            event();
            thisSprite = null;
          }
        }
      }
    } else if (param && eventType(param)) {
      event();
    }
  }
}

function createCollisionHandler (collisionEvent) {
  return function (sprite1, sprite2) {
    thisSprite = sprite1;
    otherSprite = sprite2;
    if (!collisionEvent.touching || collisionEvent.keepFiring) {
      collisionEvent.event(sprite1, sprite2);
    }
    thisSprite = null;
    otherSprite = null;
  };
}

function runCollisionEvents() {
  for (i = 0; i<collisionEvents.length; i++) {
    var collisionEvent = collisionEvents[i];
    var a = collisionEvent.a && collisionEvent.a();
    var b = collisionEvent.b && collisionEvent.b();
    if (!a || !b) {
      continue;
    }
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

// Aaron's more complicated collision model
function runCollisionEventsExperimental() {
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
    textAlign(CENTER, CENTER);
    textSize(50);
    text(title, 0, 0, 400, 200);
    textSize(35);
    text(subTitle, 0, 200, 400, 200);
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
}
