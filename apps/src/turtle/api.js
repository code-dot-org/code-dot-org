var StudioApp = require('../base');
var utils = require('../utils');
var _ = utils.getLodash();

var TurtleAPI = function () {
  this.log = [];
};

module.exports = TurtleAPI;

TurtleAPI.drawCircle = function (size, id) {
  for (var i = 0; i < 36; i++) {
    exports.moveForward(size, id);
    exports.turnRight(10, id);
  }
};

TurtleAPI.drawSnowflake = function (type, id) {
  var i, j, k;

  // mirors Blockly.JavaScript.colour_random.
  var random_colour = function () {
    var colors = Blockly.FieldColour.COLOURS;
    return colors[Math.floor(Math.random()*colors.length)];
  };

  if (type === 'random') {
    type = _.sample(['fractal', 'flower', 'spiral', 'line', 'parallelogram', 'square']);
  }

  switch(type) {
    case 'fractal':
      for (i = 0; i < 8; i++) {
        exports.jumpForward(45, id);
        exports.turnLeft(45, id);
        for (j = 0; j < 3; j++) {
          for (k = 0; k < 3; k++) {
            exports.moveForward(15, id);
            exports.moveBackward(15, id);
            exports.turnRight(45, id);
          }
          exports.turnLeft(90, id);
          exports.moveBackward(15, id);
          exports.turnLeft(45, id);
        }
        exports.turnRight(90, id);
      }
      break;

    case 'flower':
      for (i = 0; i < 5; i++) {
        exports.drawCircle(2, id);
        exports.drawCircle(4, id);
        exports.turnRight(72, id);
      }
      break;

    case 'spiral':
      for (i = 0; i < 20; i++) {
        exports.drawCircle(3, id);
        exports.moveForward(20, id);
        exports.turnRight(18, id);
      }
      break;

    case 'line':
      for (i = 0; i < 90; i++) {
        exports.penColour(random_colour());
        exports.moveForward(50, id);
        exports.moveBackward(50, id);
        exports.turnRight(4, id);
      }
      exports.penColour("#FFFFFF", id);
      break;

    case 'parallelogram':
      for (i = 0; i < 10; i++) {
        for (j = 0; j < 2; j++) {
          exports.moveForward(50, id);
          exports.turnRight(60, id);
          exports.moveForward(50, id);
          exports.turnRight(120, id);
        }
        exports.turnRight(36, id);
      }
      break;

    case 'square':
      for (i = 0; i < 10; i++) {
        for (j = 0; j < 4; j++) {
          exports.moveForward(50, id);
          exports.turnRight(90, id);
        }
        exports.turnRight(36, id);
      }
      break;
  }
};


TurtleAPI.moveForward = function(distance, id) {
  this.log.push(['FD', distance, id]);
};

TurtleAPI.moveBackward = function(distance, id) {
  this.log.push(['FD', -distance, id]);
};

TurtleAPI.moveUp = function(distance, id) {
  this.log.push(['MV', distance, 0, id]);
};

TurtleAPI.moveDown = function(distance, id) {
  this.log.push(['MV', distance, 180, id]);
};

TurtleAPI.moveLeft = function(distance, id) {
  this.log.push(['MV', distance, 270, id]);
};

TurtleAPI.moveRight = function(distance, id) {
  this.log.push(['MV', distance, 90, id]);
};

TurtleAPI.jumpUp = function(distance, id) {
  this.log.push(['JD', distance, 0, id]);
};

TurtleAPI.jumpDown = function(distance, id) {
  this.log.push(['JD', distance, 180, id]);
};

TurtleAPI.jumpLeft = function(distance, id) {
  this.log.push(['JD', distance, 270, id]);
};

TurtleAPI.jumpRight = function(distance, id) {
  this.log.push(['JD', distance, 90, id]);
};

TurtleAPI.jumpForward = function(distance, id) {
  this.log.push(['JF', distance, id]);
};

TurtleAPI.jumpBackward = function(distance, id) {
  this.log.push(['JF', -distance, id]);
};

TurtleAPI.turnRight = function(angle, id) {
  this.log.push(['RT', angle, id]);
};

TurtleAPI.turnLeft = function(angle, id) {
  this.log.push(['RT', -angle, id]);
};

TurtleAPI.penUp = function(id) {
  this.log.push(['PU', id]);
};

TurtleAPI.penDown = function(id) {
  this.log.push(['PD', id]);
};

TurtleAPI.penWidth = function(width, id) {
  this.log.push(['PW', Math.max(width, 0), id]);
};

TurtleAPI.penColour = function(colour, id) {
  this.log.push(['PC', colour, id]);
};

TurtleAPI.penPattern = function(pattern, id) {
  this.log.push(['PS', pattern, id]);
};

TurtleAPI.hideTurtle = function(id) {
  this.log.push(['HT', id]);
};

TurtleAPI.showTurtle = function(id) {
  this.log.push(['ST', id]);
};

TurtleAPI.drawStamp = function(stamp, id) {
  this.log.push(['stamp', stamp, id]);
};
