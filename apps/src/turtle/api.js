var StudioApp = require('../base');
var utils = require('../utils');
var _ = utils.getLodash();

var ArtistAPI = function () {
  this.log = [];
};

module.exports = ArtistAPI;

ArtistAPI.drawCircle = function (size, id) {
  for (var i = 0; i < 36; i++) {
    exports.moveForward(size, id);
    exports.turnRight(10, id);
  }
};

ArtistAPI.drawSnowflake = function (type, id) {
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


ArtistAPI.moveForward = function(distance, id) {
  this.log.push(['FD', distance, id]);
};

ArtistAPI.moveBackward = function(distance, id) {
  this.log.push(['FD', -distance, id]);
};

ArtistAPI.moveUp = function(distance, id) {
  this.log.push(['MV', distance, 0, id]);
};

ArtistAPI.moveDown = function(distance, id) {
  this.log.push(['MV', distance, 180, id]);
};

ArtistAPI.moveLeft = function(distance, id) {
  this.log.push(['MV', distance, 270, id]);
};

ArtistAPI.moveRight = function(distance, id) {
  this.log.push(['MV', distance, 90, id]);
};

ArtistAPI.jumpUp = function(distance, id) {
  this.log.push(['JD', distance, 0, id]);
};

ArtistAPI.jumpDown = function(distance, id) {
  this.log.push(['JD', distance, 180, id]);
};

ArtistAPI.jumpLeft = function(distance, id) {
  this.log.push(['JD', distance, 270, id]);
};

ArtistAPI.jumpRight = function(distance, id) {
  this.log.push(['JD', distance, 90, id]);
};

ArtistAPI.jumpForward = function(distance, id) {
  this.log.push(['JF', distance, id]);
};

ArtistAPI.jumpBackward = function(distance, id) {
  this.log.push(['JF', -distance, id]);
};

ArtistAPI.turnRight = function(angle, id) {
  this.log.push(['RT', angle, id]);
};

ArtistAPI.turnLeft = function(angle, id) {
  this.log.push(['RT', -angle, id]);
};

ArtistAPI.penUp = function(id) {
  this.log.push(['PU', id]);
};

ArtistAPI.penDown = function(id) {
  this.log.push(['PD', id]);
};

ArtistAPI.penWidth = function(width, id) {
  this.log.push(['PW', Math.max(width, 0), id]);
};

ArtistAPI.penColour = function(colour, id) {
  this.log.push(['PC', colour, id]);
};

ArtistAPI.penPattern = function(pattern, id) {
  this.log.push(['PS', pattern, id]);
};

ArtistAPI.hideTurtle = function(id) {
  this.log.push(['HT', id]);
};

ArtistAPI.showTurtle = function(id) {
  this.log.push(['ST', id]);
};

ArtistAPI.drawStamp = function(stamp, id) {
  this.log.push(['stamp', stamp, id]);
};
