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
var spriteGroups = {};
var thisSprite;
var otherSprite;


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

function clickedOn(condition, group, event) {
  var spriteGroup = group();
  var typeOfClick = condition === "when" ? mouseIsOver : mousePressedOver;
  for(var i = 0; i < spriteGroup.length; i++) {
    var sprite = helperGetSpriteFromArray(spriteGroup, i);
    touchEvents.push({type: typeOfClick, event: event, sprite: sprite});
  }
}

function helperGetSpriteFromArray(spriteGroup, index) {
	return function() {
    	return spriteGroup[index];
    };
}

function spriteDestroyed(sprite, event) {
  inputEvents.push({type: isDestroyed, event: event, param: sprite});
}

function whenTouching(condition, groupA, groupB, event) {
  var spriteGroupA = groupA();
  var spriteGroupB = groupB();
  var isWhen = condition === "when" ? true : false;
  var a, b; //individual sprites from each group
  if(isWhen) {
  	for(i = 0; i < spriteGroupA.length; i++) {
      a = helperGetSpriteFromArray(spriteGroupA, i);
      for(j = 0; j < spriteGroupB.length; j++) {
      	b = helperGetSpriteFromArray(spriteGroupB, j);
        collisionEvents.push({a: a, b: b, event: event});
      }
    }
  } else {
  	for(i = 0; i < spriteGroupA.length; i++) {
      a = helperGetSpriteFromArray(spriteGroupA, i);
      for(j = 0; j < spriteGroupB.length; j++) {
      	b = helperGetSpriteFromArray(spriteGroupB, j);
        collisionEvents.push({a: a, b: b, event: event, keepFiring: true});
      }
    }
  }
}

/*
function whenTouching(a, b, event) {
  collisionEvents.push({a: a, b: b, event: event});
}
*/

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

function draw() {
  background(World.background_color || "white");

  callbacks.forEach(function (callback) {
    callback();
  });

  if (shouldUpdate()) {
    // Perform sprite behaviors
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
      /*
      if(eventType === mousePressedOver) {
      	eventType = mouseIsOver;
      }
      */
      event = touchEvents[i].event;
      param = touchEvents[i].sprite ?
        touchEvents[i].sprite() :
        touchEvents[i].param;
      thisSprite = param;
      // Just for experimentation, I'm breaking mouseIsOver for this to work
      if(param && eventType === mouseIsOver && eventType(param) && mouseWentDown("leftButton")) {
        event();
      }
      else if(param && eventType(param) && eventType !== mouseIsOver) {
        event();
      }
    }

    var createCollisionHandler = function (collisionEvent) {
      return function (sprite1, sprite2) {
        if (!collisionEvent.touching || collisionEvent.keepFiring) {
          thisSprite = sprite1;
          otherSprite = sprite2;
          collisionEvent.event(thisSprite, otherSprite);
        }
      };
    };
    // Run collision events
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
  drawTextBoxes();
}

function drawTextBoxes() {
  for(var i = 0; i < World.allSprites.length; i++) {
    var sprite = World.allSprites[i];
    if(sprite.textBox && Object.keys(sprite.textBox).length > 0) {
      if(sprite.position.x > width / 2) {
        sprite.textBox.x = sprite.position.x - (sprite.originalWidth / 2) - sprite.textBox.width;
      } else {
        sprite.textBox.x = sprite.position.x + sprite.originalWidth / 2;
      }
      sprite.textBox.y = sprite.position.y - sprite.originalHeight / 2;
      fill(255);
      rect(sprite.textBox.x, sprite.textBox.y, sprite.textBox.width, sprite.textBox.height);
      fill(0);
      text(sprite.textBox.text, sprite.textBox.x, sprite.textBox.y + textSize());
      if(!sprite.textBox.timerStarted) {
        setTimeout(removeTextBox(sprite), sprite.textBox.seconds * 1000);
        sprite.textBox.timerStarted = true;
      }
    }
  }
}

function removeTextBox(sprite) {
  return function() {
    sprite.textBox = {};
  };
}