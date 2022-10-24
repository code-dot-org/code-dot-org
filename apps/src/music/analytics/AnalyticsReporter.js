import {
  init,
  track,
  Identify,
  identify,
  setUserId,
  setSessionId
} from '@amplitude/analytics-browser';
import {BlockTypes} from '@cdo/apps/music/blockly/blockTypes';

const API_KEY = '12345';

export default class AnalyticsReporter {
  constructor() {
    // TODO: API Key
    init(API_KEY);
    this.sessionStartTime = null;
    this.maxInstructionsSeen = 1;
    this.currentInstructionsPage = 1;
    this.blockStats = {};
  }

  setUserProperties(userId, userType, signInState) {
    const identifyObj = new Identify();
    setUserId(userId || 'none');
    identifyObj.set('userType', userType);
    identifyObj.set('signInState', signInState);

    this.log(
      `User properties: userId: ${userId}, userType: ${userType}, signInState: ${signInState}`
    );
    identify(identifyObj);
  }

  onButtonClicked(buttonName) {
    track('Button clicked', {buttonName});
    this.log(`Button clicked. Payload: ${JSON.stringify({buttonName})}`);
  }

  onInstructionsVisited(page) {
    this.currentInstructionsPage = page;
    this.maxInstructionsSeen = Math.max(this.maxInstructionsSeen, page);
  }

  onBlocksUpdated(blocks) {
    const totalBlockCount = blocks.length;
    let triggerBlocksCount = 0;
    let triggerBlocksWithCode = 0;
    const soundsUsed = [];
    blocks.forEach(block => {
      if (block.type === BlockTypes.TRIGGERED_AT) {
        triggerBlocksCount++;
        if (block.getChildren().length > 0) {
          triggerBlocksWithCode++;
        }
      }

      if (
        block.type === BlockTypes.PLAY_SOUND ||
        block.type === BlockTypes.PLAY_SAMPLE
      ) {
        // Name of the sound is the third input
        soundsUsed.push(
          block
            .getInput('sound')
            .getFieldRow()[2]
            .getValue()
        );
      }
    });

    this.blockStats = {
      totalBlockCount,
      triggerBlocksCount,
      triggerBlocksWithCode,
      soundsUsed
    };
  }

  onSessionStart() {
    this.sessionStartTime = Date.now();
    setSessionId(this.sessionStartTime);

    this.log(`Session start. Session ID: ${this.sessionStartTime}`);
  }

  onSessionEnd() {
    if (this.sessionStartTime === null) {
      return;
    }
    const duration = Date.now() - this.sessionStartTime;
    // report duration event, and instructions seen events
    this.sessionStartTime = null;
    const payload = {
      durationSeconds: duration / 1000,
      mostInstructionsVisited: this.maxInstructionsSeen,
      lastInstructionsVisited: this.currentInstructionsPage,
      blockStats: this.blockStats
    };
    track('Session end', payload);
    this.log(`Session end. Payload: ${JSON.stringify(payload)}`);
  }

  log(message) {
    console.log(`[AMPLITUDE ANALYTICS EVENT]: ${message}`);
  }
}
