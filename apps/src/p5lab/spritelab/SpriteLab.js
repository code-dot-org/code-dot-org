import * as utils from '@cdo/apps/utils';
import P5Lab from '../P5Lab';
import {commands} from './commands';
import * as coreLibrary from './coreLibrary';
import Sounds from '@cdo/apps/Sounds';
import {getStore} from '@cdo/apps/redux';
import {clearConsole} from '../redux/textConsole';
import {clearPrompts} from '../redux/spritelabInput';

var SpriteLab = function() {
  P5Lab.call(this);
  this.commands = commands;
};

SpriteLab.prototype = Object.create(P5Lab.prototype);

module.exports = SpriteLab;

SpriteLab.prototype.preview = function() {
  if (getStore().getState().runState.isRunning) {
    return;
  }
  if (this.p5Wrapper.p5decrementPreload) {
    // preload is still in progress. This happens sometimes on initial page load because both the Gamelab reset
    // handler and the Blockly change handler call preview. The first call goes to the else case below and calls
    // p5Wrapper.startExecution (which starts the p5 preload phase). The second call would go into the first case
    // and, not knowing that preload is still in progress, would attempt to call p5.redraw(), and mess up the preview
    return;
  }
  coreLibrary.reset();
  getStore().dispatch(clearConsole());
  Sounds.getSingleton().muteURLs();
  if (this.p5Wrapper.p5 && this.JSInterpreter) {
    if (!this.areAnimationsReady_()) {
      return;
    }
    this.p5Wrapper.p5.allSprites.removeSprites();
    this.JSInterpreter.deinitialize();
    this.initInterpreter(false /* attachDebugger */);
    this.onP5Setup();
    this.p5Wrapper.p5.redraw();
  } else {
    this.p5Wrapper.startExecution();
    this.p5Wrapper.setLoop(false);
  }
};

SpriteLab.prototype.reset = function() {
  P5Lab.prototype.reset.call(this);
  coreLibrary.reset();
  getStore().dispatch(clearPrompts());
  this.preview();
};

SpriteLab.prototype.onPause = function(isPaused) {
  const current = new Date().getTime();
  if (isPaused) {
    coreLibrary.endPause(current);
  } else {
    coreLibrary.startPause(current);
  }
};

SpriteLab.prototype.setupReduxSubscribers = function(store) {
  P5Lab.prototype.setupReduxSubscribers.call(this, store);
  let state = {};
  store.subscribe(function() {
    const lastState = state;
    state = store.getState();

    if (
      lastState.animationList?.propsByKey !== state.animationList?.propsByKey
    ) {
      if (window.Blockly && Blockly.mainBlockSpace) {
        const customEvent = utils.createEvent(
          Blockly.BlockSpace.EVENTS.ANIMATIONS_CHANGED
        );
        Blockly.mainBlockSpace.events.dispatchEvent(customEvent);
      }
    }
  });
};
