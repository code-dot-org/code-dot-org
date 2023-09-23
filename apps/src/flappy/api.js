import {singleton as studioApp} from '../StudioApp';

export const FlapHeight = {
  VERY_SMALL: -6,
  SMALL: -8,
  NORMAL: -11,
  LARGE: -13,
  VERY_LARGE: -15,
};

export const LevelSpeed = {
  VERY_SLOW: 1,
  SLOW: 3,
  NORMAL: 4,
  FAST: 6,
  VERY_FAST: 8,
};

export const GapHeight = {
  VERY_SMALL: 65,
  SMALL: 75,
  NORMAL: 100,
  LARGE: 125,
  VERY_LARGE: 150,
};

export const Gravity = {
  VERY_LOW: 0.5,
  LOW: 0.75,
  NORMAL: 1,
  HIGH: 1.25,
  VERY_HIGH: 1.5,
};

export const random = function (values) {
  var key = Math.floor(Math.random() * values.length);
  return values[key];
};

export const setScore = function (id, value) {
  studioApp().highlight(id);
  Flappy.playerScore = value;
  Flappy.displayScore();
};

export const setGravity = function (id, value) {
  studioApp().highlight(id);
  Flappy.gravity = value;
};

export const setGround = function (id, value) {
  studioApp().highlight(id);
  Flappy.setGround(value);
};

export const setObstacle = function (id, value) {
  studioApp().highlight(id);
  Flappy.setObstacle(value);
};

export const setPlayer = function (id, value) {
  studioApp().highlight(id);
  Flappy.setPlayer(value);
};

export const setGapHeight = function (id, value) {
  studioApp().highlight(id);
  Flappy.setGapHeight(value);
};

export const setBackground = function (id, value) {
  studioApp().highlight(id);
  Flappy.setBackground(value);
};

export const setSpeed = function (id, value) {
  studioApp().highlight(id);
  Flappy.SPEED = value;
};

export const playSound = function (id, soundName) {
  studioApp().highlight(id);
  studioApp().playAudio(soundName);
};

export const flap = function (id, amount) {
  studioApp().highlight(id);
  Flappy.flap(amount);
};

export const endGame = function (id) {
  studioApp().highlight(id);
  Flappy.gameState = Flappy.GameStates.ENDING;
};

export const incrementPlayerScore = function (id) {
  studioApp().highlight(id);
  Flappy.playerScore++;
  Flappy.displayScore();
};
