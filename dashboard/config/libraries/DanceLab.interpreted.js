// Event handlers, loops, and callbacks
var inputEvents = [];
var touchEvents = [];
var collisionEvents = [];
var callbacks = [];
var setupCallbacks = [];
var loops = [];

// Sprites
var sprites = createGroup();
var sprites_by_type = {};
var SPRITE_NAMES = ["CAT", "DOG", "DUCK", "MOOSE", "POO", "ROBOT", "SHARK"];
var MOVE_NAMES = [
  {
    name: "ClapHigh",
    mirror: true
  },
  {
    name: "Clown",
    mirror: false
  },
  {
    name: "Dab",
    mirror: true
  },
  {
    name: "DoubleJam",
    mirror: false
  },
  {
    name: "Drop",
    mirror: true
  },
  {
    name: "Floss",
    mirror: true
  },
  {
    name: "Fresh",
    mirror: true
  },
  {
    name: "Kick",
    mirror: true
  },
  {
    name: "Rest",
    mirror: true
  },
  {
    name: "Roll",
    mirror: true
  },
  {
    name: "ThisOrThat",
    mirror: false
  },
  {
    name: "Thriller",
    mirror: true
  }
];
var ANIMATIONS = {};
var img_base = "https://s3.amazonaws.com/cdo-curriculum/images/sprites/spritesheet/";

// Songs
var songs = {
  macklemore: {
    url: 'https://s3.amazonaws.com/cdo-curriculum/media/uploads/chu.mp3',
    bpm: 146,
    delay: 0.2, // Seconds to delay before calculating measures
    verse: [26.5, 118.56], // Array of timestamps in seconds where verses occur
    chorus: [92.25, 158] // Array of timestamps in seconds where choruses occur
  },
  macklemore90: {
    url: 'https://s3.amazonaws.com/cdo-curriculum/media/uploads/hold.mp3',
    bpm: 146,
    delay: 0.0, // Seconds to delay before calculating measures
    verse: [0, 26.3], // Array of timestamps in seconds where verses occur
    chorus: [65.75] // Array of timestamps in seconds where choruses occur
  },
  hammer: {
    url: 'https://s3.amazonaws.com/cdo-curriculum/media/uploads/touch.mp3',
    bpm: 133,
    delay: 2.32, // Seconds to delay before calculating measures
    verse: [1.5, 15.2], // Array of timestamps in seconds where verses occur
    chorus: [5.5, 22.1] // Array of timestamps in seconds where choruses occur
  },
  peas: {
    url: 'https://s3.amazonaws.com/cdo-curriculum/media/uploads/feeling.mp3',
    bpm: 128,
    delay: 0.0, // Seconds to delay before calculating measures
    verse: [1.5, 15.2], // Array of timestamps in seconds where verses occur
    chorus: [5.5, 22.1] // Array of timestamps in seconds where choruses occur
  }
};
var song_meta = songs.macklemore;
var processed_peaks;
var lead_dancers = createGroup();
var backup_dancers = createGroup();

function preload() {
  // Load song
  Dance.song.load(song_meta.url);

  // Load spritesheets
  for (var i = 0; i < SPRITE_NAMES.length; i++) {
    var this_sprite = SPRITE_NAMES[i];
    ANIMATIONS[this_sprite] = [];
    for (var j = 0; j < MOVE_NAMES.length; j++) {
      var url = img_base + this_sprite + "_" + MOVE_NAMES[j].name + ".png";
      var dance = {
        spritesheet: loadSpriteSheet(url, 400, 400, 48),
        mirror: MOVE_NAMES[j].mirror
      };
      ANIMATIONS[this_sprite].push(dance);
    }
  }
}

function setup() {
  // Create animations from spritesheets
  for (var i = 0; i < SPRITE_NAMES.length; i++) {
    var this_sprite = SPRITE_NAMES[i];
    for (var j = 0; j < ANIMATIONS[this_sprite].length; j++) {
      ANIMATIONS[this_sprite][j].animation = loadAnimation(ANIMATIONS[this_sprite][j].spritesheet);
    }
  }

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

function Effects(alpha, blend) {
  var self = this;
  this.alpha = alpha || 1;
  this.blend = blend || BLEND;
  this.none = {
    draw: function () {
      background(World.background_color || "white");
    }
  };
  this.rainbow = {
    color: color('hsla(0, 100%, 80%, ' + self.alpha + ')'),
    update: function () {
      push();
      colorMode(HSL);
      this.color = color(this.color._getHue() + 10, 100, 80, self.alpha);
      pop();
    },
    draw: function () {
      if (Dance.fft.isPeak()) this.update();
      background(this.color);
    }
  };
  this.disco = {
    colors: [],
    update: function () {
      if (this.colors.length < 16) {
        this.colors = [];
        for (var i = 0; i < 16; i++) {
          this.colors.push(color("hsla(" + randomNumber(0, 359) + ", 100%, 80%, " + self.alpha + ")"));
        }
      } else {
        for (var j = randomNumber(5, 10); j > 0; j--) {
          this.colors[randomNumber(0, this.colors.length - 1)] = color("hsla(" + randomNumber(0, 359) + ", 100%, 80%, " + self.alpha + ")");
        }
      }
    },
    draw: function () {
      if (Dance.fft.isPeak() || World.frameCount == 1) this.update();
      push();
      noStroke();
      for (var i = 0; i < this.colors.length; i++) {
        fill(this.colors[i]);
        rect((i % 4) * 100, Math.floor(i / 4) * 100, 100, 100);
      }
      pop();
    }
  };
  this.diamonds = {
    hue: 0,
    update: function () {
      this.hue += 25;
    },
    draw: function () {
      if (Dance.fft.isPeak()) this.update();
      push();
      colorMode(HSB);
      rectMode(CENTER);
      translate(200, 200);
      rotate(45);
      noFill();
      strokeWeight(map(Dance.fft.getCentroid(), 0, 4000, 0, 50));
      for (var i = 5; i > -1; i--) {
        stroke((this.hue + i * 10) % 360, 100, 75, self.alpha);
        rect(0, 0, i * 100 + 50, i * 100 + 50);
      }
      pop();
    }
  };
  this.strobe = {
    waitTime: 0,
    flashing: false,
    update: function () {
      this.flashing = true;
      this.waitTime = 6;
    },
    draw: function () {
      var bgcolor = rgb(1, 1, 1);
      if (Dance.fft.isPeak()) this.update();
      if (this.flashing) {
        bgcolor = rgb(255, 255, 255);
        this.waitTime--;
      }
      if (this.waitTime <= 0) {
        bgcolor = rgb(1, 1, 1);
        this.flashing = false;
      }
      background(bgcolor);
    }
  };
  this.rain = {
    drops: [],
    init: function () {
      for (var i = 0; i < 20; i++) {
        this.drops.push({
          x: randomNumber(0, 380),
          y: randomNumber(0, 380),
          length: randomNumber(10, 20)
        });
      }
    },
    color: rgb(127, 127, 255, 0.5),
    update: function () {
      this.color = rgb(127, 127, randomNumber(127, 255), 0.5);
    },
    draw: function () {
      if (this.drops.length < 1) this.init();
      strokeWeight(3);
      stroke(this.color);
      push();
      for (var i = 0; i < this.drops.length; i++) {
        push();
        translate(this.drops[i].x - 20, this.drops[i].y - 20);
        line(0, 0, this.drops[i].length, this.drops[i].length * 2);
        pop();
        this.drops[i].y = (this.drops[i].y + this.drops[i].length) % 420;
        this.drops[i].x = (this.drops[i].x + (this.drops[i].length / 2)) % 420;
      }
      pop();
    }
  };
  this.raining_tacos = {
    tacos: [],
    size: 50,
    init: function () {
      for (var i = 0; i < 20; i++) {
        this.tacos.push({
          x: randomNumber(20, 380),
          y: randomNumber(20, 380),
          rot: randomNumber(0, 359),
          speed: randomNumber(2, 5)
        });
      }
    },
    update: function () {
      this.size += randomNumber(-5, 5);
    },
    draw: function () {
      if (this.tacos.length < 1) this.init();
      for (var i = 0; i < this.tacos.length; i++) {
        push();
        var taco = this.tacos[i];
        translate(taco.x, taco.y);
        rotate(taco.rot);
        textAlign(CENTER, CENTER);
        textSize(this.size);
        text('taco', 0, 0);
        taco.y += taco.speed;
        taco.rot++;
        if (taco.y > 450) {
          taco.x = randomNumber(20, 380);
          taco.y = -50;
        }
        pop();
      }
    }
  };
}
var bg_effects = new Effects(1);
var fg_effects = new Effects(0.8);

World.bg_effect = bg_effects.none;
World.fg_effect = fg_effects.none;

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
  if (typeof behavior === 'function') {
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
  inputEvents.push({
    type: isDestroyed,
    event: event,
    param: sprite
  });
}

// Loops

function repeatWhile(condition, loop) {
  loops.push({
    'condition': condition,
    'loop': loop
  });
}

function forever(loop) {
  loops.push({
    'condition': function () {
      return true;
    },
    'loop': loop
  });
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
    for (var i = 0; i < group.length; i++) {
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

  background("white");
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
    var validType;
    var validParam;
    var validPre;
    var validPost;

    // Run key events
    for (i = 0; i < inputEvents.length; i++) {
      eventType = inputEvents[i].type;
      event = inputEvents[i].event;
      param = inputEvents[i].param;
      if (eventType(param)) {
        event();
        var event_run = false;
        // if has validator, run it
        if (typeof(validationProps) == "object") {
          if (validationProps.hasOwnProperty("events")) {
              for (var j = 0; j < validationProps.events.length; j++) {
                // TODO check for existence before trying to run these events
                validType = validationProps.events[j].type;
                validParam = validationProps.events[j].param;
                validPre = validationProps.events[j].pre;
                validPost = validationProps.events[j].post;
                if (eventType == validType && param == validParam) {
                  validPre();
                  event();
                  event_run = true;
                  validPost();
                }
              }
            }
          }
          if (!event_run) event();
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
      for (i = 0; i < collisionEvents.length; i++) {
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
      for (i = 0; i < loops.length; i++) {
        var loop = loops[i];
        if (!loop.condition()) {
          loops.splice(i, 1);
        } else {
          loop.loop();
        }
      }
    }

    drawSprites();

    if (World.fg_effect != fg_effects.none) {
      push();
      blendMode(fg_effects.blend);
      World.fg_effect.draw();
      pop();
    }

    fill("black");
    //textStyle(BOLD);
    /*text("time: " + Dance.song.currentTime().toFixed(3) + " | bass: " + Math.round(Dance.fft.getEnergy("bass")) + " | mid: " + Math.round(Dance.fft.getEnergy("mid")) + " | treble: " + Math.round(Dance.fft.getEnergy("treble")) + " | framerate: " + World.frameRate, 20, 20);*/
  }