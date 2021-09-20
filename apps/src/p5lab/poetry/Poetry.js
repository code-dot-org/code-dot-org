import SpriteLab from '../spritelab/SpriteLab';

var Poetry = function() {
  SpriteLab.call(this);
};

Poetry.prototype = Object.create(SpriteLab.prototype);

module.exports = Poetry;
