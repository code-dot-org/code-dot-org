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
var touchEvents = [];
var collisionEvents = [];
var callbacks = [];
var loops = [];
var sprites = [];
var score = 0;
var game_over = false;
var show_score = false;
var title = '';
var subTitle = '';

function initialize(setupHandler) {
  setupHandler();
}

// Behaviors

function addBehavior(sprite, behavior) {
  if (!sprite || !behavior) {
    return;
  }
  behavior = normalizeBehavior(behavior);

  if (findBehavior(sprite, behavior) !== -1) {
    return;
  }
  sprite.behaviors.push(behavior);
}

function addBehaviorSimple(sprite, behavior) {
  if (sprite && behavior) {
    addBehavior(sprite, behavior, behavior.name);
  }
}

function removeBehavior(sprite, behavior) {
  if (!sprite || !behavior) {
    return;
  }
  behavior = normalizeBehavior(behavior);

  var index = findBehavior(sprite, behavior);
  if (index === -1) {
    return;
  }
  sprite.behaviors.splice(index, 1);
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
  if (behavior1.func.name && behavior2.func.name) {
    // These are legacy behaviors, check for equality based only on the name.
    return behavior1.func.name === behavior2.func.name;
  }
  if (behavior1.func !== behavior2.func) {
    return false;
  }
  if (behavior2.extraArgs.length !== behavior1.extraArgs.length) {
    return false;
  }
  var extraArgsEqual = true;
  for (var j = 0; j < behavior1.extraArgs.length; j++) {
    if (behavior2.extraArgs[j] !== behavior1.extraArgs[j]) {
      extraArgsEqual = false;
      break;
    }
  }
  return extraArgsEqual;
}

//Events

function whenUpArrow(event) {
  inputEvents.push({type: keyWentDown, event: event, param: 'up'});
}

function whenDownArrow(event) {
  inputEvents.push({type: keyWentDown, event: event, param: 'down'});
}

function whenLeftArrow(event) {
  inputEvents.push({type: keyWentDown, event: event, param: 'left'});
}

function whenRightArrow(event) {
  inputEvents.push({type: keyWentDown, event: event, param: 'right'});
}

function whenSpace(event) {
  inputEvents.push({type: keyWentDown, event: event, param: 'space'});
}

function whileUpArrow(event) {
  inputEvents.push({type: keyDown, event: event, param: 'up'});
}

function whileDownArrow(event) {
  inputEvents.push({type: keyDown, event: event, param: 'down'});
}

function whileLeftArrow(event) {
  inputEvents.push({type: keyDown, event: event, param: 'left'});
}

function whileRightArrow(event) {
  inputEvents.push({type: keyDown, event: event, param: 'right'});
}

function whileSpace(event) {
  inputEvents.push({type: keyDown, event: event, param: 'space'});
}

function whenMouseClicked(event) {
  touchEvents.push({type: mouseWentDown, event: event, param: 'leftButton'});
}

function whenPressedAndReleased(direction, pressedHandler, releasedHandler) {
  touchEvents.push({type: keyWentDown, event: pressedHandler, param: direction});
  touchEvents.push({type: keyWentUp, event: releasedHandler, param: direction});
}

function whenSpriteClicked(sprite) {
  return mouseWentDown("leftButton") && mouseIsOver(sprite);
}

function clickedOn(sprite, event) {
  touchEvents.push({type: whenSpriteClicked, event: event, sprite: sprite});
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
    for (var i=0; i < group.length; i++) {
      addBehavior(group[i], behavior);
    }
  };
  group.destroy = group.destroyEach;
  return group;
}

// Sprite actions
function setProp(sprite, property, val) {
  if (!sprite || val === undefined) {
    return;
  }
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
}

function getProp(sprite, property) {
  if (!sprite) {
    return undefined;
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
}

function getDirection(sprite) {
  if (!sprite.hasOwnProperty("direction")) {
 	sprite.direction = 0;
  }
  return sprite.direction % 360;
}

function moveForward(sprite, distance) {
  var direction = getDirection(sprite);
  sprite.x += distance * Math.cos(direction * Math.PI / 180);
  sprite.y += distance * Math.sin(direction * Math.PI / 180);
}

function moveToward(sprite,distance,target) {
  if (!sprite || distance === undefined || !target) {
    return;
  }
  var dx = target.x - sprite.x;
  var dy = target.y - sprite.y;
  if (dx * dx + dy * dy > distance * distance) {
    var angleOfMovement=Math.atan2(dy, dx);
    dx = distance*Math.cos(angleOfMovement);
    dy = distance*Math.sin(angleOfMovement);
  }
  sprite.x += dx;
  sprite.y += dy;
}

function jumpTo(sprite,location) {
  sprite.x = location.x;
  sprite.y = location.y;
}

function mirrorSprite(sprite,direction) {
  if (direction == "right") {
	sprite.mirrorX(1); 
  } else {
	sprite.mirrorX(-1);
  }
}

function turn(sprite,n,direction) {
  if (!sprite || n === undefined) {
    return;
  }
  if (direction=="right") {
    sprite.rotation+=n;
  }
  else {
    sprite.rotation-=n;
  }
}

function debugSprite(sprite, val) {
  sprite.debug = val;
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

function moveInDirection(sprite,distance,direction) {
    if (direction== "North") {
      sprite.y-=distance;
    }
 	else if (direction== "East") {
      sprite.x+=distance;
 	}
    else if (direction=="South") {
      sprite.y+=distance;
    }
	else if (direction=="West") {
      sprite.x-=distance;
    }
    else {
      console.error("moveInDirection: invalid direction provided");
    }
}

function unitVectorTowards(from, to) {
  var angle = Math.atan2(to.y - from.y, to.x - from.x);
  return p5.Vector.fromAngle(angle);
}

function draw() {
  background(World.background_color || "white");

  callbacks.forEach(function (callback) {
    callback();
  });

  if (shouldUpdate()) {
    // Perform sprite behaviors
    sprites.forEach(function (sprite) {
      sprite.behaviors.forEach(function (behavior) {
        behavior.func.apply(null, [sprite].concat(behavior.extraArgs));
      });
    });

    var i;
    var eventType;
    var event;
    var param;

    // Run key events
    for (i = 0; i < inputEvents.length; i++) {
      eventType = inputEvents[i].type;
      event = inputEvents[i].event;
      param = inputEvents[i].param;
      if (eventType(param)) {
        event();
      }
    }

    // Run touch events
    for (i = 0; i < touchEvents.length; i++) {
      eventType = touchEvents[i].type;
      event = touchEvents[i].event;
      param = touchEvents[i].sprite ?
        touchEvents[i].sprite() :
        touchEvents[i].param;
      if (param && eventType(param)) {
        event();
      }
    }

    // Run collision events
    for (i = 0; i<collisionEvents.length; i++) {
      var collisionEvent = collisionEvents[i];
      var a = collisionEvent.a && collisionEvent.a();
      var b = collisionEvent.b && collisionEvent.b();
      if (!a || !b) {
        continue;
      }
      if (a.overlap(b)) {
        if (collisionEvent.keepFiring || !collisionEvent.fired) {
          collisionEvent.event(a, b);
        }
        collisionEvent.touching = true;
        collisionEvent.fired = true;
      } else {
        if (collisionEvent.touching && collisionEvent.eventEnd) {
          collisionEvent.eventEnd(a, b);
        }
        collisionEvent.touching = false;
        collisionEvent.fired = false;
      }
    }

    // Run loops
    for (i = 0; i<loops.length; i++) {
      var loop = loops[i];
      if (!loop.condition()) {
        loops.splice(i, 1);
      } else {
        loop.loop();
      }
    }
  }

  drawSprites();

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
