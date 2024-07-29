import {
  init,
  track,
  Identify,
  identify,
  setSessionId,
  flush,
  setUserId,
} from '@amplitude/analytics-browser';
import {Block} from 'blockly';

import DCDO from '@cdo/apps/dcdo';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {
  getEnvironment,
  isDevelopmentEnvironment,
  isProductionEnvironment,
} from '@cdo/apps/utils';

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

const triggerBlocks: string[] = [
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

interface Session {
  startTime: number;
  soundsUsed: Set<string>;
  soundsPlayed: {[id: string]: number};
  blockStats: BlockStats;
  featuresUsed: {[feature: string]: boolean};
}

interface SessionEndPayload {
  durationSeconds: number;
  soundsUsed: string[];
  blockStats: BlockStats;
  featuresUsed: {[feature: string]: boolean};
  soundsPlayed: {[id: string]: number};
}

const trackedProjectProperties = [
  'levelType',
  'mode',
  'channelId',
  'levelPath',
  'scriptName',
] as const;

/**
 * An analytics reporter specifically used for the Music Lab prototype, which logs analytics
 * to Amplitude. For the more general Amplitude Analytics Reporter used across the application
 * outside of Music Lab, check {@link apps/src/lib/util/AnalyticsReporter}.
 */
export default class AnalyticsReporter {
  private initialized: boolean;
  private session: Session | undefined;

  constructor() {
    this.initialized = false;
  }

  async startSession() {
    // Capture start time before making init call
    const startTime = Date.now();

    try {
      await this.initialize();
      this.session = {
        startTime,
        soundsUsed: new Set(),
        soundsPlayed: {},
        blockStats: {
          endingBlockCount: 0,
          endingTriggerBlockCount: 0,
          endingTriggerBlocksWithCode: 0,
          maxBlockCount: 0,
          maxTriggerBlockCount: 0,
          maxTriggerBlocksWithCode: 0,
        },
        featuresUsed: {},
      };
      setSessionId(this.session.startTime);
      this.log(`Session start. Session ID: ${this.session.startTime}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.log(`Did not initialize analytics reporter.  (${message})`);

      // Log an error if this is not development. On development, this error is expected.
      if (!isDevelopmentEnvironment()) {
        Lab2Registry.getInstance()
          .getMetricsReporter()
          .logError(message, error as Error);
      }
    }
  }

  private async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    const response = await fetch(API_KEY_ENDPOINT);
    const responseJson = await response.json();

    if (!responseJson.key) {
      throw new Error('No key for analytics.');
    }

    init(responseJson.key);
    this.initialized = true;
  }

  isSessionInProgress() {
    return !!this.session;
  }

  setUserProperties(userId: number, userType: string, signInState: string) {
    if (!this.session) {
      this.log('No session in progress');
      return;
    }

    if (userId) {
      setUserId(this.formatUserId(userId));
    }

    const identifyEvent = new Identify();
    identifyEvent.set('userType', userType);
    identifyEvent.set('signInState', signInState);

    identify(identifyEvent);

    this.log(
      `User properties: userId: ${userId}, userType: ${userType}, signInState: ${signInState}`
    );
  }

  setProjectProperty(
    property: (typeof trackedProjectProperties)[number],
    value: string | number | undefined
  ) {
    if (!this.session) {
      this.log('No session in progress');
      return;
    }

    const identifyEvent = new Identify();
    if (value) {
      identifyEvent.set(property, value);
    } else {
      identifyEvent.unset(property);
    }
    identify(identifyEvent);
    this.log(`Project property: ${property}: ${value}`);
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

    if (!this.session) {
      this.log(`No session in progress.  (${logMessage})`);
      return;
    } else {
      this.log(logMessage);
    }

    track(eventType, payload).promise;
  }

  onSoundPlayed(id: string) {
    const shouldReport = DCDO.get('music-lab-samples-report', true);
    if (!shouldReport) {
      return;
    }
    if (!this.session) {
      this.log('No session in progress');
      return;
    }

    this.session.soundsPlayed[id] = 1 + (this.session.soundsPlayed[id] ?? 0);
  }

  onBlocksUpdated(blocks: Block[]) {
    if (!this.session) {
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

      if (this.session && blockFeatureList.includes(block.type)) {
        this.session.featuresUsed[block.type] = true;
      }

      if (this.session && functionBlocks.includes(block.type)) {
        this.session.featuresUsed.functions = true;
      }

      if (this.session && block.getField(FIELD_SOUNDS_NAME)) {
        this.session.soundsUsed.add(block.getFieldValue(FIELD_SOUNDS_NAME));
      }
    });

    this.session.blockStats = {
      endingBlockCount: totalBlockCount,
      endingTriggerBlockCount: triggerBlocksCount,
      endingTriggerBlocksWithCode: triggerBlocksWithCode,
      maxBlockCount: Math.max(
        this.session.blockStats.maxBlockCount,
        totalBlockCount
      ),
      maxTriggerBlockCount: Math.max(
        this.session.blockStats.maxTriggerBlockCount,
        triggerBlocksCount
      ),
      maxTriggerBlocksWithCode: Math.max(
        this.session.blockStats.maxTriggerBlocksWithCode,
        triggerBlocksWithCode
      ),
    };
  }

  endSession() {
    if (!this.session) {
      this.log('No session in progress');
      return;
    }
    const duration = Date.now() - this.session.startTime;

    const payload: SessionEndPayload = {
      durationSeconds: duration / 1000,
      soundsUsed: Array.from(this.session.soundsUsed),
      blockStats: this.session.blockStats,
      featuresUsed: this.session.featuresUsed,
      soundsPlayed: this.session.soundsPlayed,
    };

    this.session = undefined;

    track('Session end', payload);
    flush();

    this.log(`Session end. Payload: ${JSON.stringify(payload)}`);
  }

  log(message: string) {
    console.log(`[MUSIC AMPLITUDE ANALYTICS EVENT]: ${message}`);
  }

  private formatUserId(userId: number) {
    if (!userId) {
      return 'none';
    }
    const userIdString = userId.toString();
    if (isProductionEnvironment()) {
      return userIdString.padStart(5, '0');
    } else {
      const environment = getEnvironment();
      return `${environment}-${userIdString}`;
    }
  }
}
