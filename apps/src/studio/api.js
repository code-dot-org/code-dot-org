var constants = require('./constants');

exports.SpriteSpeed = constants.SpriteSpeed;
exports.SpriteSize = constants.SpriteSize;

var SPEECH_BUBBLE_TIME = 3;

exports.random = function (values) {
  var key = Math.floor(Math.random() * values.length);
  return values[key];
};

exports.setBackground = function (id, value) {
  Studio.queueCmd(id, 'setBackground', {'value': value});
};

exports.setWalls = function (id, value) {
  Studio.queueCmd(id, 'setWalls', {'value': value});
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

exports.playSound = function(id, soundName) {
  Studio.queueCmd(id, 'playSound', {'soundName': soundName});
};

exports.stop = function(id, spriteIndex) {
  Studio.queueCmd(id, 'stop', {'spriteIndex': spriteIndex});
};

exports.throwProjectile = function(id, spriteIndex, dir, className) {
  Studio.queueCmd(id, 'throwProjectile', {
    'spriteIndex': spriteIndex,
    'dir': Number(dir),
    'className': String(className)
  });
};

exports.makeProjectile = function(id, className, action) {
  Studio.queueCmd(id, 'makeProjectile', {
    'className': className,
    'action': action
  });
};

exports.move = function(id, spriteIndex, dir) {
  Studio.queueCmd(id, 'move', {
    'spriteIndex': spriteIndex,
    'dir': Number(dir)
  });
};

exports.moveDistance = function(id, spriteIndex, dir, distance) {
  Studio.queueCmd(id, 'moveDistance', {
    'spriteIndex': spriteIndex,
    'dir': dir,
    'distance': distance
  });
};

exports.changeScore = function(id, value) {
  Studio.queueCmd(id, 'changeScore', {'value': value});
};

exports.addItemsToScene = function(id, className, number) {
  Studio.queueCmd(id, 'addItemsToScene', {
    'className': className,
    'number': number
  });
};

exports.setItemAction = function(id, itemIndex, type) {
  Studio.queueCmd(id, 'setItemAction', {
    'itemIndex': itemIndex,
    'type': type
  });
};

exports.showDebugInfo = function(value) {
  Studio.queueCmd(null, 'showDebugInfo', {
    'value': value
  });
};

exports.setScoreText = function(id, text) {
  Studio.queueCmd(id, 'setScoreText', {'text': text});
};

exports.showCoordinates = function(id) {
  Studio.queueCmd(id, 'showCoordinates', {});
};

exports.wait = function(id, value) {
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
