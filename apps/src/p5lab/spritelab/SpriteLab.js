import P5Lab from '../P5Lab';
import GameLab from '@cdo/apps/p5lab/gamelab/GameLab';

var SpriteLab = function() {
  P5Lab.call(this);
  this.gamelab = new GameLab();
};

SpriteLab.prototype = Object.create(P5Lab.prototype);

module.exports = SpriteLab;
