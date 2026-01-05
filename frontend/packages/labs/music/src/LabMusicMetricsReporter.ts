import type * as Blockly from 'blockly/core';

import {LabRegistry} from '@code-dot-org/lab';
import {
  DCDO,
  environment,
  AnalyticsReporter,
  GoogleAnalytics,
} from '@code-dot-org/metrics';

import {BlockTypes} from './blockly/blockTypes';
import {FIELD_SOUNDS_NAME} from './blockly/constants';

const {getEnvironment, isDevelopmentEnvironment, isProductionEnvironment} =
  environment;

const API_KEY_ENDPOINT = '/musiclab/analytics_key';

const blockFeatureList = [
  BlockTypes.FOR_LOOP,
  BlockTypes.REPEAT_SIMPLE2,
  'controls_repeat_ext',
  BlockTypes.PLAY_SOUNDS_TOGETHER,
  BlockTypes.PLAY_SOUNDS_SEQUENTIAL,
  'functions',
  BlockTypes.PLAY_REST_AT_CURRENT_LOCATION_SIMPLE2,
  BlockTypes.PLAY_PATTERN_AI_AT_CURRENT_LOCATION_SIMPLE2,
  BlockTypes.PLAY_TUNE_AT_CURRENT_LOCATION_SIMPLE2,
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

type ProjectSession = {
  [key in TrackedProjectProperties]: string | number | undefined;
};

interface CommonSessionFields {
  blockStats: BlockStats;
  featuresUsed: {[feature: string]: boolean};
  soundsPlayed: {[id: string]: number};
  selectedPack?: string;
  project?: ProjectSession;
}

type TrackedProjectProperties =
  | 'levelType'
  | 'mode'
  | 'channelId'
  | 'levelPath'
  | 'scriptName';

interface Session extends CommonSessionFields {
  startTime: number;
  soundsUsed: Set<string>;
}

interface SessionEndPayload extends CommonSessionFields {
  durationSeconds: number;
  soundsUsed: string[];
}

const sessionPayloadToMetricsPayload: (payload: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}) => Record<string, string> = payload => {
  const ret: Record<string, string> = {};
  for (const [k, v] of Object.entries(payload)) {
    if (typeof v === 'string') {
      ret[k] = v;
    } else {
      ret[k] = JSON.stringify(v);
    }
  }
  return ret;
};

/**
 * An analytics reporter specifically used for the Music Lab prototype, which logs analytics
 * to Amplitude. For the more general Amplitude Analytics Reporter used across the application
 * outside of Music Lab, check {@link packages/metrics/src/AnalyticsReporter}.
 */
export default class LabMusicMetricsReporter extends AnalyticsReporter {
  constructor() {
    super();
  }

  public async initialize() {
    const response = await fetch(API_KEY_ENDPOINT);
    const responseJson = await response.json();

    if (!responseJson.key) {
      throw new Error('No key for analytics.');
    }

    super.initialize(responseJson.key);
  }

  private session: Session | undefined;
  private startInProgress: boolean = false;

  async startSession() {
    // If a session is already in the process of starting, do not start another.
    if (this.startInProgress) {
      return;
    }
    this.startInProgress = true;
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
      //setSessionId(this.session.startTime);
      this.log(`Session start. Session ID: ${this.session.startTime}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.log(`Did not initialize analytics reporter.  (${message})`);

      // Log an error if this is not development. On development, this error is expected.
      if (!isDevelopmentEnvironment()) {
        LabRegistry.metricsReporter.logError(message, error as Error);
      }
    }

    GoogleAnalytics.trackEvent('music', 'music_session_start');
    this.startInProgress = false;
  }

  isSessionInProgress() {
    return !!this.session;
  }

  setProjectProperty(
    property: TrackedProjectProperties,
    value: string | number | undefined,
  ) {
    if (!this.session) {
      this.log('No session in progress');
      return;
    }

    this.session.project ||= {} as ProjectSession;
    this.session.project[property] = value;
    this.log(`Project property: ${property}: ${value}`);
  }

  setSelectedPack(packId: string | undefined) {
    if (!this.session) {
      this.log('No session in progress');
      return;
    }
    this.session.selectedPack = packId;
  }

  onPackSelected(packId: string) {
    this.onButtonClicked('select-pack', {packId});
    GoogleAnalytics.trackEvent('music', 'music_pack_selected', {value: packId});
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

  onValidationAttempt(passed: boolean, message: string) {
    this.trackUIEvent('Validation attempt', {passed, message});
  }

  onOpenPatternAiPanel() {
    this.trackUIEvent('Pattern AI panel opened');
  }

  onGenerateAiPatternStart(temperature: number) {
    this.trackUIEvent('Generate AI pattern start', {temperature});
  }

  onGenerateAiPatternEnd(
    timeSeconds: number,
    isInitialGenerate: boolean,
    temperature: number,
  ) {
    this.trackUIEvent('Generate AI pattern end', {
      timeSeconds,
      isInitialGenerate,
      temperature,
    });
  }

  private trackUIEvent(eventType: string, payload: object = {}) {
    const logMessage = `${eventType}. Payload: ${JSON.stringify(payload)}`;

    if (!this.session) {
      this.log(`No session in progress.  (${logMessage})`);
      return;
    } else {
      this.log(logMessage);
    }

    this.sendEvent(eventType, sessionPayloadToMetricsPayload(payload));
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

  onBlocksUpdated(blocks: Blockly.Block[]) {
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
        totalBlockCount,
      ),
      maxTriggerBlockCount: Math.max(
        this.session.blockStats.maxTriggerBlockCount,
        triggerBlocksCount,
      ),
      maxTriggerBlocksWithCode: Math.max(
        this.session.blockStats.maxTriggerBlocksWithCode,
        triggerBlocksWithCode,
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
      ...this.session,
      durationSeconds: duration / 1000,
      soundsUsed: Array.from(this.session.soundsUsed),
    };

    this.session = undefined;

    this.sendEvent('Session end', sessionPayloadToMetricsPayload(payload));

    this.log(`Session end. Payload: ${JSON.stringify(payload)}`);
  }

  log(message: string) {
    console.log(`[MUSIC AMPLITUDE ANALYTICS EVENT]: ${message}`);
  }

  formatUserId(userId: number) {
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
