/* This file is only executed within JSInterpreter */

/* eslint-disable no-unused-vars */
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
 * mousePressedOver,
 * mouseWentDown,
 * randomNumber,
 * rect,
 * text,
 * textAlign,
 * textSize,
*/

createEdgeSprites();
let inputEvents = [];
let collisionEvents = [];
let loops = [];
let sprites = [];
let score = 0;
let game_over = false;
let show_score = false;
let title = '', subTitle = '';

function initialize(setupHandler) {
  setupHandler();
}

// Behaviors

function addBehavior(sprite, behavior, name) {
  var index = sprite.behavior_keys.indexOf(name);
  if (index === -1) {
    sprite.behavior_keys.push(name);
  }

  sprite.behaviors[name] = behavior;
}

function removeBehavior(sprite, behavior, name) {
  var index = sprite.behavior_keys.indexOf(name);
  if (index > -1) {
    sprite.behavior_keys.splice(index, 1);
  }
}

function hasBehavior(sprite, behavior, name) {
  var index = sprite.behavior_keys.indexOf(name);
  return index > -1;
}

function patrol(sprite, direction) {
  if (direction === undefined) {
    direction = "vertical";
  }

  if (direction === "vertical") {
    if (sprite.velocityY === 0) {sprite.velocityY = sprite.speed;}
    sprite.bounceOff(edges);
  } else if (direction === "horizontal") {
    if (sprite.velocityX === 0) {sprite.velocityX = sprite.speed;}
    sprite.bounceOff(edges);
  }
  sprite.patrolling = true;
}

function gravity(sprite) {
  if (sprite.velocityY < 10) {
    sprite.velocityY += 0.5;
  }
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
  inputEvents.push({type: mouseWentDown, event: event, param: 'leftButton'});
}

function clickedOn(sprite, event) {
  inputEvents.push({type: mousePressedOver, event: event, param: sprite});
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

// Loops

function repeatWhile(condition, loop) {
  loops.push({'condition': condition, 'loop': loop});
}

function forever(loop) {
  loops.push({'condition': function () {return true;}, 'loop': loop});
}

// Sprite and Group creation

function makeNewSpriteLocation(animation, loc) {
  return makeNewSprite(animation, loc.x, loc.y);
}

function makeNewSprite(animation, x, y) {
  var sprite = createSprite(x, y);

  sprite.setAnimation(animation);
  sprites.push(sprite);
  sprite.speed = 10;
  sprite.patrolling = false;
  sprite.things_to_say = [];
  sprite.behavior_keys = [];
  sprite.behaviors = {};

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
    sprite.scale = scale;
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
  group.addBehaviorEach = function (behavior, name) {
    for (var i=0; i < group.length; i++) {
      addBehavior(group[i], behavior, name);
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

function draw() {
  background(World.background_color || "white");

  if (World.frameCount > 1) {
    // Run input events
    for (var i=0; i<inputEvents.length; i++) {
      const eventType = inputEvents[i].type;
      const event = inputEvents[i].event;
      const param = inputEvents[i].param;
      if (eventType(param)) {
        event();
      }
    }


    // Run collision events
    for (let i=0; i<collisionEvents.length; i++) {
      const collisionEvent = collisionEvents[i];
      const a = collisionEvent.a;
      const b = collisionEvent.b;
      if (a.overlap(b)) {
        if (!collisionEvent.touching || collisionEvent.keepFiring) {
          collisionEvent.event();
        }
        collisionEvent.touching = true;
      } else {
        collisionEvent.touching = false;
      }
    }

    // Run loops
    for (let i=0; i<loops.length; i++) {
      var loop = loops[i];
      if (!loop.condition()) {
        loops.splice(i, 1);
      } else {
        loop.loop();
      }
    }


    for (let i=0; i<sprites.length; i++) {
      var sprite = sprites[i];

      // Perform sprite behaviors

      for (var j=0; j<sprite.behavior_keys.length; j++) {
        sprite.behaviors[sprite.behavior_keys[j]](sprite);
      }

      // Make sprites say things
      if (sprite.things_to_say.length > 0) {
        fill("white");
        rect(sprite.x + 10, sprite.y - 15, sprite.things_to_say[0][0].length * 7, 20);
        fill("black");
        text(sprite.things_to_say[0][0], sprite.x + 15, sprite.y);

        if (sprite.things_to_say[0][1] === 0) {
          sprite.things_to_say.shift();
        } else if (sprite.things_to_say[0][1] > -1) {
          sprite.things_to_say[0][1]--;
        }
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
