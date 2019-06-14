import {commands} from './commands';
import * as spriteUtils from './spriteUtils';

var Spritelab = function() {
  this.reset = () => spriteUtils.reset();

  this.commands = commands;
};

module.exports = Spritelab;
