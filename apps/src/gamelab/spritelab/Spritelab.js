import {commands} from './commands';
import * as spriteUtils from './spriteUtils';
import Sounds from '@cdo/apps/Sounds';
import {getStore} from '@cdo/apps/redux';
import {clearConsole} from '../textConsoleModule';

var Spritelab = function() {
  this.reset = () => spriteUtils.reset();

  this.preview = function() {
    if (getStore().getState().runState.isRunning) {
      return;
    }
    if (this.gameLabP5.p5decrementPreload) {
      // preload is still in progress. This happens sometimes on initial page load because both the Gamelab reset
      // handler and the Blockly change handler call preview. The first call goes to the else case below and calls
      // gameLabP5.startExecution (which starts the p5 preload phase). The second call would go into the first case
      // and, not knowing that preload is still in progress, would attempt to call p5.redraw(), and mess up the preview
      return;
    }
    spriteUtils.reset();
    getStore().dispatch(clearConsole());
    Sounds.getSingleton().muteURLs();
    if (this.gameLabP5.p5 && this.JSInterpreter) {
      if (!this.areAnimationsReady_()) {
        return;
      }
      this.gameLabP5.p5.allSprites.removeSprites();
      this.JSInterpreter.deinitialize();
      this.initInterpreter(false /* attachDebugger */);
      this.onP5Setup();
      this.gameLabP5.p5.redraw();
    } else {
      this.gameLabP5.startExecution();
      this.gameLabP5.setLoop(false);
    }
  };

  this.commands = commands;
};

module.exports = Spritelab;
