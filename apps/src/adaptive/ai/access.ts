import DCDO from '@cdo/apps/dcdo';
import {getStore} from '@cdo/apps/redux';
import {AiChatAccessLevels} from '@cdo/generated-scripts/sharedConstants';

const ADAPTIVE_AI_ENABLED_FLAG = 'adaptive-ai-enabled';
const ADAPTIVE_AI_OUTAGE_FLAG = 'adaptive-ai-outage';

/** Whether adaptive AI is on at all, by the DCDO flag. */
export const isAdaptiveAiEnabled = (): boolean =>
  !!DCDO.get(ADAPTIVE_AI_ENABLED_FLAG, false);

/**
 * Whether every AI provider the Adaptive shell depends on is down, by the
 * DCDO flag. Unlike isAdaptiveAiEnabled, which degrades individual steps,
 * this blocks the whole level.
 */
export const isAdaptiveAiDown = (): boolean =>
  !!DCDO.get(ADAPTIVE_AI_OUTAGE_FLAG, false);

/**
 * Whether the Adaptive shell can make AI calls: requires the DCDO flag
 * to be set to true and the user to have AI access.
 */
export const isAdaptiveAiAvailable = (): boolean =>
  isAdaptiveAiEnabled() &&
  getStore().getState().currentUser?.aiChatAccessLevel !==
    AiChatAccessLevels.DISABLED;
