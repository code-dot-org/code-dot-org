import {commands as actionCommands} from './actionCommands';
import {commands as behaviorCommands} from './behaviorCommands';
import {commands as spriteCommands} from './spriteCommands';

let commands = module.exports;

Object.assign(commands, actionCommands);
Object.assign(commands, behaviorCommands);
Object.assign(commands, spriteCommands);
