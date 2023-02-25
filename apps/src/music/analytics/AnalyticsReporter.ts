import {
  init,
  track,
  Identify,
  identify,
  setSessionId,
  flush
} from '@amplitude/analytics-browser';
import {Block} from 'blockly';

// Using require() to import JS in TS files
const BlockTypes = require('../blockly/blockTypes').BlockTypes;
const BlocklyConstants = require('../blockly/constants');

const API_KEY_ENDPOINT = '/musiclab/analytics_key';

interface BlockStats {
  endingBlockCount: number;
  endingTriggerBlockCount: number;
  endingTriggerBlocksWithCode: number;
  maxBlockCount: number;
  maxTriggerBlockCount: number;
  maxTriggerBlocksWithCode: number;
}

/**
 * An analytics reporter specifically used for the Music Lab prototype, which logs analytics
 * to Amplitude. For the more general Amplitude Analytics Reporter used across the application
 * outside of Music Lab, check {@link apps/src/lib/util/AnalyticsReporter}.
 */
export default class AnalyticsReporter {
  private sessionInProgress: boolean;
  private identifyObj: Identify;
  private sessionStartTime: number;
  private maxInstructionsSeen: number;
  private currentInstructionsPage: number;
  private soundsUsed: Set<string>;
  private blockStats: BlockStats;

  constructor() {
    this.sessionInProgress = false;

    this.identifyObj = new Identify();
    this.sessionStartTime = -1;
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

  private async initialize() {
    const response = await fetch(API_KEY_ENDPOINT);
    const responseJson = await response.json();
    return init(responseJson.key, undefined, {minIdLength: 1}).promise;
  }

  setUserProperties(userId: string, userType: string, signInState: string) {
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

  onButtonClicked(buttonName: string, properties: any) {
    if (!this.sessionInProgress) {
      this.log('No session in progress');
      return;
    }

    this.log(
      `Button clicked. Payload: ${JSON.stringify({buttonName, ...properties})}`
    );
    track('Button clicked', {buttonName, ...properties}).promise;
  }

  onInstructionsVisited(page: number) {
    if (!this.sessionInProgress) {
      this.log('No session in progress');
      return;
    }

    this.currentInstructionsPage = page;
    this.maxInstructionsSeen = Math.max(this.maxInstructionsSeen, page);
  }

  onBlocksUpdated(blocks: Block[]) {
    if (!this.sessionInProgress) {
      this.log('No session in progress');
      return;
    }

    const totalBlockCount = blocks.length;
    let triggerBlocksCount = 0;
    let triggerBlocksWithCode = 0;
    blocks.forEach(block => {
      if (
        [
          BlockTypes.TRIGGERED_AT,
          BlockTypes.TRIGGERED_AT_SIMPLE,
          BlockTypes.TRIGGERED_AT_SIMPLE2,
          BlockTypes.NEW_TRACK_ON_TRIGGER
        ].includes(block.type)
      ) {
        triggerBlocksCount++;
        if (block.getChildren(false).length > 0) {
          triggerBlocksWithCode++;
        }
      }

      if (block.getField(BlocklyConstants.FIELD_SOUNDS_NAME)) {
        this.soundsUsed.add(
          block.getFieldValue(BlocklyConstants.FIELD_SOUNDS_NAME)
        );
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
    this.sessionStartTime = -1;
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

  private log(message: string) {
    console.log(`[AMPLITUDE ANALYTICS EVENT]: ${message}`);
  }
}
