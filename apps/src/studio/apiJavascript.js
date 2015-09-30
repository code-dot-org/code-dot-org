// API definitions for functions exposed for JavaScript (droplet/ace) levels:

exports.setBackground = function (value) {
  Studio.queueCmd(null, 'setBackground', {'value': value});
};

exports.setWalls = function (value) {
  Studio.queueCmd(null, 'setWalls', {'value': value});
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

// setCharacter and setCharacterSpeed are wrappers to setSprite and
// setSpriteSpeed that always pass 0 for the spriteIndex (used by hoc2015)

exports.setCharacter = function (value) {
  Studio.queueCmd(null, 'setSprite', {
    'spriteIndex': 0,
    'value': value
  });
};

exports.setCharacterSpeed = function (value) {
  Studio.queueCmd(null, 'setSpriteSpeed', {
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

exports.moveEast = function() {
  Studio.queueCmd(null, 'moveEast');
};

exports.moveWest = function() {
  Studio.queueCmd(null, 'moveWest');
};

exports.moveNorth = function() {
  Studio.queueCmd(null, 'moveNorth');
};

exports.moveSouth = function() {
  Studio.queueCmd(null, 'moveSouth');
};

exports.changeScore = function(value) {
  Studio.queueCmd(null, 'changeScore', {'value': value});
};

exports.addItemsToScene = function(className, number) {
  Studio.queueCmd(null, 'addItemsToScene', {
    'className': className,
    'number': number
  });
};

exports.setItemActivity = function(className, type) {
  Studio.queueCmd(null, 'setItemActivity', {
    'className': className,
    'type': type
  });
};

exports.setItemSpeed = function(className, speed) {
  Studio.queueCmd(null, 'setItemSpeed', {
    'className': className,
    'speed': speed
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
