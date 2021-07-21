import {commands as actionCommands} from './commands/actionCommands';
import {commands as behaviorCommands} from './commands/behaviorCommands';
import {commands as eventCommands} from './commands/eventCommands';
import {commands as locationCommands} from './commands/locationCommands';
import {commands as spriteCommands} from './commands/spriteCommands';
import {commands as worldCommands} from './commands/worldCommands';
import {commands as validationCommands} from './commands/validationCommands';

export const commands = {
  executeDrawLoopAndCallbacks() {
    this.drawBackground();
    this.runBehaviors();
    this.runEvents();
    this.p5.drawSprites();
    if (this.screenText.title || this.screenText.subtitle) {
      worldCommands.drawTitle.apply(this);
    }
  },
  ...actionCommands,
  ...behaviorCommands,
  ...eventCommands,
  ...locationCommands,
  ...spriteCommands,
  ...worldCommands,
  ...validationCommands
};
