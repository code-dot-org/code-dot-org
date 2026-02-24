import * as BlocklyCore from 'blockly/core';

import DCDO from '@cdo/apps/dcdo';
import AnalyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import trackEvent from '@cdo/apps/util/trackEvent';

import {BlockTypes} from '../blockly/blockTypes';
import {FIELD_SOUNDS_NAME} from '../blockly/constants';

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
 * An analytics reporter specifically used for Music Lab, which tracks Music Lab-specific
 * session information and forwards events to the global Code.org {@link AnalyticsReporter}.
 */
export default class MusicAnalyticsReporter {
  private session: Session | undefined;
  private projectContext: ProjectContext | undefined;

  startSession() {
    const startTime = Date.now();

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
    this.log(`Session start. Start time: ${this.session.startTime}`);
    trackEvent('music', 'music_session_start');
  }

  isSessionInProgress() {
    return !!this.session;
  }

  setProjectProperty<K extends keyof ProjectContext>(
    property: K,
    value: ProjectContext[K]
  ) {
    if (!this.session) {
      this.log('No session in progress');
      return;
    }

    if (!this.projectContext) {
      this.projectContext = {};
    }
    this.projectContext[property] = value;

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

    this.sendEvent(eventType, payload);
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

  onBlocksUpdated(blocks: BlocklyCore.Block[]) {
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

    this.sendEvent('Session end', payload);

    this.log(`Session end. Payload: ${JSON.stringify(payload)}`);
  }

  log(message: string) {
    console.log(`[MUSIC ANALYTICS EVENT]: ${message}`);
  }

  private sendEvent(eventName: string, payload: object) {
    AnalyticsReporter.sendEvent(`Music Lab ${eventName}`, {
      ...payload,
      ...this.projectContext,
    });
  }
}
