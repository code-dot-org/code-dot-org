import {
  init,
  track,
  Identify,
  identify,
  setSessionId,
  flush
} from '@amplitude/analytics-browser';
import {BlockTypes} from '@cdo/apps/music/blockly/blockTypes';

const API_KEY_ENDPOINT = '/musiclab/analytics_key';

export default class AnalyticsReporter {
  constructor() {
    this.sessionInProgress = false;

    this.identifyObj = new Identify();
    this.sessionStartTime = null;
    this.maxInstructionsSeen = 1;
    this.currentInstructionsPage = 1;
    this.soundsUsed = new Set();
    this.blockStats = {
      endingBlockCount: 0,
      endingTriggerBlockCount: 0,
      endingTriggerBlocksWithCode: 0,
      maxBlockCount: 0,
      maxTriggerBlockCount: 0,
      maxTriggerBlocksWithCode: 0
    };
  }

  async startSession() {
    // Capture start time before making init call
    this.sessionStartTime = Date.now();

    await this.initialize();
    setSessionId(this.sessionStartTime);

    this.log(`Session start. Session ID: ${this.sessionStartTime}`);
    this.sessionInProgress = true;
  }

  async initialize() {
    const response = await fetch(API_KEY_ENDPOINT);
    const responseJson = await response.json();
    return init(responseJson.key, undefined, {minIdLength: 1}).promise;
  }

  setUserProperties(userId, userType, signInState) {
    if (!this.sessionInProgress) {
      this.log('No session in progress');
      return;
    }

    // Temporarily disabled, pending user privacy compliance discussions.
    // if (userId) {
    //   setUserId(hashString(userId));
    // }

    this.identifyObj.set('userType', userType);
    this.identifyObj.set('signInState', signInState);

    this.log(
      `User properties: userId: ${userId}, userType: ${userType}, signInState: ${signInState}`
    );
  }

  onButtonClicked(buttonName, properties) {
    if (!this.sessionInProgress) {
      this.log('No session in progress');
      return;
    }

    this.log(
      `Button clicked. Payload: ${JSON.stringify({buttonName, ...properties})}`
    );
    track('Button clicked', {buttonName, ...properties}).promise;
  }

  onInstructionsVisited(page) {
    if (!this.sessionInProgress) {
      this.log('No session in progress');
      return;
    }

    this.currentInstructionsPage = page;
    this.maxInstructionsSeen = Math.max(this.maxInstructionsSeen, page);
  }

  onBlocksUpdated(blocks) {
    if (!this.sessionInProgress) {
      this.log('No session in progress');
      return;
    }

    const totalBlockCount = blocks.length;
    let triggerBlocksCount = 0;
    let triggerBlocksWithCode = 0;
    blocks.forEach(block => {
      if (
        [BlockTypes.TRIGGERED_AT, BlockTypes.TRIGGERED_AT_SIMPLE].includes(
          block.type
        )
      ) {
        triggerBlocksCount++;
        if (block.getChildren().length > 0) {
          triggerBlocksWithCode++;
        }
      }

      if (block.type === BlockTypes.PLAY_SOUND) {
        this.soundsUsed.add(block.getFieldValue('sound'));
      }
    });

    this.blockStats = {
      endingBlockCount: totalBlockCount,
      endingTriggerBlockCount: triggerBlocksCount,
      endingTriggerBlocksWithCode: triggerBlocksWithCode,
      maxBlockCount: Math.max(this.blockStats.maxBlockCount, totalBlockCount),
      maxTriggerBlockCount: Math.max(
        this.blockStats.maxTriggerBlockCount,
        triggerBlocksCount
      ),
      maxTriggerBlocksWithCode: Math.max(
        this.blockStats.maxTriggerBlocksWithCode,
        triggerBlocksWithCode
      )
    };
  }

  endSession() {
    if (!this.sessionInProgress) {
      this.log('No session in progress');
      return;
    }
    const duration = Date.now() - this.sessionStartTime;
    this.sessionStartTime = null;
    this.sessionInProgress = false;

    identify(this.identifyObj);

    const payload = {
      durationSeconds: duration / 1000,
      mostInstructionsVisited: this.maxInstructionsSeen,
      lastInstructionsVisited: this.currentInstructionsPage,
      soundsUsed: Array.from(this.soundsUsed),
      blockStats: this.blockStats
    };
    track('Session end', payload);
    flush();
    this.log(`Session end. Payload: ${JSON.stringify(payload)}`);
  }

  log(message) {
    console.log(`[AMPLITUDE ANALYTICS EVENT]: ${message}`);
  }
}
