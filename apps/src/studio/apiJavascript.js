var constants = require('./constants');

// API definitions for functions exposed for JavaScript (droplet/ace) levels:

exports.setBackground = function (value) {
  Studio.queueCmd(null, 'setBackground', {'value': value});
};

exports.setMap = function (value) {
  Studio.queueCmd(null, 'setMap', {'value': value});
};

exports.setSprite = function (spriteIndex, value) {
  Studio.queueCmd(null, 'setSprite', {
    'spriteIndex': spriteIndex,
    'value': value
  });
};

exports.setSpriteEmotion = function (spriteIndex, value) {
  Studio.queueCmd(null, 'setSpriteEmotion', {
    'spriteIndex': spriteIndex,
    'value': value
  });
};

exports.setSpriteSpeed = function (spriteIndex, value) {
  Studio.queueCmd(null, 'setSpriteSpeed', {
    'spriteIndex': spriteIndex,
    'value': value
  });
};

// setBot and setBotSpeed are wrappers to setSprite and
// setSpriteSpeed that always pass 0 for the spriteIndex (used by hoc2015)

exports.setBot = function (value) {
  Studio.queueCmd(null, 'setSprite', {
    'spriteIndex': 0,
    'value': value
  });
};

exports.setBotSpeed = function (value) {
  Studio.queueCmd(null, 'setBotSpeed', {
    'spriteIndex': 0,
    'value': value
  });
};

/*
exports.setSpriteSize = function (spriteIndex, value) {
  Studio.queueCmd(null, 'setSpriteSize', {
    'spriteIndex': spriteIndex,
    'value': value
  });
};
*/

exports.setSpritePosition = function (spriteIndex, value) {
  Studio.queueCmd(null, 'setSpritePosition', {
    'spriteIndex': spriteIndex,
    'value': value
  });
};

/*
exports.setSpriteXY = function (spriteIndex, xpos, ypos) {
  Studio.queueCmd(null, 'setSpriteXY', {
    'spriteIndex': spriteIndex,
    'x': xpos,
    'y': ypos
  });
};
*/

exports.playSound = function(soundName) {
  Studio.queueCmd(null, 'playSound', {'soundName': soundName});
};

exports.throwProjectile = function(spriteIndex, dir, className) {
  Studio.queueCmd(null, 'throwProjectile', {
    'spriteIndex': spriteIndex,
    'dir': dir,
    'className': className
  });
};

/*
exports.makeProjectile = function(className, action) {
  Studio.queueCmd(null, 'makeProjectile', {
    'className': className,
    'action': action
  });
};
*/

exports.move = function(spriteIndex, dir) {
  Studio.queueCmd(null, 'move', {
    'spriteIndex': spriteIndex,
    'dir': dir
  });
};

exports.moveRight = function() {
  Studio.queueCmd(null, 'moveRight');
};

exports.moveLeft = function() {
  Studio.queueCmd(null, 'moveLeft');
};

exports.moveUp = function() {
  Studio.queueCmd(null, 'moveUp');
};

exports.moveDown = function() {
  Studio.queueCmd(null, 'moveDown');
};

exports.changeScore = function(value) {
  Studio.queueCmd(null, 'changeScore', {'value': value});
};

exports.addCharacter = function(className) {
  Studio.queueCmd(null, 'addItem', {
    'className': className
  });
};

exports.setToChase = function(className) {
  Studio.queueCmd(null, 'setItemActivity', {
    'className': className,
    'type': 'chase'
  });
};

exports.setToFlee = function(className) {
  Studio.queueCmd(null, 'setItemActivity', {
    'className': className,
    'type': 'flee'
  });
};

exports.setToRoam = function(className) {
  Studio.queueCmd(null, 'setItemActivity', {
    'className': className,
    'type': 'roam'
  });
};

exports.setToStop = function(className) {
  Studio.queueCmd(null, 'setItemActivity', {
    'className': className,
    'type': 'none'
  });
};

exports.moveFast = function(className, speed) {
  Studio.queueCmd(null, 'setItemSpeed', {
    'className': className,
    'speed': constants.SpriteSpeed.FAST
  });
};

exports.moveNormal = function(className, speed) {
  Studio.queueCmd(null, 'setItemSpeed', {
    'className': className,
    'speed': constants.SpriteSpeed.SLOW
  });
};

exports.moveSlow = function(className, speed) {
  Studio.queueCmd(null, 'setItemSpeed', {
    'className': className,
    'speed': constants.SpriteSpeed.VERY_SLOW
  });
};

exports.showDebugInfo = function(value) {
  Studio.queueCmd(null, 'showDebugInfo', {
    'value': value
  });
};

/*
exports.setScoreText = function(text) {
  Studio.queueCmd(null, 'setScoreText', {'text': text});
};

exports.showCoordinates = function() {
  Studio.queueCmd(null, 'showCoordinates', {});
};
*/

exports.vanish = function (spriteIndex) {
  Studio.queueCmd(null, 'vanish', {spriteIndex: spriteIndex});
};

exports.onEvent = function (eventName, func) {
  Studio.queueCmd(null, 'onEvent', {
    'eventName': eventName,
    'func': func
  });
};
