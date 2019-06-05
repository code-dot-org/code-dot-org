import {commands as behaviorCommands} from './behaviorCommands';
import {commands as spriteCommands} from './spriteCommands';

let commands = module.exports;

Object.assign(commands, behaviorCommands);
Object.assign(commands, spriteCommands);
