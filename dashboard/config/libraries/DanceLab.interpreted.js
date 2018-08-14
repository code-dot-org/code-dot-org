createEdgeSprites();
var inputEvents = [];
var touchEvents = [];
var collisionEvents = [];
var callbacks = [];
var setupCallbacks = [];
var loops = [];
var sprites = createGroup();
var sprites_by_type = {};
var song_meta = {
  bpm: 146,
  delay: 0.2
};
var score = 0;
var game_over = false;
var show_score = false;
var title = '';
var subTitle = '';
var processed_peaks;
var lead_dancers = createGroup();
var backup_dancers = createGroup();
var bg_sprite = createSprite(200, 200, 400, 400);
bg_sprite.shapeColor = "white";
bg_sprite.tint = "white";
bg_sprite.visible = false;

function preload() {
  Dance.song.load('https://s3.amazonaws.com/cdo-curriculum/media/uploads/chu.mp3');
  //Dance.song.load('/api/v1/sound-library/category_background/jazzy_beats.mp3');
}

function setup() {
  setupCallbacks.forEach(function (callback) {
    callback();
  });
  /*
  Dance.song.processPeaks(0, function(peaks) {
    console.log(peaks);
    processed_peaks = peaks;
  });
  */
  Dance.song.start();
}

var dancers = {
  circle: [
  	loadS3Animation("https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/standing/standing", 1),
    loadS3Animation("https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/clap/clap", 12),
    loadS3Animation("https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/spin/spin", 12),
    loadS3Animation("https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/uprock/uprock", 12),
    loadS3Animation("https://s3.amazonaws.com/cdo-curriculum/images/sprites/circle/bboy/bboy", 18),
    ],
  wiggles: [
  	loadS3Animation("https://s3.amazonaws.com/cdo-curriculum/images/sprites/wiggles/Rest/MrWiggles_Rest_", 24),
    loadS3Animation("https://s3.amazonaws.com/cdo-curriculum/images/sprites/wiggles/Electro/Electro_", 24),
    loadS3Animation("https://s3.amazonaws.com/cdo-curriculum/images/sprites/wiggles/Floss/Floss_", 24),
    loadS3Animation("https://s3.amazonaws.com/cdo-curriculum/images/sprites/wiggles/Fresh/Fresh_", 24),
    loadS3Animation("https://s3.amazonaws.com/cdo-curriculum/images/sprites/wiggles/Breakdown/MrWiggles_Breakdown24_", 24),
    loadS3Animation("https://s3.amazonaws.com/cdo-curriculum/images/sprites/wiggles/March/MrWiggles_March_", 24),
    loadS3Animation("https://s3.amazonaws.com/cdo-curriculum/images/sprites/wiggles/Wave/MrWiggles_Wave24_", 24),
    ],
  alien: [
  	loadS3Animation("https://s3.amazonaws.com/cdo-curriculum/images/sprites/alien/Clap/Alien_Clap48_", 1),
    loadS3Animation("https://s3.amazonaws.com/cdo-curriculum/images/sprites/alien/Electro/Alien_Electro48_", 48),
    loadS3Animation("https://s3.amazonaws.com/cdo-curriculum/images/sprites/alien/Floss/Alien_Floss48_", 48),
    loadS3Animation("https://s3.amazonaws.com/cdo-curriculum/images/sprites/alien/Fresh/Alien_Fresh48_", 48),
    loadS3Animation("https://s3.amazonaws.com/cdo-curriculum/images/sprites/alien/Clap/Alien_Clap48_", 48),
    loadS3Animation("https://s3.amazonaws.com/cdo-curriculum/images/sprites/alien/March/Alien_March48_", 48),
    ]
};

var bg_effects = {
  none: {
    draw: function() {
      background(World.background_color || "white");
    }
  },
  rainbow: {
    color: color('hsl(0, 100%, 80%)'),
    update: function () {
      push();
      colorMode(HSL);
      this.color = color(this.color._getHue() + 10, 100, 80);
      pop();
    },
    draw: function () {
      if (Dance.fft.isPeak()) this.update();
      background(this.color);
    }
  },
  disco: {
    colors: [],
    update: function () {
      if (this.colors.length < 64) {
        this.colors = [];
        for (var i=0; i<64; i++) {
          this.colors.push(color("hsb(" + randomNumber(0, 359) + ", 100%, 100%)"));
        }
      } else {
        for (var j=randomNumber(5, 10); j>0; j--) {
          this.colors[randomNumber(0, this.colors.length - 1)] = color("hsb(" + randomNumber(0, 359) + ", 100%, 100%)");
        }
      }
    },
    draw: function () {
      if (Dance.fft.isPeak() || World.frameCount == 1) this.update();
      push();
      noStroke();
      for (var i=0; i<this.colors.length; i++) {
        fill(this.colors[i]);
        rect((i % 8) * 50, Math.floor(i / 8) * 50, 50, 50);
      }
      pop();
    }
  },
  diamonds: {
    hue: 0,
    update: function() {
      this.hue += 25;
    },
    draw: function() {
      if (Dance.fft.isPeak()) this.update();
      push();
      colorMode(HSB);
      noStroke();
      rectMode(CENTER);
      translate(200, 200);
      rotate(45);
      for (var i=12; i>1; i--) {
        fill((this.hue + i * 10) % 360, 100, 75);
        rect(0, 0, i * 50, i * 50);
      }
      pop();
    }
  }
};

World.bg_effect = bg_effects.none;
function loadS3Animation(base_url, count) {
  var args = [];
  for (var i=0; i< count; i++) {
    args.push(base_url + i + ".png");
  }
  return loadAnimation.apply(null, args);
}

Dance.fft.createPeakDetect(20, 200, 0.8, Math.round((60 / song_meta.bpm) * World.frameRate));
Dance.fft.createPeakDetect(400, 2600, 0.4, Math.round((60 / song_meta.bpm) * World.frameRate));
Dance.fft.createPeakDetect(2700, 4000, 0.5, Math.round((60 / song_meta.bpm) * World.frameRate));

function initialize(setupHandler) {
  setupHandler();
}

// Behaviors

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

function spriteDestroyed(sprite, event) {
  inputEvents.push({type: isDestroyed, event: event, param: sprite});
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

function registerSetup(callback) {
  setupCallbacks.push(callback);
}

// Sprite and Group creation

function makeNewSpriteLocation(animation, loc) {
  return makeNewSprite(animation, loc.x, loc.y);
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

  if (World.bg_effect) {
    World.bg_effect.draw();
  } else {
    bg_effects.none.draw();
  }

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
  
  fill("black");
  //textStyle(BOLD);
  text("time: " + Dance.song.currentTime().toFixed(3) + " | bass: " + Math.round(Dance.fft.getEnergy("bass")) + " | mid: " + Math.round(Dance.fft.getEnergy("mid")) + " | treble: " + Math.round(Dance.fft.getEnergy("treble")) + " | framerate: " + World.frameRate, 20, 20);
}