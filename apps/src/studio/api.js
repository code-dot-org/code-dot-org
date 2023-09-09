import {SpriteSize, SpriteSpeed} from './constants';
import {randomValue} from '../utils';

const exports = {};

exports.SpriteSpeed = SpriteSpeed;
exports.SpriteSize = SpriteSize;

var SPEECH_BUBBLE_TIME = 3;

exports.random = function (values) {
  return randomValue(values);
};

exports.endGame = function (id, value) {
  Studio.queueCmd(id, 'endGame', {value: value});
};

exports.setBackground = function (id, value) {
  Studio.queueCmd(id, 'setBackground', {value: value});
};

exports.setMap = function (id, value) {
  Studio.queueCmd(id, 'setMap', {value: value});
};

exports.setMapAndColor = function (id, color, value) {
  Studio.queueCmd(id, 'setMapAndColor', {
    value: value,
    color: color,
  });
};

exports.setAllowSpritesOutsidePlayspace = function (id, value) {
  Studio.queueCmd(id, 'setAllowSpritesOutsidePlayspace', {
    value: value,
  });
};

exports.setSprite = function (id, spriteIndex, value) {
  Studio.queueCmd(id, 'setSprite', {
    spriteIndex: spriteIndex,
    value: value,
  });
};

exports.getSpriteVisibility = function (id, spriteIndex, callback) {
  Studio.queueCmd(id, 'getSpriteVisibility', {
    spriteIndex: spriteIndex,
    callback: callback,
  });
};

exports.getSpriteValue = function (id, spriteIndex, callback) {
  Studio.queueCmd(id, 'getSpriteValue', {
    spriteIndex: spriteIndex,
    callback: callback,
  });
};

exports.saySprite = function (id, spriteIndex, text, seconds) {
  if (seconds === undefined) {
    seconds = SPEECH_BUBBLE_TIME;
  }
  Studio.queueCmd(id, 'saySprite', {
    spriteIndex: spriteIndex,
    text: text,
    seconds: seconds,
  });
};

exports.showTitleScreen = function (id, title, text) {
  Studio.queueCmd(id, 'showTitleScreen', {
    title: title,
    text: text,
  });
};

exports.setSpriteEmotion = function (id, spriteIndex, value) {
  Studio.queueCmd(id, 'setSpriteEmotion', {
    spriteIndex: spriteIndex,
    value: value,
  });
};

exports.getSpriteEmotion = function (id, spriteIndex, callback) {
  Studio.queueCmd(id, 'getSpriteEmotion', {
    spriteIndex: spriteIndex,
    callback: callback,
  });
};

exports.setSpriteSpeed = function (id, spriteIndex, value) {
  Studio.queueCmd(id, 'setSpriteSpeed', {
    spriteIndex: spriteIndex,
    value: value,
  });
};

// setDroid is a wrapper to setSprite that always passes 0 for the spriteIndex
// (used by hoc2015)

exports.setDroid = function (id, value) {
  Studio.queueCmd(id, 'setSprite', {
    spriteIndex: 0,
    value: value,
  });
};

exports.setDroidSpeed = function (id, value) {
  Studio.queueCmd(id, 'setDroidSpeed', {
    value: value,
  });
};

exports.setSpriteSize = function (id, spriteIndex, value) {
  Studio.queueCmd(id, 'setSpriteSize', {
    spriteIndex: spriteIndex,
    value: value,
  });
};

exports.setSpritePosition = function (id, spriteIndex, value) {
  Studio.queueCmd(id, 'setSpritePosition', {
    spriteIndex: spriteIndex,
    value: Number(value),
  });
};

exports.setSpriteXY = function (id, spriteIndex, xpos, ypos) {
  Studio.queueCmd(id, 'setSpriteXY', {
    spriteIndex: spriteIndex,
    x: Number(xpos),
    y: Number(ypos),
  });
};

exports.getSpriteXY = function (id, spriteIndex, callback) {
  Studio.queueCmd(id, 'getSpriteXY', {
    spriteIndex: spriteIndex,
    callback: callback,
  });
};

exports.setSpriteBehavior = function (
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

exports.setSpritesWander = function (id, spriteName) {
  Studio.queueCmd(id, 'setSpritesWander', {
    spriteName: spriteName,
  });
};

exports.setSpritesStop = function (id, spriteName) {
  Studio.queueCmd(id, 'setSpritesStop', {
    spriteName: spriteName,
  });
};

exports.setSpritesChase = function (id, targetSpriteIndex, spriteName) {
  Studio.queueCmd(id, 'setSpritesChase', {
    spriteName: spriteName,
    targetSpriteIndex: targetSpriteIndex,
  });
};

exports.setSpritesFlee = function (id, targetSpriteIndex, spriteName) {
  Studio.queueCmd(id, 'setSpritesFlee', {
    spriteName: spriteName,
    targetSpriteIndex: targetSpriteIndex,
  });
};

exports.setSpritesSpeed = function (id, speed, spriteName) {
  Studio.queueCmd(id, 'setSpritesSpeed', {
    spriteName: spriteName,
    speed: speed,
  });
};

exports.addGoal = function (id, value) {
  Studio.queueCmd(id, 'addGoal', {
    value: Number(value),
  });
};

exports.addGoalXY = function (id, x, y) {
  Studio.queueCmd(id, 'addGoal', {
    x: Number(x),
    y: Number(y),
  });
};

exports.playSound = function (id, soundName) {
  Studio.queueCmd(id, 'playSound', {soundName: soundName});
};

exports.stop = function (id, spriteIndex) {
  Studio.queueCmd(id, 'stop', {spriteIndex: spriteIndex});
};

exports.throwProjectile = function (id, spriteIndex, dir, className) {
  Studio.queueCmd(id, 'throwProjectile', {
    spriteIndex: spriteIndex,
    dir: Number(dir),
    className: String(className),
  });
};

exports.makeProjectile = function (id, className, action) {
  Studio.queueCmd(id, 'makeProjectile', {
    className: className,
    action: action,
  });
};

exports.move = function (id, spriteIndex, dir) {
  Studio.queueCmd(id, 'move', {
    spriteIndex: spriteIndex,
    dir: Number(dir),
  });
};

exports.moveDistance = function (id, spriteIndex, dir, distance) {
  Studio.queueCmd(id, 'moveDistance', {
    spriteIndex: spriteIndex,
    dir: dir,
    distance: distance,
  });
};

exports.moveForward = function (id) {
  Studio.queueCmd(id, 'moveForward');
};

exports.moveBackward = function (id) {
  Studio.queueCmd(id, 'moveBackward');
};

exports.turnRight = function (id) {
  Studio.queueCmd(id, 'turnRight');
};

exports.turnLeft = function (id) {
  Studio.queueCmd(id, 'turnLeft');
};

// addPoints is a wrapper for changeScore (used by hoc2015)

exports.addPoints = function (id, value) {
  Studio.changeScore({value: value});
  Studio.queueCmd(id, 'displayScore', {});
};

// removePoints is a wrapper for reduceScore (used by hoc2015)

exports.removePoints = function (id, value) {
  Studio.reduceScore({value: value});
  Studio.queueCmd(id, 'displayScore', {});
};

exports.changeScore = function (id, value) {
  Studio.changeScore({value: value});
  Studio.queueCmd(id, 'displayScore', {});
};

exports.getScore = function () {
  return Studio.playerScore;
};

exports.setScore = function (value) {
  Studio.setScore(value);
};

exports.addCharacter = function (id, className) {
  Studio.queueCmd(id, 'addItem', {
    className: className,
  });
};

exports.setItemActivity = function (id, className, type) {
  Studio.queueCmd(id, 'setItemActivity', {
    className: className,
    type: type,
  });
};

exports.setItemSpeed = function (id, className, speed) {
  Studio.queueCmd(id, 'setItemSpeed', {
    className: className,
    speed: speed,
  });
};

exports.moveFast = function (id, className) {
  Studio.queueCmd(id, 'setItemSpeed', {
    className: className,
    speed: SpriteSpeed.FAST,
  });
};

exports.moveNormal = function (id, className) {
  Studio.queueCmd(id, 'setItemSpeed', {
    className: className,
    speed: SpriteSpeed.SLOW,
  });
};

exports.moveSlow = function (id, className) {
  Studio.queueCmd(id, 'setItemSpeed', {
    className: className,
    speed: SpriteSpeed.VERY_SLOW,
  });
};

exports.showDebugInfo = function (value) {
  Studio.queueCmd(null, 'showDebugInfo', {
    value: value,
  });
};

exports.setScoreText = function (id, text) {
  Studio.queueCmd(id, 'setScoreText', {text: text});
};

exports.showCoordinates = function (id) {
  Studio.queueCmd(id, 'showCoordinates', {});
};

exports.wait = function (id, value) {
  Studio.queueCmd(id, 'wait', {value: value});
};

exports.vanish = function (id, spriteIndex) {
  Studio.queueCmd(id, 'vanish', {spriteIndex: spriteIndex});
};

exports.onEvent = function (id, eventName, func) {
  Studio.queueCmd(id, 'onEvent', {
    eventName: String(eventName),
    func: func,
  });
};

exports.askForInput = function (id, question, callback) {
  Studio.queueCmd(id, 'askForInput', {question, callback});
};

/**
 * @param {number} keyCode
 * @returns {boolean} True if key is currently down
 */
exports.isKeyDown = function (keyCode) {
  return Studio.keyState[keyCode] === 'keydown';
};

export default exports;
