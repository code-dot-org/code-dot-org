import {commands as eventCommands} from './eventCommands';
import {commands as spriteCommands} from './spriteCommands';
import {commands as worldCommands} from './worldCommands';

export const commands = {
  beginCollectingData(costumeName, label) {
    eventCommands.repeatForever(() => {
      // Only log once per second, and assume the frame rate is approximately 30 frames/sec
      if (worldCommands.getTime.apply(this, ['frames']) % 30 === 0) {
        worldCommands.printText(
          `Time in seconds: ${worldCommands.getTime.apply(this, [
            'seconds'
          ])} | ${label}: ${spriteCommands.countByAnimation({
            costume: costumeName
          })}`
        );
      }
    });
  }
};
