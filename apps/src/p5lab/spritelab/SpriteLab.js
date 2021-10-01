import * as utils from '@cdo/apps/utils';
import msg from '@cdo/spritelab/locale';
import P5Lab from '../P5Lab';
import {P5LabType} from '../constants';
import Sounds from '@cdo/apps/Sounds';
import {getStore} from '@cdo/apps/redux';
import {clearConsole} from '../redux/textConsole';
import {clearPrompts, popPrompt} from '../redux/spritelabInput';
import CoreLibrary from './CoreLibrary';

export default class SpriteLab extends P5Lab {
  getAvatarUrl(levelInstructor) {
    const defaultAvatar = 'avatar';
    return `/blockly/media/spritelab/${levelInstructor || defaultAvatar}.png`;
  }

  getMsg() {
    return msg;
  }

  getLabType() {
    return P5LabType.SPRITELAB;
  }

  createLibrary(args) {
    if (!args.p5) {
      console.warn('cannot create SpriteLab library without p5 instance');
      return;
    }
    return new CoreLibrary(args.p5);
  }

  preview() {
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
  }

  reset() {
    super.reset();
    getStore().dispatch(clearPrompts());
    this.preview();
  }

  onPause(isPaused) {
    const current = new Date().getTime();
    if (isPaused) {
      this.spritelabLibrary.endPause(current);
    } else {
      this.spritelabLibrary.startPause(current);
    }
  }

  onPromptAnswer(variableName, value) {
    getStore().dispatch(popPrompt());
    this.spritelabLibrary.onPromptAnswer(variableName, value);
  }

  setupReduxSubscribers(store) {
    super.setupReduxSubscribers(store);
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
  }
}
