// entry point for api that gets exposed.
import {globalFunctions as utilFunctions} from '../dropletUtilsGlobalFunctions';
import {
  commands as audioCommands,
  executors as audioExecutors,
  injectExecuteCmd
} from '@cdo/apps/lib/util/audioApi';

function executeCmd(id, name, opts) {
  var retVal = false;
  if (audioCommands[name] instanceof Function) {
    retVal = audioCommands[name](opts);
  }
  return retVal;
}

injectExecuteCmd(executeCmd);

const allFunctions = {...audioExecutors, ...utilFunctions};

for (let key in allFunctions) {
  if (!window[key]) {
    window[key] = allFunctions[key];
  }
}
