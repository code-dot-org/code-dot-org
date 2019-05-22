import {commands as spriteCommands} from './spriteCommands';
import {commands as worldCommands} from './worldCommands';
import {commands as locationCommands} from './locationCommands';

let commands = module.exports;

Object.assign(commands, spriteCommands);
Object.assign(commands, worldCommands);
Object.assign(commands, locationCommands);
