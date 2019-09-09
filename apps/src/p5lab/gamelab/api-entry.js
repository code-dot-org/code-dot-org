// entry point for api that gets exposed.
import {globalFunctions as utilFunctions} from '@cdo/apps/dropletUtilsGlobalFunctions';
import {
  commands as audioCommands,
  executors as audioExecutors,
  injectExecuteCmd
} from '@cdo/apps/lib/util/audioApi';
import MobileControls from './MobileControls';

function executeCmd(id, name, opts) {
  var retVal = false;
  if (audioCommands[name] instanceof Function) {
    retVal = audioCommands[name](opts);
  }
  return retVal;
}

injectExecuteCmd(executeCmd);

var mobileControls;

function initMobileControls(p5Inst) {
  mobileControls = new MobileControls();
  mobileControls.init({
    notifyKeyCodeDown: keyCode => p5Inst._onkeydown({which: keyCode}),
    notifyKeyCodeUp: keyCode => p5Inst._onkeyup({which: keyCode}),
    softButtonIds: []
  });
}

function showMobileControls(
  spaceButtonVisible,
  dpadVisible,
  dpadFourWay,
  mobileOnly
) {
  mobileControls.update({
    spaceButtonVisible,
    dpadVisible,
    dpadFourWay,
    mobileOnly
  });
}

const allFunctions = {
  ...audioExecutors,
  ...utilFunctions,
  initMobileControls,
  showMobileControls
};

for (let key in allFunctions) {
  if (!window[key]) {
    window[key] = allFunctions[key];
  }
}
