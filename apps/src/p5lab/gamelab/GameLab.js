import P5Lab from '../P5Lab';

var GameLab = function() {
  P5Lab.call(this);
};

GameLab.prototype = Object.create(P5Lab.prototype);

module.exports = GameLab;
