import {
  init,
  track,
  Identify,
  identify,
  setSessionId,
  flush
} from '@amplitude/analytics-browser';
import {Block} from 'blockly';

const BlockTypes = require('../blockly/blockTypes').BlockTypes;
const FIELD_SOUNDS_NAME = require('../blockly/constants').FIELD_SOUNDS_NAME;

const API_KEY_ENDPOINT = '/musiclab/analytics_key';

const blockFeatureList = [
  BlockTypes.FOR_LOOP,
  BlockTypes.REPEAT_SIMPLE2,
  'controls_repeat_ext',
  BlockTypes.PLAY_SOUNDS_TOGETHER,
  BlockTypes.PLAY_SOUNDS_SEQUENTIAL,
  'functions',
  BlockTypes.PLAY_REST_AT_CURRENT_LOCATION_SIMPLE2
];

const triggerBlocks = [
  BlockTypes.TRIGGERED_AT,
  BlockTypes.TRIGGERED_AT_SIMPLE,
  BlockTypes.TRIGGERED_AT_SIMPLE2,
  BlockTypes.NEW_TRACK_ON_TRIGGER
];

const functionBlocks = ['procedures_defnoreturn', 'procedures_callnoreturn'];

interface BlockStats {
  endingBlockCount: number;
  endingTriggerBlockCount: number;
  endingTriggerBlocksWithCode: number;
  maxBlockCount: number;
  maxTriggerBlockCount: number;
  maxTriggerBlocksWithCode: number;
}

interface SessionEndPayload {
  durationSeconds: number;
  mostInstructionsVisited: number;
  lastInstructionsVisited: number;
  soundsUsed: string[];
  blockStats: BlockStats;
  featuresUsed: {[feature: string]: boolean};
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
  private featuresUsed: {[feature: string]: boolean};

  constructor() {
    this.sessionInProgress = false;
    this.identifyObj = new Identify();
    this.sessionStartTime = -1;
    this.maxInstructionsSeen = 0;
    this.currentInstructionsPage = 0;
    this.soundsUsed = new Set();
    this.blockStats = {
      endingBlockCount: 0,
      endingTriggerBlockCount: 0,
      endingTriggerBlocksWithCode: 0,
      maxBlockCount: 0,
      maxTriggerBlockCount: 0,
      maxTriggerBlocksWithCode: 0
    };

    this.featuresUsed = {};
    blockFeatureList.forEach(feature => {
      this.featuresUsed[feature] = false;
    });
  }

  async startSession() {
    // Capture start time before making init call
    this.sessionStartTime = Date.now();

    await this.initialize();
    setSessionId(this.sessionStartTime);

    this.log(`Session start. Session ID: ${this.sessionStartTime}`);
    this.sessionInProgress = true;
  }

  async initialize(): Promise<void> {
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

  onButtonClicked(buttonName: string, properties: object) {
    if (!this.sessionInProgress) {
      this.log('No session in progress');
      return;
    }

    this.log(
      `Button clicked. Payload: ${JSON.stringify({buttonName, ...properties})}`
    );
    track('Button clicked', {buttonName, ...properties}).promise;
  }

  onVideoClosed(id: string, duration: number) {
    if (!this.sessionInProgress) {
      this.log('No session in progress');
      return;
    }

    this.log(
      `Video closed. Id: ${id}.  Duration: ${duration}}`
    );
    track('Video closed', {id, duration}).promise;
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
      if (triggerBlocks.includes(block.type)) {
        triggerBlocksCount++;
        if (block.getChildren(false).length > 0) {
          triggerBlocksWithCode++;
        }
      }

      if (blockFeatureList.includes(block.type)) {
        this.featuresUsed[block.type] = true;
      }

      if (functionBlocks.includes(block.type)) {
        this.featuresUsed.functions = true;
      }

      if (block.getField(FIELD_SOUNDS_NAME)) {
        this.soundsUsed.add(block.getFieldValue(FIELD_SOUNDS_NAME));
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

    const payload: SessionEndPayload = {
      durationSeconds: duration / 1000,
      mostInstructionsVisited: this.maxInstructionsSeen,
      lastInstructionsVisited: this.currentInstructionsPage,
      soundsUsed: Array.from(this.soundsUsed),
      blockStats: this.blockStats,
      featuresUsed: this.featuresUsed
    };

    track('Session end', payload);
    flush();

    this.log(`Session end. Payload: ${JSON.stringify(payload)}`);
  }

  log(message: string) {
    console.log(`[AMPLITUDE ANALYTICS EVENT]: ${message}`);
  }
}
