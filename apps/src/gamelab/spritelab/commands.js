import {commands as actionCommands} from './actionCommands';
import {commands as behaviorCommands} from './behaviorCommands';
import {commands as eventCommands} from './eventCommands';
import {commands as locationCommands} from './locationCommands';
import {commands as spriteCommands} from './spriteCommands';
import {commands as worldCommands} from './worldCommands';

let commands = module.exports;

Object.assign(commands, actionCommands);
Object.assign(commands, behaviorCommands);
Object.assign(commands, eventCommands);
Object.assign(commands, locationCommands);
Object.assign(commands, spriteCommands);
Object.assign(commands, worldCommands);
