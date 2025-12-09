import {
  init,
  track,
  Identify,
  identify,
  setSessionId,
  flush,
  setUserId,
} from '@amplitude/analytics-browser';
import * as GoogleBlockly from 'blockly/core';

import DCDO from '@cdo/apps/dcdo';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
// We are transitioning off of a standalone Amplitude project for Music Lab
// and onto Code.org's main Statsig project.
// In the short term, we log to both projects to establish parity between the two logging systems.
import {PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import cdoAnalyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import trackEvent from '@cdo/apps/util/trackEvent';
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

interface CommonSessionFields {
  blockStats: BlockStats;
  featuresUsed: {[feature: string]: boolean};
  soundsPlayed: {[id: string]: number};
  selectedPack?: string;
}

interface Session extends CommonSessionFields {
  startTime: number;
  soundsUsed: Set<string>;
}

interface SessionEndPayload extends CommonSessionFields {
  durationSeconds: number;
  soundsUsed: string[];
}

interface ProjectContext {
  levelType?: string;
  mode?: string;
  channelId?: string;
  levelPath?: string;
  scriptName?: string;
}

/**
 * An analytics reporter specifically used for the Music Lab prototype, which logs analytics
 * to Amplitude. For the more general Amplitude Analytics Reporter used across the application
 * outside of Music Lab, check {@link apps/src/metrics/AnalyticsReporter}.
 */
export default class AnalyticsReporter {
  private static initialized = false;

  /**
   * Temporarily available as a public static method so this reporter can be used outside of the
   * context of Music Lab, specifically for Panels levels in 2024 Hour of Code progression.
   * TODO: Remove/consolidate reporters after HOC 2024.
   */
  public static async initialize() {
    if (AnalyticsReporter.initialized) {
      return;
    }

    const response = await fetch(API_KEY_ENDPOINT);
    const responseJson = await response.json();

    if (!responseJson.key) {
      throw new Error('No key for analytics.');
    }

    AnalyticsReporter.initialized = true;
    init(responseJson.key);
  }

  private session: Session | undefined;
  private projectContext: ProjectContext | undefined;
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
      await AnalyticsReporter.initialize();
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

    trackEvent('music', 'music_session_start');
    this.startInProgress = false;
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

  setProjectProperty<K extends keyof ProjectContext>(
    property: K,
    value: ProjectContext[K]
  ) {
    if (!this.session) {
      this.log('No session in progress');
      return;
    }

    // For Statsig
    if (!this.projectContext) {
      this.projectContext = {};
    }
    this.projectContext[property] = value;

    // For Amplitude
    const identifyEvent = new Identify();
    if (value) {
      identifyEvent.set(property, value);
    } else {
      identifyEvent.unset(property);
    }
    identify(identifyEvent);

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
    trackEvent('music', 'music_pack_selected', {value: packId});
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
    temperature: number
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

    this.sendStatsigEvent(eventType, payload);
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

  onBlocksUpdated(blocks: GoogleBlockly.Block[]) {
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
      ...this.session,
      durationSeconds: duration / 1000,
      soundsUsed: Array.from(this.session.soundsUsed),
    };

    this.session = undefined;

    this.sendStatsigEvent('Session end', payload);
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

  private sendStatsigEvent(eventName: string, payload: object) {
    // We include project properties as part of the event payload rather than as user properties in Statsig.
    const combinedPayload = this.projectContext
      ? {...payload, ...this.projectContext}
      : payload;

    cdoAnalyticsReporter.sendEvent(
      `Music Lab ${eventName}`,
      combinedPayload,
      PLATFORMS.STATSIG
    );
  }
}
