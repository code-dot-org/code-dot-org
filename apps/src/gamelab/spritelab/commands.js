import {commands as spriteCommands} from './spriteCommands';

let commands = module.exports;

commands.setBackground = function(color) {
  this.background(color);
};

Object.assign(commands, spriteCommands);
