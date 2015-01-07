var utils = require('../utils');
var _ = utils.getLodash();

var ArtistAPI = function () {
  this.log = [];
};

module.exports = ArtistAPI;

ArtistAPI.prototype.drawCircle = function (size, id) {
  for (var i = 0; i < 36; i++) {
    exports.moveForward(size, id);
    exports.turnRight(10, id);
  }
};

ArtistAPI.prototype.drawSnowflake = function (type, id) {
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


ArtistAPI.prototype.moveForward = function(distance, id) {
  this.log.push(['FD', distance, id]);
};

ArtistAPI.prototype.moveBackward = function(distance, id) {
  this.log.push(['FD', -distance, id]);
};

ArtistAPI.prototype.moveUp = function(distance, id) {
  this.log.push(['MV', distance, 0, id]);
};

ArtistAPI.prototype.moveDown = function(distance, id) {
  this.log.push(['MV', distance, 180, id]);
};

ArtistAPI.prototype.moveLeft = function(distance, id) {
  this.log.push(['MV', distance, 270, id]);
};

ArtistAPI.prototype.moveRight = function(distance, id) {
  this.log.push(['MV', distance, 90, id]);
};

ArtistAPI.prototype.jumpUp = function(distance, id) {
  this.log.push(['JD', distance, 0, id]);
};

ArtistAPI.prototype.jumpDown = function(distance, id) {
  this.log.push(['JD', distance, 180, id]);
};

ArtistAPI.prototype.jumpLeft = function(distance, id) {
  this.log.push(['JD', distance, 270, id]);
};

ArtistAPI.prototype.jumpRight = function(distance, id) {
  this.log.push(['JD', distance, 90, id]);
};

ArtistAPI.prototype.jumpForward = function(distance, id) {
  this.log.push(['JF', distance, id]);
};

ArtistAPI.prototype.jumpBackward = function(distance, id) {
  this.log.push(['JF', -distance, id]);
};

ArtistAPI.prototype.turnRight = function(angle, id) {
  this.log.push(['RT', angle, id]);
};

ArtistAPI.prototype.turnLeft = function(angle, id) {
  this.log.push(['RT', -angle, id]);
};

ArtistAPI.prototype.penUp = function(id) {
  this.log.push(['PU', id]);
};

ArtistAPI.prototype.penDown = function(id) {
  this.log.push(['PD', id]);
};

ArtistAPI.prototype.penWidth = function(width, id) {
  this.log.push(['PW', Math.max(width, 0), id]);
};

ArtistAPI.prototype.penColour = function(colour, id) {
  this.log.push(['PC', colour, id]);
};

ArtistAPI.prototype.penPattern = function(pattern, id) {
  this.log.push(['PS', pattern, id]);
};

ArtistAPI.prototype.hideTurtle = function(id) {
  this.log.push(['HT', id]);
};

ArtistAPI.prototype.showTurtle = function(id) {
  this.log.push(['ST', id]);
};

ArtistAPI.prototype.drawStamp = function(stamp, id) {
  this.log.push(['stamp', stamp, id]);
};
