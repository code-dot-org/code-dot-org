import {SpriteSize, SpriteSpeed} from './constants';
import {randomValue} from '../utils';

const toExport = {};

toExport.SpriteSpeed = SpriteSpeed;
toExport.SpriteSize = SpriteSize;

var SPEECH_BUBBLE_TIME = 3;

toExport.random = function (values) {
  return randomValue(values);
};

toExport.endGame = function (id, value) {
  Studio.queueCmd(id, 'endGame', {value: value});
};

toExport.setBackground = function (id, value) {
  Studio.queueCmd(id, 'setBackground', {value: value});
};

toExport.setMap = function (id, value) {
  Studio.queueCmd(id, 'setMap', {value: value});
};

toExport.setMapAndColor = function (id, color, value) {
  Studio.queueCmd(id, 'setMapAndColor', {
    value: value,
    color: color,
  });
};

toExport.setAllowSpritesOutsidePlayspace = function (id, value) {
  Studio.queueCmd(id, 'setAllowSpritesOutsidePlayspace', {
    value: value,
  });
};

toExport.setSprite = function (id, spriteIndex, value) {
  Studio.queueCmd(id, 'setSprite', {
    spriteIndex: spriteIndex,
    value: value,
  });
};

toExport.getSpriteVisibility = function (id, spriteIndex, callback) {
  Studio.queueCmd(id, 'getSpriteVisibility', {
    spriteIndex: spriteIndex,
    callback: callback,
  });
};

toExport.getSpriteValue = function (id, spriteIndex, callback) {
  Studio.queueCmd(id, 'getSpriteValue', {
    spriteIndex: spriteIndex,
    callback: callback,
  });
};

toExport.saySprite = function (id, spriteIndex, text, seconds) {
  if (seconds === undefined) {
    seconds = SPEECH_BUBBLE_TIME;
  }
  Studio.queueCmd(id, 'saySprite', {
    spriteIndex: spriteIndex,
    text: text,
    seconds: seconds,
  });
};

toExport.showTitleScreen = function (id, title, text) {
  Studio.queueCmd(id, 'showTitleScreen', {
    title: title,
    text: text,
  });
};

toExport.setSpriteEmotion = function (id, spriteIndex, value) {
  Studio.queueCmd(id, 'setSpriteEmotion', {
    spriteIndex: spriteIndex,
    value: value,
  });
};

toExport.getSpriteEmotion = function (id, spriteIndex, callback) {
  Studio.queueCmd(id, 'getSpriteEmotion', {
    spriteIndex: spriteIndex,
    callback: callback,
  });
};

toExport.setSpriteSpeed = function (id, spriteIndex, value) {
  Studio.queueCmd(id, 'setSpriteSpeed', {
    spriteIndex: spriteIndex,
    value: value,
  });
};

// setDroid is a wrapper to setSprite that always passes 0 for the spriteIndex
// (used by hoc2015)

toExport.setDroid = function (id, value) {
  Studio.queueCmd(id, 'setSprite', {
    spriteIndex: 0,
    value: value,
  });
};

toExport.setDroidSpeed = function (id, value) {
  Studio.queueCmd(id, 'setDroidSpeed', {
    value: value,
  });
};

toExport.setSpriteSize = function (id, spriteIndex, value) {
  Studio.queueCmd(id, 'setSpriteSize', {
    spriteIndex: spriteIndex,
    value: value,
  });
};

toExport.setSpritePosition = function (id, spriteIndex, value) {
  Studio.queueCmd(id, 'setSpritePosition', {
    spriteIndex: spriteIndex,
    value: Number(value),
  });
};

toExport.setSpriteXY = function (id, spriteIndex, xpos, ypos) {
  Studio.queueCmd(id, 'setSpriteXY', {
    spriteIndex: spriteIndex,
    x: Number(xpos),
    y: Number(ypos),
  });
};

toExport.getSpriteXY = function (id, spriteIndex, callback) {
  Studio.queueCmd(id, 'getSpriteXY', {
    spriteIndex: spriteIndex,
    callback: callback,
  });
};

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

toExport.addGoal = function (id, value) {
  Studio.queueCmd(id, 'addGoal', {
    value: Number(value),
  });
};

toExport.addGoalXY = function (id, x, y) {
  Studio.queueCmd(id, 'addGoal', {
    x: Number(x),
    y: Number(y),
  });
};

toExport.playSound = function (id, soundName) {
  Studio.queueCmd(id, 'playSound', {soundName: soundName});
};

toExport.stop = function (id, spriteIndex) {
  Studio.queueCmd(id, 'stop', {spriteIndex: spriteIndex});
};

toExport.throwProjectile = function (id, spriteIndex, dir, className) {
  Studio.queueCmd(id, 'throwProjectile', {
    spriteIndex: spriteIndex,
    dir: Number(dir),
    className: String(className),
  });
};

toExport.makeProjectile = function (id, className, action) {
  Studio.queueCmd(id, 'makeProjectile', {
    className: className,
    action: action,
  });
};

toExport.move = function (id, spriteIndex, dir) {
  Studio.queueCmd(id, 'move', {
    spriteIndex: spriteIndex,
    dir: Number(dir),
  });
};

toExport.moveDistance = function (id, spriteIndex, dir, distance) {
  Studio.queueCmd(id, 'moveDistance', {
    spriteIndex: spriteIndex,
    dir: dir,
    distance: distance,
  });
};

toExport.moveForward = function (id) {
  Studio.queueCmd(id, 'moveForward');
};

toExport.moveBackward = function (id) {
  Studio.queueCmd(id, 'moveBackward');
};

toExport.turnRight = function (id) {
  Studio.queueCmd(id, 'turnRight');
};

toExport.turnLeft = function (id) {
  Studio.queueCmd(id, 'turnLeft');
};

// addPoints is a wrapper for changeScore (used by hoc2015)

toExport.addPoints = function (id, value) {
  Studio.changeScore({value: value});
  Studio.queueCmd(id, 'displayScore', {});
};

// removePoints is a wrapper for reduceScore (used by hoc2015)

toExport.removePoints = function (id, value) {
  Studio.reduceScore({value: value});
  Studio.queueCmd(id, 'displayScore', {});
};

toExport.changeScore = function (id, value) {
  Studio.changeScore({value: value});
  Studio.queueCmd(id, 'displayScore', {});
};

toExport.getScore = function () {
  return Studio.playerScore;
};

toExport.setScore = function (value) {
  Studio.setScore(value);
};

toExport.addCharacter = function (id, className) {
  Studio.queueCmd(id, 'addItem', {
    className: className,
  });
};

toExport.setItemActivity = function (id, className, type) {
  Studio.queueCmd(id, 'setItemActivity', {
    className: className,
    type: type,
  });
};

toExport.setItemSpeed = function (id, className, speed) {
  Studio.queueCmd(id, 'setItemSpeed', {
    className: className,
    speed: speed,
  });
};

toExport.moveFast = function (id, className) {
  Studio.queueCmd(id, 'setItemSpeed', {
    className: className,
    speed: SpriteSpeed.FAST,
  });
};

toExport.moveNormal = function (id, className) {
  Studio.queueCmd(id, 'setItemSpeed', {
    className: className,
    speed: SpriteSpeed.SLOW,
  });
};

toExport.moveSlow = function (id, className) {
  Studio.queueCmd(id, 'setItemSpeed', {
    className: className,
    speed: SpriteSpeed.VERY_SLOW,
  });
};

toExport.showDebugInfo = function (value) {
  Studio.queueCmd(null, 'showDebugInfo', {
    value: value,
  });
};

toExport.setScoreText = function (id, text) {
  Studio.queueCmd(id, 'setScoreText', {text: text});
};

toExport.showCoordinates = function (id) {
  Studio.queueCmd(id, 'showCoordinates', {});
};

toExport.wait = function (id, value) {
  Studio.queueCmd(id, 'wait', {value: value});
};

toExport.vanish = function (id, spriteIndex) {
  Studio.queueCmd(id, 'vanish', {spriteIndex: spriteIndex});
};

toExport.onEvent = function (id, eventName, func) {
  Studio.queueCmd(id, 'onEvent', {
    eventName: String(eventName),
    func: func,
  });
};

toExport.askForInput = function (id, question, callback) {
  Studio.queueCmd(id, 'askForInput', {question, callback});
};

/**
 * @param {number} keyCode
 * @returns {boolean} True if key is currently down
 */
toExport.isKeyDown = function (keyCode) {
  return Studio.keyState[keyCode] === 'keydown';
};

export {toExport as default};
