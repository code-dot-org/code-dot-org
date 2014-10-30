var BlocklyApps = require('../base');

exports.log = [];

exports.moveForward = function(distance, id) {
  this.log.push(['FD', distance, id]);
};

exports.moveBackward = function(distance, id) {
  this.log.push(['FD', -distance, id]);
};

exports.moveUp = function(distance, id) {
  this.log.push(['MV', distance, 0, id]);
};

exports.moveDown = function(distance, id) {
  this.log.push(['MV', distance, 180, id]);
};

exports.moveLeft = function(distance, id) {
  this.log.push(['MV', distance, 270, id]);
};

exports.moveRight = function(distance, id) {
  this.log.push(['MV', distance, 90, id]);
};

exports.jumpUp = function(distance, id) {
  this.log.push(['JD', distance, 0, id]);
};

exports.jumpDown = function(distance, id) {
  this.log.push(['JD', distance, 180, id]);
};

exports.jumpLeft = function(distance, id) {
  this.log.push(['JD', distance, 270, id]);
};

exports.jumpRight = function(distance, id) {
  this.log.push(['JD', distance, 90, id]);
};

exports.jumpForward = function(distance, id) {
  this.log.push(['JF', distance, id]);
};

exports.jumpBackward = function(distance, id) {
  this.log.push(['JF', -distance, id]);
};

exports.turnRight = function(angle, id) {
  this.log.push(['RT', angle, id]);
};

exports.turnLeft = function(angle, id) {
  this.log.push(['RT', -angle, id]);
};

exports.penUp = function(id) {
  this.log.push(['PU', id]);
};

exports.penDown = function(id) {
  this.log.push(['PD', id]);
};

exports.penWidth = function(width, id) {
  this.log.push(['PW', Math.max(width, 0), id]);
};

exports.penColour = function(colour, id) {
  this.log.push(['PC', colour, id]);
};

exports.penPattern = function(pattern, id) {
  this.log.push(['PS', pattern, id]);
};

exports.hideTurtle = function(id) {
  this.log.push(['HT', id]);
};

exports.showTurtle = function(id) {
  this.log.push(['ST', id]);
};

exports.drawStamp = function(stamp, id) {
  this.log.push(['stamp', stamp, id]);
};
