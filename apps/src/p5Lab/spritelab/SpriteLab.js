import P5Lab from '../P5Lab';

var SpriteLab = function() {
  P5Lab.call(this);
  console.log('spritelab');
};

SpriteLab.prototype = Object.create(P5Lab.prototype);

module.exports = SpriteLab;
