// API definitions for functions exposed for JavaScript (droplet/ace) levels:

const toExport = {};

toExport.endGame = function (value) {
  Studio.queueCmd(null, 'endGame', {value: value});
};

toExport.setBackground = function (value) {
  Studio.queueCmd(null, 'setBackground', {value: value});
};

toExport.setMap = function (value) {
  Studio.queueCmd(null, 'setMap', {value: value});
};

toExport.setMapAndColor = function (color, value) {
  Studio.queueCmd(null, 'setMapAndColor', {
    value: value,
    color: color,
  });
};

toExport.setAllowSpritesOutsidePlayspace = function (value) {
  Studio.queueCmd(null, 'setAllowSpritesOutsidePlayspace', {
    value: value,
  });
};

toExport.setSprite = function (spriteIndex, value) {
  Studio.queueCmd(null, 'setSprite', {
    spriteIndex: spriteIndex,
    value: value,
  });
};

toExport.setSpriteEmotion = function (spriteIndex, value) {
  Studio.queueCmd(null, 'setSpriteEmotion', {
    spriteIndex: spriteIndex,
    value: value,
  });
};

toExport.setSpriteSpeed = function (spriteIndex, value) {
  Studio.queueCmd(null, 'setSpriteSpeed', {
    spriteIndex: spriteIndex,
    value: value,
  });
};

// setDroid is a wrapper to setSprite that always passes 0 for the spriteIndex
// (used by hoc2015)

toExport.setDroid = function (value) {
  Studio.queueCmd(null, 'setSprite', {
    spriteIndex: 0,
    value: value,
  });
};

toExport.setDroidSpeed = function (value) {
  Studio.queueCmd(null, 'setDroidSpeed', {
    value: value,
  });
};

toExport.setSpriteSize = function (spriteIndex, value) {
  Studio.queueCmd(null, 'setSpriteSize', {
    spriteIndex: spriteIndex,
    value: value,
  });
};

toExport.setSpritePosition = function (spriteIndex, value) {
  Studio.queueCmd(null, 'setSpritePosition', {
    spriteIndex: spriteIndex,
    value: value,
  });
};

/*
toExport.setSpriteXY = function (spriteIndex, xpos, ypos) {
  Studio.queueCmd(null, 'setSpriteXY', {
    'spriteIndex': spriteIndex,
    'x': xpos,
    'y': ypos
  });
};
*/

toExport.setSpriteBehavior = function (
  id,
  spriteIndex,
  targetSpriteIndex,
  behavior
) {
  Studio.queueCmd(id, 'setSpriteBehavior', {
    spriteIndex,
    targetSpriteIndex,
    behavior,
  });
};

toExport.setSpritesWander = function (id, spriteName) {
  Studio.queueCmd(id, 'setSpritesWander', {
    spriteName: spriteName,
  });
};

toExport.setSpritesStop = function (id, spriteName) {
  Studio.queueCmd(id, 'setSpritesStop', {
    spriteName: spriteName,
  });
};

toExport.setSpritesChase = function (id, targetSpriteIndex, spriteName) {
  Studio.queueCmd(id, 'setSpritesChase', {
    spriteName: spriteName,
    targetSpriteIndex: targetSpriteIndex,
  });
};

toExport.setSpritesFlee = function (id, targetSpriteIndex, spriteName) {
  Studio.queueCmd(id, 'setSpritesFlee', {
    spriteName: spriteName,
    targetSpriteIndex: targetSpriteIndex,
  });
};

toExport.setSpritesSpeed = function (id, speed, spriteName) {
  Studio.queueCmd(id, 'setSpritesSpeed', {
    spriteName: spriteName,
    speed: speed,
  });
};

toExport.playSound = function (soundName) {
  Studio.queueCmd(null, 'playSound', {soundName: soundName});
};

toExport.throwProjectile = function (spriteIndex, dir, className) {
  Studio.queueCmd(null, 'throwProjectile', {
    spriteIndex: spriteIndex,
    dir: dir,
    className: className,
  });
};

/*
toExport.makeProjectile = function(className, action) {
  Studio.queueCmd(null, 'makeProjectile', {
    'className': className,
    'action': action
  });
};
*/

toExport.move = function (spriteIndex, dir) {
  Studio.queueCmd(null, 'move', {
    spriteIndex: spriteIndex,
    dir: dir,
  });
};

toExport.moveRight = function () {
  Studio.queueCmd(null, 'moveRight');
};

toExport.moveLeft = function () {
  Studio.queueCmd(null, 'moveLeft');
};

toExport.moveUp = function () {
  Studio.queueCmd(null, 'moveUp');
};

toExport.moveDown = function () {
  Studio.queueCmd(null, 'moveDown');
};

// goUp/Down/LeftRight are wrappers for moveUp/Down/Left/Right (used by hoc2015)
toExport.goRight = function () {
  Studio.queueCmd(null, 'moveRight');
};

toExport.goLeft = function () {
  Studio.queueCmd(null, 'moveLeft');
};

toExport.goUp = function () {
  Studio.queueCmd(null, 'moveUp');
};

toExport.goDown = function () {
  Studio.queueCmd(null, 'moveDown');
};

// addPoints is a wrapper for changeScore (used by hoc2015)

toExport.addPoints = function (value) {
  Studio.changeScore({value: value});
  Studio.queueCmd(null, 'displayScore', {});
};

// removePoints is a wrapper for reduceScore (used by hoc2015)

toExport.removePoints = function (value) {
  Studio.reduceScore({value: value});
  Studio.queueCmd(null, 'displayScore', {});
};

toExport.changeScore = function (value) {
  Studio.changeScore({value: value});
  Studio.queueCmd(null, 'displayScore', {});
};

toExport.getScore = function () {
  return Studio.playerScore;
};

toExport.setScore = function (value) {
  Studio.setScore(value);
};

toExport.addCharacter = function (className) {
  Studio.queueCmd(null, 'addItem', {
    className: className,
  });
};

toExport.setToChase = function (className) {
  Studio.queueCmd(null, 'setItemActivity', {
    className: className,
    type: 'chase',
  });
};

toExport.setToFlee = function (className) {
  Studio.queueCmd(null, 'setItemActivity', {
    className: className,
    type: 'flee',
  });
};

toExport.setToRoam = function (className) {
  Studio.queueCmd(null, 'setItemActivity', {
    className: className,
    type: 'roam',
  });
};

toExport.setToStop = function (className) {
  Studio.queueCmd(null, 'setItemActivity', {
    className: className,
    type: 'none',
  });
};

toExport.moveFast = function (className, speed) {
  Studio.queueCmd(null, 'setItemSpeed', {
    className: className,
    speed: 'fast',
  });
};

toExport.moveNormal = function (className, speed) {
  Studio.queueCmd(null, 'setItemSpeed', {
    className: className,
    speed: 'normal',
  });
};

toExport.moveSlow = function (className, speed) {
  Studio.queueCmd(null, 'setItemSpeed', {
    className: className,
    speed: 'slow',
  });
};

toExport.showDebugInfo = function (value) {
  Studio.queueCmd(null, 'showDebugInfo', {
    value: value,
  });
};

/*
toExport.setScoreText = function(text) {
  Studio.queueCmd(null, 'setScoreText', {'text': text});
};

toExport.showCoordinates = function() {
  Studio.queueCmd(null, 'showCoordinates', {});
};
*/

toExport.vanish = function (spriteIndex) {
  Studio.queueCmd(null, 'vanish', {spriteIndex: spriteIndex});
};

toExport.onEvent = function (eventName, func) {
  Studio.queueCmd(null, 'onEvent', {
    eventName: eventName,
    func: func,
  });
};

export default toExport;
