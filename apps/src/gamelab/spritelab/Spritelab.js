import {commands} from './commands';
import * as spriteUtils from './spriteUtils';
import Sounds from '../../Sounds';
import {getStore} from '../../redux';
import {clearConsole} from '../textConsoleModule';

var Spritelab = function() {
  this.reset = () => spriteUtils.reset();

  this.preview = function() {
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
