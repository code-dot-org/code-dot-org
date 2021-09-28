import SpriteLab from '../spritelab/SpriteLab';
import PoetryLibrary from './PoetryLibrary';

var Poetry = function() {
  SpriteLab.call(this);
};

Poetry.prototype = Object.create(SpriteLab.prototype);

Poetry.prototype.createLibrary = function(args) {
  if (!args.p5) {
    console.warn('cannot create poetry library without p5 instance');
    return;
  }
  return new PoetryLibrary(args.p5);
};

module.exports = Poetry;
