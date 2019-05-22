import {commands as actionCommands} from './actionCommands';
import {commands as locationCommands} from './locationCommands';
import {commands as spriteCommands} from './spriteCommands';
import {commands as worldCommands} from './worldCommands';

let commands = module.exports;

commands.comment = function(text) {
  /* no-op */
};

Object.assign(commands, actionCommands);
Object.assign(commands, locationCommands);
Object.assign(commands, spriteCommands);
Object.assign(commands, worldCommands);
