var constants = require('./constants');

exports.SpriteSpeed = constants.SpriteSpeed;
exports.SpriteSize = constants.SpriteSize;

var SPEECH_BUBBLE_TIME = 3;

exports.random = function (values) {
  var key = Math.floor(Math.random() * values.length);
  return values[key];
};

exports.endGame = function (id, value) {
  Studio.queueCmd(id, 'endGame', {'value': value});
};

exports.setBackground = function (id, value) {
  Studio.queueCmd(id, 'setBackground', {'value': value});
};

exports.setMap = function (id, value) {
  Studio.queueCmd(id, 'setMap', {'value': value});
};

exports.setSprite = function (id, spriteIndex, value) {
  Studio.queueCmd(id, 'setSprite', {
    'spriteIndex': spriteIndex,
    'value': value
  });
};

exports.saySprite = function (id, spriteIndex, text, seconds) {
  if (seconds === undefined) {
    seconds = SPEECH_BUBBLE_TIME;
  }
  Studio.queueCmd(id, 'saySprite', {
    'spriteIndex': spriteIndex,
    'text': text,
    'seconds': seconds
  });
};

exports.showTitleScreen = function (id, title, text) {
  Studio.queueCmd(id, 'showTitleScreen', {
    'title': title,
    'text': text
  });
};

exports.setSpriteEmotion = function (id, spriteIndex, value) {
  Studio.queueCmd(id, 'setSpriteEmotion', {
    'spriteIndex': spriteIndex,
    'value': value
  });
};

exports.setSpriteSpeed = function (id, spriteIndex, value) {
  Studio.queueCmd(id, 'setSpriteSpeed', {
    'spriteIndex': spriteIndex,
    'value': value
  });
};

// setDroid is a wrapper to setSprite that always passes 0 for the spriteIndex
// (used by hoc2015)

exports.setDroid = function (id, value) {
  Studio.queueCmd(id, 'setSprite', {
    'spriteIndex': 0,
    'value': value
  });
};

exports.setDroidSpeed = function (id, value) {
  Studio.queueCmd(id, 'setDroidSpeed', {
    'value': value
  });
};

exports.setSpriteSize = function (id, spriteIndex, value) {
  Studio.queueCmd(id, 'setSpriteSize', {
    'spriteIndex': spriteIndex,
    'value': value
  });
};

exports.setSpritePosition = function (id, spriteIndex, value) {
  Studio.queueCmd(id, 'setSpritePosition', {
    'spriteIndex': spriteIndex,
    'value': Number(value)
  });
};

exports.setSpriteXY = function (id, spriteIndex, xpos, ypos) {
  Studio.queueCmd(id, 'setSpriteXY', {
    'spriteIndex': spriteIndex,
    'x': Number(xpos),
    'y': Number(ypos)
  });
};

exports.addGoal = function (id, value) {
  Studio.queueCmd(id, 'addGoal', {
    'value': Number(value)
  });
};

exports.addGoalXY = function (id, x, y) {
  Studio.queueCmd(id, 'addGoal', {
    'x': Number(x),
    'y': Number(y)
  });
};

exports.playSound = function (id, soundName) {
  Studio.queueCmd(id, 'playSound', {'soundName': soundName});
};

exports.stop = function (id, spriteIndex) {
  Studio.queueCmd(id, 'stop', {'spriteIndex': spriteIndex});
};

exports.throwProjectile = function (id, spriteIndex, dir, className) {
  Studio.queueCmd(id, 'throwProjectile', {
    'spriteIndex': spriteIndex,
    'dir': Number(dir),
    'className': String(className)
  });
};

exports.makeProjectile = function (id, className, action) {
  Studio.queueCmd(id, 'makeProjectile', {
    'className': className,
    'action': action
  });
};

exports.move = function (id, spriteIndex, dir) {
  Studio.queueCmd(id, 'move', {
    'spriteIndex': spriteIndex,
    'dir': Number(dir)
  });
};

exports.moveDistance = function (id, spriteIndex, dir, distance) {
  Studio.queueCmd(id, 'moveDistance', {
    'spriteIndex': spriteIndex,
    'dir': dir,
    'distance': distance
  });
};

// addPoints is a wrapper for changeScore (used by hoc2015)

exports.addPoints = function (id, value) {
  Studio.queueCmd(id, 'changeScore', {'value': value});
};

// removePoints is a wrapper for reduceScore (used by hoc2015)

exports.removePoints = function (id, value) {
  Studio.queueCmd(id, 'reduceScore', {'value': value});
};

exports.changeScore = function (id, value) {
  Studio.queueCmd(id, 'changeScore', {'value': value});
};

exports.addCharacter = function (id, className) {
  Studio.queueCmd(id, 'addItem', {
    'className': className
  });
};

exports.setItemActivity = function (id, className, type) {
  Studio.queueCmd(id, 'setItemActivity', {
    'className': className,
    'type': type
  });
};

exports.setItemSpeed = function (id, className, speed) {
  Studio.queueCmd(id, 'setItemSpeed', {
    'className': className,
    'speed': speed
  });
};

exports.moveFast = function (id, className) {
  Studio.queueCmd(id, 'setItemSpeed', {
    'className': className,
    'speed': constants.SpriteSpeed.FAST
  });
};

exports.moveNormal = function (id, className) {
  Studio.queueCmd(id, 'setItemSpeed', {
    'className': className,
    'speed': constants.SpriteSpeed.SLOW
  });
};

exports.moveSlow = function (id, className) {
  Studio.queueCmd(id, 'setItemSpeed', {
    'className': className,
    'speed': constants.SpriteSpeed.VERY_SLOW
  });
};

exports.showDebugInfo = function (value) {
  Studio.queueCmd(null, 'showDebugInfo', {
    'value': value
  });
};

exports.setScoreText = function (id, text) {
  Studio.queueCmd(id, 'setScoreText', {'text': text});
};

exports.showCoordinates = function (id) {
  Studio.queueCmd(id, 'showCoordinates', {});
};

exports.wait = function (id, value) {
  Studio.queueCmd(id, 'wait', {'value': value});
};

exports.vanish = function (id, spriteIndex) {
  Studio.queueCmd(id, 'vanish', {spriteIndex: spriteIndex});
};

exports.onEvent = function (id, eventName, func) {
  Studio.queueCmd(id, 'onEvent', {
    'eventName': String(eventName),
    'func': func
  });
};

/**
 * @param {number} keyCode
 * @returns {boolean} True if key is currently down
 */
exports.isKeyDown = function (keyCode) {
  return Studio.keyState[keyCode] === 'keydown';
};
