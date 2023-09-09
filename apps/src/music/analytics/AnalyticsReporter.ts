import {
  init,
  track,
  Identify,
  identify,
  setSessionId,
  flush,
} from '@amplitude/analytics-browser';
import Lab2MetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';
import {isDevelopmentEnvironment} from '@cdo/apps/utils';
import {Block} from 'blockly';

import {BlockTypes} from '../blockly/blockTypes';
import {FIELD_SOUNDS_NAME} from '../blockly/constants';

const API_KEY_ENDPOINT = '/musiclab/analytics_key';

const blockFeatureList = [
  BlockTypes.FOR_LOOP,
  BlockTypes.REPEAT_SIMPLE2,
  'controls_repeat_ext',
  BlockTypes.PLAY_SOUNDS_TOGETHER,
  BlockTypes.PLAY_SOUNDS_SEQUENTIAL,
  'functions',
  BlockTypes.PLAY_REST_AT_CURRENT_LOCATION_SIMPLE2,
];

const triggerBlocks = [
  BlockTypes.TRIGGERED_AT,
  BlockTypes.TRIGGERED_AT_SIMPLE,
  BlockTypes.TRIGGERED_AT_SIMPLE2,
  BlockTypes.NEW_TRACK_ON_TRIGGER,
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
      maxTriggerBlocksWithCode: 0,
    };

    this.featuresUsed = {};
    blockFeatureList.forEach(feature => {
      this.featuresUsed[feature] = false;
    });
  }

  async startSession() {
    // Capture start time before making init call
    this.sessionStartTime = Date.now();

    try {
      await this.initialize();
      setSessionId(this.sessionStartTime);

      this.log(`Session start. Session ID: ${this.sessionStartTime}`);
      this.sessionInProgress = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(
        `[AMPLITUDE ANALYTICS] Did not initialize analytics reporter.  (${message})`
      );

      // Log an error if this is not development. On development, this error is expected.
      if (!isDevelopmentEnvironment()) {
        Lab2MetricsReporter.logError(message, error as Error);
      }
    }
  }

  async initialize(): Promise<void> {
    const response = await fetch(API_KEY_ENDPOINT);
    const responseJson = await response.json();

    if (!responseJson.key) {
      throw new Error('No key for analytics.');
    }

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

  onButtonClicked(buttonName: string, properties?: object) {
    this.trackUIEvent('Button clicked', {
      buttonName,
      ...properties,
    });
  }

  onKeyPressed(keyName: string, properties?: object) {
    this.trackUIEvent('Key pressed', {
      keyName,
      ...properties,
    });
  }

  private trackUIEvent(eventType: string, payload: object) {
    const logMessage = `${eventType}. Payload: ${JSON.stringify(payload)}`;

    if (!this.sessionInProgress) {
      this.log(`No session in progress.  (${logMessage})`);
      return;
    } else {
      this.log(logMessage);
    }

    track(eventType, payload).promise;
  }

  onVideoClosed(id: string, duration: number) {
    const logMessage = `Video closed. Id: ${id}. Duration: ${duration}}`;

    if (!this.sessionInProgress) {
      this.log(`No session in progress.  (${logMessage})`);
      return;
    } else {
      this.log(logMessage);
    }

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
      if (triggerBlocks.includes(block.type as BlockTypes)) {
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
      ),
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
      featuresUsed: this.featuresUsed,
    };

    track('Session end', payload);
    flush();

    this.log(`Session end. Payload: ${JSON.stringify(payload)}`);
  }

  log(message: string) {
    console.log(`[AMPLITUDE ANALYTICS EVENT]: ${message}`);
  }
}
