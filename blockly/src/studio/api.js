var tiles = require('./tiles');

exports.SpriteSpeed = {
  VERY_SLOW: 2,
  SLOW: 3,
  NORMAL: 5,
  FAST: 8,
  VERY_FAST: 12,
};

exports.SpriteSize = {
  VERY_SMALL: 0.5,
  SMALL: 0.75,
  NORMAL: 1,
  LARGE: 1.5,
  VERY_LARGE: 2
};

exports.random = function (values) {
  var key = Math.floor(Math.random() * values.length);
  return values[key];
};

exports.setBackground = function (id, value) {
  Studio.queueCmd(id, 'setBackground', {'value': value});
};

exports.setSprite = function (id, spriteIndex, value) {
  Studio.queueCmd(id,
                  'setSprite',
                  {'spriteIndex': spriteIndex, 'value': value});
};

exports.saySprite = function (id, spriteIndex, text, opt_seconds) {
  Studio.queueCmd(id, 'saySprite', {'spriteIndex': spriteIndex, 'text': text,
      'seconds': opt_seconds});
};

exports.showTitleScreen = function (id, title, text) {
  Studio.queueCmd(id, 'showTitleScreen', {'title': title, 'text': text});
};

exports.setSpriteEmotion = function (id, spriteIndex, value) {
  Studio.queueCmd(id,
                  'setSpriteEmotion',
                  {'spriteIndex': spriteIndex, 'value': value});
};

exports.setSpriteSpeed = function (id, spriteIndex, value) {
  Studio.queueCmd(id,
                  'setSpriteSpeed',
                  {'spriteIndex': spriteIndex, 'value': value});
};

exports.setSpriteSize = function (id, spriteIndex, value) {
  Studio.queueCmd(id,
                  'setSpriteSize',
                  {'spriteIndex': spriteIndex, 'value': value});
};

exports.setSpritePosition = function (id, spriteIndex, value) {
  Studio.queueCmd(id,
                  'setSpritePosition',
                  {'spriteIndex': spriteIndex, 'value': value});
};

exports.playSound = function(id, soundName) {
  Studio.queueCmd(id, 'playSound', {'soundName': soundName});
};

exports.stop = function(id, spriteIndex) {
  Studio.queueCmd(id, 'stop', {'spriteIndex': spriteIndex});
};

exports.throwProjectile = function(id, spriteIndex, dir, className) {
  Studio.queueCmd(id,
                  'throwProjectile',
                  {'spriteIndex': spriteIndex,
                   'dir': dir,
                   'className': className});
};

exports.makeProjectile = function(id, className, action) {
  Studio.queueCmd(id,
                  'makeProjectile',
                  {'className': className, 'action': action});
};

exports.move = function(id, spriteIndex, dir) {
  Studio.queueCmd(id, 'move', {'spriteIndex': spriteIndex, 'dir': dir});
};

exports.moveDistance = function(id, spriteIndex, dir, distance) {
  Studio.queueCmd(
      id,
      'moveDistance',
      {'spriteIndex': spriteIndex, 'dir': dir, 'distance': distance});
};

exports.changeScore = function(id, value) {
  Studio.queueCmd(id, 'changeScore', {'value': value});
};

exports.setScoreText = function(id, text) {
  Studio.queueCmd(id, 'setScoreText', {'text': text});
};

exports.wait = function(id, value) {
  Studio.queueCmd(id, 'wait', {'value': value});
};

exports.vanish = function (id, spriteIndex) {
  Studio.queueCmd(id, 'vanish', {spriteIndex: spriteIndex});
};
