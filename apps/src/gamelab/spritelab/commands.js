import {commands as spriteCommands} from './spriteCommands';
import {commands as worldCommands} from './worldCommands';

let commands = module.exports;

Object.assign(commands, spriteCommands);
Object.assign(commands, worldCommands);
