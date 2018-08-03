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
var dancers = {
  circle: [
    loadAnimation("https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/standing/standing01.png"),
    loadAnimation("https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/clap/clap01.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/clap/clap02.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/clap/clap03.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/clap/clap04.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/clap/clap05.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/clap/clap06.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/clap/clap07.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/clap/clap08.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/clap/clap09.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/clap/clap10.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/clap/clap11.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/clap/clap12.png"),
    loadAnimation("https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/bboy/bboy01.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/bboy/bboy02.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/bboy/bboy03.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/bboy/bboy04.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/bboy/bboy05.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/bboy/bboy06.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/bboy/bboy07.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/bboy/bboy08.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/bboy/bboy09.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/bboy/bboy10.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/bboy/bboy11.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/bboy/bboy12.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/bboy/bboy13.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/bboy/bboy14.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/bboy/bboy15.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/bboy/bboy16.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/bboy/bboy17.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/bboy/bboy18.png"),
    loadAnimation("https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/uprock/uprock01.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/uprock/uprock02.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/uprock/uprock03.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/uprock/uprock04.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/uprock/uprock05.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/uprock/uprock06.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/uprock/uprock07.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/uprock/uprock08.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/uprock/uprock09.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/uprock/uprock10.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/uprock/uprock11.png",
                  "https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/uprock/uprock12.png")
  ]
};

var beat_detectors = {
  low: Dance.fft.createPeakDetect(20, 200, 0.8, 16),
  mid: Dance.fft.createPeakDetect(400, 2600, 0.4, 16),
  high: Dance.fft.createPeakDetect(2700, 4000, 0.5, 16)
};

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

function clickedOn(sprite, event) {
  touchEvents.push({type: mousePressedOver, event: event, sprite: sprite});
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

function makeNewSprite(animation, x, y) {
  var sprite = createSprite(x, y);

  if (animation) {
    sprite.setAnimation(animation);
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



function draw() {
  Dance.fft.analyze();
  
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

    var createCollisionHandler = function (collisionEvent) {
      return function (sprite1, sprite2) {
        if (!collisionEvent.touching || collisionEvent.keepFiring) {
          collisionEvent.event(sprite1, sprite2);
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
}