exports.FlapHeight = {
  VERY_SMALL: -6,
  SMALL: -8,
  NORMAL: -11,
  LARGE: -13,
  VERY_LARGE: -15
};

exports.LevelSpeed = {
  VERY_SLOW: 1,
  SLOW: 3,
  NORMAL: 4,
  FAST: 6,
  VERY_FAST: 8
};

exports.GapHeight = {
  VERY_SMALL: 65,
  SMALL: 75,
  NORMAL: 100,
  LARGE: 125,
  VERY_LARGE: 150
};

exports.Gravity = {
  VERY_LOW: 0.5,
  LOW: 0.75,
  NORMAL: 1,
  HIGH: 1.25,
  VERY_HIGH: 1.5
};

exports.random = function (values) {
  var key = Math.floor(Math.random() * values.length);
  return values[key];
};

exports.setScore = function (id, value) {
  BlocklyApps.highlight(id);
  Flappy.playerScore = value;
  Flappy.displayScore();
};

exports.setGravity = function (id, value) {
  BlocklyApps.highlight(id);
  Flappy.gravity = value;
};

exports.setGround = function (id, value) {
  BlocklyApps.highlight(id);
  Flappy.setGround(value);
};

exports.setObstacle = function (id, value) {
  BlocklyApps.highlight(id);
  Flappy.setObstacle(value);
};

exports.setPlayer = function (id, value) {
  BlocklyApps.highlight(id);
  Flappy.setPlayer(value);
};

exports.setGapHeight = function (id, value) {
  BlocklyApps.highlight(id);
  Flappy.setGapHeight(value);
};

exports.setBackground = function (id, value) {
  BlocklyApps.highlight(id);
  Flappy.setBackground(value);
};

exports.setSpeed = function (id, value) {
  BlocklyApps.highlight(id);
  Flappy.SPEED = value;
};

exports.playSound = function(id, soundName) {
  BlocklyApps.highlight(id);
  BlocklyApps.playAudio(soundName);
};

exports.flap = function (id, amount) {
  BlocklyApps.highlight(id);
  Flappy.flap(amount);
};

exports.endGame = function (id) {
  BlocklyApps.highlight(id);
  Flappy.gameState = Flappy.GameStates.ENDING;
};

exports.incrementPlayerScore = function(id) {
  BlocklyApps.highlight(id);
  Flappy.playerScore++;
  Flappy.displayScore();
};
