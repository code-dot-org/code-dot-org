/* eslint-disable no-unused-vars, curly, eqeqeq, babel/semi */
/* global p5, Dance, validationProps */

export default function init(p5, Dance) {
  var exports = {};

console.log('hello');
console.log(p5);

var World = {
  height: 400
};

function randomNumber(min, max) {
  return Math.floor(p5.random(min, max));
}

// Sprites
var sprites = p5.createGroup();
var sprites_by_type = {};

var SPRITE_NAMES = ["ALIEN", "BEAR", "CAT", "DOG", "DUCK", "FROG", "MOOSE", "PINEAPPLE", "ROBOT", "SHARK", "UNICORN"];
var img_base = "https://curriculum.code.org/images/sprites/spritesheet_sm/";
var SIZE = 300;

var MOVE_NAMES = [
  {name: "Rest", mirror: true},
  {name: "ClapHigh", mirror: true},
  {name: "Clown", mirror: false},
  {name: "Dab", mirror: true},
  {name: "DoubleJam", mirror: false},
  {name: "Drop", mirror: true},
  {name: "Floss", mirror: true},
  {name: "Fresh", mirror: true},
  {name: "Kick", mirror: true},
  {name: "Roll", mirror: true},
  {name: "ThisOrThat", mirror: false},
  {name: "Thriller", mirror: true},
];

var ANIMATIONS = {};
var FRAMES = 24;

// Songs
var songs = {
  macklemore: {
    url: 'https://curriculum.code.org/media/uploads/chu.mp3',
    bpm: 146,
    delay: 0.2, // Seconds to delay before calculating measures
    verse: [26.5, 118.56], // Array of timestamps in seconds where verses occur
    chorus: [92.25, 158] // Array of timestamps in seconds where choruses occur
  },
  macklemore90: {
    url: 'https://curriculum.code.org/media/uploads/hold.mp3',
    bpm: 146,
    delay: 0.0, // Seconds to delay before calculating measures
    verse: [0, 26.3], // Array of timestamps in seconds where verses occur
    chorus: [65.75] // Array of timestamps in seconds where choruses occur
  },
  hammer: {
    url: 'https://curriculum.code.org/media/uploads/touch.mp3',
    bpm: 133,
    delay: 2.32, // Seconds to delay before calculating measures
    verse: [1.5, 15.2], // Array of timestamps in seconds where verses occur
    chorus: [5.5, 22.1] // Array of timestamps in seconds where choruses occur
  },
  peas: {
    url: 'https://curriculum.code.org/media/uploads/feeling.mp3',
    bpm: 128,
    delay: 0.0, // Seconds to delay before calculating measures
    verse: [1.5, 15.2], // Array of timestamps in seconds where verses occur
    chorus: [5.5, 22.1] // Array of timestamps in seconds where choruses occur
  }
};
var song_meta = songs.hammer;

exports.preload = function preload() {
  // Load song
  Dance.song.load(song_meta.url);

  // Load spritesheets
  for (var i = 0; i < SPRITE_NAMES.length; i++) {
    var this_sprite = SPRITE_NAMES[i];
    ANIMATIONS[this_sprite] = [];
    for (var j = 0; j < MOVE_NAMES.length; j++) {
      var url = img_base + this_sprite + "_" + MOVE_NAMES[j].name + ".png";
      var dance = {
        spritesheet: p5.loadSpriteSheet(url, SIZE, SIZE, FRAMES),
        mirror: MOVE_NAMES[j].mirror
      };
      ANIMATIONS[this_sprite].push(dance);
    }
  }
}

exports.setup = function setup() {
  // Create animations from spritesheets
  for (var i = 0; i < SPRITE_NAMES.length; i++) {
    var this_sprite = SPRITE_NAMES[i];
    for (var j = 0; j < ANIMATIONS[this_sprite].length; j++) {
      ANIMATIONS[this_sprite][j].animation = p5.loadAnimation(ANIMATIONS[this_sprite][j].spritesheet);
    }
  }

  Dance.fft.createPeakDetect(20, 200, 0.8, Math.round(60 * 30 / song_meta.bpm));
  Dance.fft.createPeakDetect(400, 2600, 0.4, Math.round(60 * 30 / song_meta.bpm));
  Dance.fft.createPeakDetect(2700, 4000, 0.5, Math.round(60 * 30 / song_meta.bpm));

  Dance.song.start();
}

// Using the same base set of effecgts for BG and FG effects,
// but exposing different lists in the block dropdowns
function Effects(alpha, blend) {
  var self = this;
  this.alpha = alpha || 1;
  this.blend = blend || p5.BLEND;
  this.none = {
    draw: function () {
      p5.background(World.background_color || "white");
    }
  };
  this.rainbow = {
    color: p5.color('hsla(0, 100%, 80%, ' + self.alpha + ')'),
    update: function () {
      p5.push();
      p5.colorMode(p5.HSL);
      this.color = p5.color(this.color._getHue() + 10, 100, 80, self.alpha);
      p5.pop();
    },
    draw: function () {
      if (Dance.fft.isPeak()) {
        this.update();
      }
      p5.background(this.color);
    }
  };
  this.disco = {
    colors: [],
    update: function () {
      if (this.colors.length < 16) {
        this.colors = [];
        for (var i = 0; i < 16; i++) {
          this.colors.push(p5.color("hsla(" + randomNumber(0, 359) + ", 100%, 80%, " + self.alpha + ")"));
        }
      } else {
        for (var j = randomNumber(5, 10); j > 0; j--) {
          this.colors[randomNumber(0, this.colors.length - 1)] = p5.color("hsla(" + randomNumber(0, 359) + ", 100%, 80%, " + self.alpha + ")");
        }
      }
    },
    draw: function () {
      if (Dance.fft.isPeak() || p5.frameCount == 1) this.update();
      p5.push();
      p5.noStroke();
      for (var i = 0; i < this.colors.length; i++) {
        p5.fill(this.colors[i]);
        p5.rect((i % 4) * 100, Math.floor(i / 4) * 100, 100, 100);
      }
      p5.pop();
    }
  };
  this.diamonds = {
    hue: 0,
    update: function () {
      this.hue += 25;
    },
    draw: function () {
      if (Dance.fft.isPeak()) this.update();
      p5.push();
      p5.colorMode(p5.HSB);
      p5.rectMode(p5.CENTER);
      p5.translate(200, 200);
      p5.rotate(45);
      p5.noFill();
      p5.strokeWeight(p5.map(Dance.fft.getCentroid(), 0, 4000, 0, 50));
      for (var i = 5; i > -1; i--) {
        p5.stroke((this.hue + i * 10) % 360, 100, 75, self.alpha);
        p5.rect(0, 0, i * 100 + 50, i * 100 + 50);
      }
      p5.pop();
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
      var bgcolor = p5.rgb(1, 1, 1);
      if (Dance.fft.isPeak()) this.update();
      if (this.flashing) {
        bgcolor = p5.rgb(255, 255, 255);
        this.waitTime--;
      }
      if (this.waitTime <= 0) {
        bgcolor = p5.rgb(1, 1, 1);
        this.flashing = false;
      }
      p5.background(bgcolor);
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
    color: p5.rgb(127, 127, 255, 0.5),
    update: function () {
      this.color = p5.rgb(127, 127, randomNumber(127, 255), 0.5);
    },
    draw: function () {
      if (this.drops.length < 1) this.init();
      p5.strokeWeight(3);
      p5.stroke(this.color);
      p5.push();
      for (var i = 0; i < this.drops.length; i++) {
        p5.push();
        p5.translate(this.drops[i].x - 20, this.drops[i].y - 20);
        p5.line(0, 0, this.drops[i].length, this.drops[i].length * 2);
        p5.pop();
        this.drops[i].y = (this.drops[i].y + this.drops[i].length) % 420;
        this.drops[i].x = (this.drops[i].x + (this.drops[i].length / 2)) % 420;
      }
      p5.pop();
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
        p5.push();
        var taco = this.tacos[i];
        p5.translate(taco.x, taco.y);
        p5.rotate(taco.rot);
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.textSize(this.size);
        p5.text(String.fromCodePoint(55356, 57134), 0, 0);
        taco.y += taco.speed;
        taco.rot++;
        if (taco.y > 450) {
          taco.x = randomNumber(20, 380);
          taco.y = -50;
        }
        p5.pop();
      }
    }
  };
}
var bg_effects = new Effects(1);
var fg_effects = new Effects(0.8);

World.bg_effect = bg_effects.none;
World.fg_effect = fg_effects.none;

exports.setBackground = function setBackground(color) {
  World.background_color = color;
}

exports.setBackgroundEffect = function setBackgroundEffect(effect) {
  World.bg_effect = bg_effects[effect];
}

exports.setForegroundEffect = function setForegroundEffect(effect) {
  World.fg_effect = fg_effects[effect];
}

function initialize(setupHandler) {
  setupHandler();
}

//
// Block Functions
//


exports.makeNewDanceSprite = function makeNewDanceSprite(costume, name, location) {

  // Default to first dancer if selected a dancer that doesn't exist
  // to account for low-bandwidth mode limited character set
  if (SPRITE_NAMES.indexOf(costume) < 0) {
    costume = SPRITE_NAMES[0];
  }

  if (!location) {
    location = {
      x: 200,
      y: 200
    };
  }

  var sprite = p5.createSprite(location.x, location.y);

  sprite.style = costume;
  if (!sprites_by_type.hasOwnProperty(costume)) {
    sprites_by_type[costume] = p5.createGroup();
  }
  sprites_by_type[costume].add(sprite);

  sprite.mirroring = 1;
  sprite.looping_move = 0;
  sprite.looping_frame = 0;
  sprite.current_move = 0;
  sprite.previous_move = 0;

  for (var i = 0; i < ANIMATIONS[costume].length; i++) {
    sprite.addAnimation("anim" + i, ANIMATIONS[costume][i].animation);
  }
  sprite.animation.stop();
  sprites.add(sprite);
  sprite.speed = 10;
  sprite.sinceLastFrame = 0;
  sprite.dance_speed = 1;
  sprite.previous_speed = 1;
  sprite.behaviors = [];

  // Add behavior to control animation
  addBehavior(sprite, function () {
    var delta = 1 / (p5.frameRate() + 0.01) * 1000;
    sprite.sinceLastFrame += delta;
    var msPerBeat = 60 * 1000 / (song_meta.bpm * (sprite.dance_speed / 2));
    var msPerFrame = msPerBeat / FRAMES;
    while (sprite.sinceLastFrame > msPerFrame) {
      sprite.sinceLastFrame -= msPerFrame;
      sprite.looping_frame++;
      if (sprite.animation.looping) {
        sprite.animation.changeFrame(sprite.looping_frame % sprite.animation.images.length);
      } else {
        sprite.animation.nextFrame();
      }

      if (sprite.looping_frame % FRAMES === 0) {
        if (ANIMATIONS[sprite.style][sprite.current_move].mirror) sprite.mirroring *= -1;
        if (sprite.animation.looping) {
          sprite.mirrorX(sprite.mirroring);
        }
      }

      var currentFrame = sprite.animation.getFrame();
      if (currentFrame === sprite.animation.getLastFrame() && !sprite.animation.looping) {
        //changeMoveLR(sprite, sprite.current_move, sprite.mirroring);
        sprite.changeAnimation("anim" + sprite.current_move);
        sprite.animation.changeFrame(sprite.looping_frame % sprite.animation.images.length);
        sprite.mirrorX(sprite.mirroring);
        sprite.animation.looping = true;
      }
    }
  });

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
  //return sprite;
}

// Dance Moves

exports.changeMoveLR = function changeMoveLR(sprite, move, dir) {
  if (!spriteExists(sprite)) return;
  if (move == "next") {
    move = 1 + ((sprite.current_move + 1) % (ANIMATIONS[sprite.style].length - 1));
  } else if (move == "prev") {
    move = 1 + ((sprite.current_move - 1) % (ANIMATIONS[sprite.style].length - 1));
  } else if (move == "rand") {
    // Make sure random switches to a new move
    move = sprite.current_move;
    while (move == sprite.current_move) {
      move = randomNumber(0, ANIMATIONS[sprite.style].length - 1);
    }
  }
  sprite.mirroring = dir;
  sprite.mirrorX(dir);
  sprite.changeAnimation("anim" + move);
  if (sprite.animation.looping) sprite.looping_frame = 0;
  sprite.animation.looping = true;
  sprite.current_move = move;
}

exports.doMoveLR = function doMoveLR(sprite, move, dir) {
  if (!spriteExists(sprite)) return;
  if (move == "next") {
    move = (sprite.current_move + 1) % ANIMATIONS[sprite.style].length;
  } else if (move == "prev") {
    move = (sprite.current_move - 1) % ANIMATIONS[sprite.style].length;
  } else if (move == "rand") {
    move = sprite.current_move;
    while (move == sprite.current_move) {
      move = randomNumber(0, ANIMATIONS[sprite.style].length - 1);
    }
  }
  sprite.mirrorX(dir);
  sprite.changeAnimation("anim" + move);
  sprite.animation.looping = false;
  sprite.animation.changeFrame(FRAMES / 2);
}

exports.ifDanceIs = function ifDanceIs(sprite, dance, ifStatement, elseStatement) {
  if (!spriteExists(sprite)) return;
  if (sprite.current_dance == dance) {
    ifStatement();
  } else {
    elseStatement();
  }
}

// Group Blocks

exports.changeMoveEachLR = function changeMoveEachLR(group, move, dir) {
  if (typeof (group) == "string") {
    if (!sprites_by_type.hasOwnProperty(group)) {
      console.log("There is no group of " + group);
      return;
    }
    group = sprites_by_type[group];
  }
  group.forEach(function (sprite) {
    exports.changeMoveLR(sprite, move, dir);
  });
}

exports.doMoveEachLR = function doMoveEachLR(group, move, dir) {
  if (typeof(group) == "string") {
    if (!sprites_by_type.hasOwnProperty(group)) {
      console.log("There is no group of " + group);
      return;
    }
    group = sprites_by_type[group];
  }
  group.forEach(function (sprite) { exports.doMoveLR(sprite, move, dir);});
}

exports.layoutSprites = function layoutSprites(group, format) {
  if (typeof(group) == "string") {
    if (!sprites_by_type.hasOwnProperty(group)) {
      console.log("There is no group of " + group);
      return;
    }
    group = sprites_by_type[group];
    if (!group) return;
  }
  var count = group.length;
  var sprite, i, j;
  if (format == "grid") {
    var cols = Math.ceil(Math.sqrt(count));
    var rows = Math.ceil(count / cols);
    var current = 0;
    for (i=0; i<rows; i++) {
      if (count - current >= cols) {
        for (j=0; j<cols; j++) {
          sprite = group[current];
          sprite.x = (j+1) * (400 / (cols + 1));
          sprite.y = (i+1) * (400 / (rows + 1));
          current++;
        }
      } else {
        var remainder = count - current;
        for (j=0; j<remainder; j++) {
          sprite = group[current];
          sprite.x = (j+1) * (400 / (remainder + 1));
          sprite.y = (i+1) * (400 / (rows + 1));
          current++;
        }
      }
    }
  } else if (format == "row") {
    for (i=0; i<count; i++) {
      sprite = group[i];
      sprite.x = (i+1) * (400 / (count + 1));
      sprite.y = 200;
    }
  } else {
    for (i=0; i<count; i++) {
      sprite = group[i];
      sprite.x = 200;
      sprite.y = (i+1) * (400 / (count + 1));
    }
  }
}

// Properties

exports.setTint = function setTint(sprite, val) {
  exports.setProp(sprite, "tint", val);
}

exports.setProp = function setProp(sprite, property, val) {
  if (!spriteExists(sprite) || val === undefined) return;

  if (property == "scale") {
    sprite.scale = val / 100;
  } else if (property == "width" || property == "height") {
    sprite[property] = SIZE * (val / 100);
  } else if (property=="y") {
    sprite.y = World.height - val;
  } else if (property == "costume") {
    sprite.setAnimation(val);
  } else if (property == "tint" && typeof (val) == "number") {
    sprite.tint = "hsb(" + (Math.round(val) % 360) + ", 100%, 100%)";
  } else {
    sprite[property] = val;
  }
}

exports.getProp = function getProp(sprite, property) {
  if (!spriteExists(sprite)) return;

  if (property == "scale") {
    return sprite.scale * 100;
  } else if (property == "width" || property == "height") {
    return (sprite[property] / SIZE) * 100;
  } else if (property=="y") {
    return World.height - sprite.y;
  } else if (property == "costume") {
    return sprite.getAnimationLabel();
  } else if (property == "direction") {
    return p5.getDirection(sprite);
  } else {
    return sprite[property];
  }
}

exports.changePropBy = function changePropBy(sprite,  property, val) {
  if (!spriteExists(sprite) || val === undefined) return;

  if (property == "scale") {
    sprite.setScale(sprite.getScale() + val / 100);
    if (sprite.scale < 0) {
      sprite.scale = 0;
    }
  } else if (property == "width" || property == "height") {
    sprite[property] = p5.getProp(sprite, property) + (SIZE * (val / 100));
  } else if (property=="direction") {
    sprite.direction = p5.getDirection(sprite) + val;
  } else if (property=="y") {
    sprite.y-=val;
  } else {
    sprite[property] += val;
  }
}

exports.jumpTo = function jumpTo(sprite, location) {
  if (!spriteExists(sprite)) return;
  sprite.x = location.x;
  sprite.y = location.y;
}

exports.setDanceSpeed = function setDanceSpeed(sprite, speed) {
  if (!spriteExists(sprite)) return;
  sprite.dance_speed = speed;
}

// Music Helpers

exports.getEnergy = function getEnergy(range) {
  if (range == "low") {
    return Dance.fft.getEnergy(20, 200);
  } else if (range == "mid") {
    return Dance.fft.getEnergy(400, 2600);
  } else {
    return Dance.fft.getEnergy(2700, 4000);
  }
}

exports.nMeasures = function nMeasures(n) {
  return (240 * n) / song_meta.bpm;
}

exports.getTime = function getTime(unit) {
  if (unit == "measures") {
    return song_meta.bpm * (Dance.song.currentTime(0) / 240);
  } else {
    return Dance.song.currentTime(0);
  }
}

// Behaviors

function Behavior(func, extraArgs) {
  if (!extraArgs) {
    extraArgs = [];
  }
  this.func = func;
  this.extraArgs = extraArgs;
}

function addBehavior(sprite, behavior) {
  if (!spriteExists(sprite) || behavior === undefined) return;

  behavior = normalizeBehavior(behavior);

  if (findBehavior(sprite, behavior) !== -1) {
    return;
  }
  sprite.behaviors.push(behavior);
}

function removeBehavior(sprite, behavior) {
  if (!spriteExists(sprite) || behavior === undefined) return;

  behavior = normalizeBehavior(behavior);

  var index = findBehavior(sprite, behavior);
  if (index === -1) {
    return;
  }
  sprite.behaviors.splice(index, 1);
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

exports.startMapping = function startMapping(sprite, property, range) {
  var behavior = new Behavior(function (sprite) {
    var energy = Dance.fft.getEnergy(range);
    if (property == "x") {
      energy = Math.round(p5.map(energy, 0, 255, 50, 350));
    } else if (property == "y") {
      energy = Math.round(p5.map(energy, 0, 255, 350, 50));
    } else if (property == "scale") {
      energy = p5.map(energy, 0, 255, 0.5, 1.5);
    } else if (property == "width" || property == "height") {
      energy = p5.map(energy, 0, 255, 50, 150);
    } else if (property == "rotation" || property == "direction") {
      energy = Math.round(p5.map(energy, 0, 255, -180, 180));
    } else if (property == "tint") {
      energy = Math.round(p5.map(energy, 0, 255, 0, 360));
      energy = "hsb(" + energy + ",100%,100%)";
    }
    sprite[property] = energy;
  }, [property, range]);
  //behavior.func.name = "mapping" + property + range;
  addBehavior(sprite, behavior);
}

exports.stopMapping = function stopMapping(sprite, property, range) {
  var behavior = new Behavior(function (sprite) {
    var energy = Dance.fft.getEnergy(range);
    if (property == "x") {
      energy = Math.round(p5.map(energy, 0, 255, 50, 350));
    } else if (property == "y") {
      energy = Math.round(p5.map(energy, 0, 255, 350, 50));
    } else if (property == "scale") {
      energy = p5.map(energy, 0, 255, 0.5, 1.5);
    } else if (property == "width" || property == "height") {
      energy = p5.map(energy, 0, 255, 50, 159);
    } else if (property == "rotation" || property == "direction") {
      energy = Math.round(p5.map(energy, 0, 255, -180, 180));
    } else if (property == "tint") {
      energy = Math.round(p5.map(energy, 0, 255, 0, 360));
      energy = "hsb(" + energy + ",100%,100%)";
    }
    sprite[property] = energy;
  }, [property, range]);
  //behavior.func.name = "mapping" + property + range;
  removeBehavior(sprite, behavior);
}

exports.changeColorBy = function changeColorBy(input, method, amount) {
  p5.push();
  p5.colorMode(p5.HSB, 100);
  var c = p5.color(input);
  var hsb = {
    hue: c._getHue(),
    saturation: c._getSaturation(),
    brightness: c._getBrightness()
  };
  hsb[method] = Math.round((hsb[method] + amount) % 100);
  var new_c = p5.color(hsb.hue, hsb.saturation, hsb.brightness);
  p5.pop();
  return new_c;
}

exports.mixColors = function mixColors(color1, color2) {
  return p5.lerpColor(p5.color(color1), p5.color(color2), 0.5);
}

exports.randomColor = function randomColor() {
  return p5.color('hsb(' + randomNumber(0, 359) + ', 100%, 100%)').toString();
}

function spriteExists(sprite) {
  return p5.allSprites.indexOf(sprite) > -1;
}

exports.draw = function draw() {
  Dance.fft.analyze();

  p5.background("white");
  if (World.bg_effect) {
    World.bg_effect.draw();
  } else {
    bg_effects.none.draw();
  }

  if (p5.frameCount > 2) {
    // Perform sprite behaviors
    sprites.forEach(function (sprite) {
      sprite.behaviors.forEach(function (behavior) {
        behavior.func.apply(null, [sprite].concat(behavior.extraArgs));
      });
    });
  }

  p5.drawSprites();

  if (World.fg_effect != fg_effects.none) {
    p5.push();
    p5.blendMode(fg_effects.blend);
    World.fg_effect.draw();
    p5.pop();
  }

  p5.fill("black");
  p5.textStyle(p5.BOLD);
  p5.textAlign(p5.TOP, p5.LEFT);
  p5.textSize(20);
  p5.text("Measure: " + (Math.floor(((Dance.song.currentTime() - song_meta.delay) * song_meta.bpm) / 240) + 1), 10, 20);
}
  return exports;
}
