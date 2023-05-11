import {commands as actionCommands} from './actionCommands';
import {commands as behaviorCommands} from './behaviorCommands';
import {commands as criterionCommands} from './criterionCommands';
import {commands as eventCommands} from './eventCommands';
import {commands as locationCommands} from './locationCommands';
import {commands as spriteCommands} from './spriteCommands';
import {commands as storyLabCommands} from './storyLabCommands';
import {commands as worldCommands} from './worldCommands';
import {commands as validationCommands} from './validationCommands';

export default {
  ...actionCommands,
  ...behaviorCommands,
  ...criterionCommands,
  ...eventCommands,
  ...locationCommands,
  ...spriteCommands,
  ...storyLabCommands,
  ...worldCommands,
  ...validationCommands,
};
