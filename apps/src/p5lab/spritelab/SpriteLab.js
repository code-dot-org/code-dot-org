import React from 'react';

import {getStore} from '@cdo/apps/redux';
import Sounds from '@cdo/apps/Sounds';
import * as utils from '@cdo/apps/utils';
import msg from '@cdo/spritelab/locale';

import {closeWorkspaceAlert} from '../../code-studio/projectRedux';
import {singleton as studioApp} from '../../StudioApp';
import {P5LabType} from '../constants';
import P5Lab from '../P5Lab';
import {clearPrompts, popPrompt} from '../redux/spritelabInput';
import {clearConsole} from '../redux/textConsole';

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
    return new CoreLibrary(args.p5, this.JSInterpreter);
  }

  async preloadSpriteImages_() {
    await this.whenAnimationsAreReady();
    return this.p5Wrapper.preloadSpriteImages(
      getStore().getState().animationList
    );
  }

  preloadLabAssets() {
    return Promise.all([
      this.preloadSpriteImages_(),
      this.p5Wrapper.preloadBackgrounds(),
    ]);
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
    getStore().dispatch(closeWorkspaceAlert());
    getStore().dispatch(clearPrompts());
    this.clearExecutionErrorWorkspaceAlert();
    this.preview();
  }

  onPause(isPaused) {
    const current = new Date().getTime();
    if (isPaused) {
      this.library.endPause(current);
      Sounds.getSingleton().restartPausedSounds();
    } else {
      this.library.startPause(current);
      Sounds.getSingleton().pauseSounds();
    }
  }

  /**
   * If there is an executionError, display a WorkspaceAlert.
   * We do this because Sprite Lab has no user-facing console.
   */
  reactToExecutionError(msg) {
    if (!msg) {
      return;
    }

    this.executionErrorWorkspaceAlert = studioApp().displayWorkspaceAlert(
      'error',
      React.createElement(
        'div',
        {},
        this.getMsg().workspaceAlertError({
          error: msg || '',
        })
      ),
      true /* bottom */
    );
  }

  clearExecutionErrorWorkspaceAlert() {
    if (!this.executionErrorWorkspaceAlert) {
      return;
    }

    studioApp().closeAlert(this.executionErrorWorkspaceAlert);
    this.executionErrorWorkspaceAlert = undefined;
  }

  onPromptAnswer(variableName, value) {
    getStore().dispatch(popPrompt());
    this.library.onPromptAnswer(variableName, value);
  }

  setupReduxSubscribers(store) {
    super.setupReduxSubscribers(store);
    let state = {};
    store.subscribe(function () {
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

  /**
   * Override the string rendered by the feedback dialog, which always displays
   * another string for final freeplay levels, so this implementation is tightly coupled to
   * that. See FeedbackUtils.prototype.getFeedbackMessage for implementation details.
   * @param {boolean} isFinalFreePlayLevel
   * @returns {string|null}
   */
  getReinfFeedbackMsg(isFinalFreePlayLevel) {
    return isFinalFreePlayLevel ? null : this.getMsg().reinfFeedbackMsg();
  }

  runValidationCode() {
    // Skip validation code in 'editBlocks' mode (i.e., a levelbuilder is
    // editing start blocks for the level).
    if (this.level.editBlocks) {
      this.onPuzzleComplete(false /* submit */);
      return;
    }

    super.runValidationCode();
  }
}
