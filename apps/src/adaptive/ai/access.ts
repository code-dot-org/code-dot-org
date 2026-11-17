import DCDO from '@cdo/apps/dcdo';
import {getStore} from '@cdo/apps/redux';
import {AiChatAccessLevels} from '@cdo/generated-scripts/sharedConstants';

const ADAPTIVE_AI_ENABLED_FLAG = 'adaptive-ai-enabled';

/**
 * Whether the shell makes its AI calls: adaptive AI is on and the server
 * will issue this user a token. The Adaptive level counts as essential on
 * the server, so only disabled access refuses; an unknown level is left to
 * the server. Read where needed rather than passed down, since neither
 * input changes within a page.
 */
export const isAdaptiveAiAvailable = (): boolean =>
  !!DCDO.get(ADAPTIVE_AI_ENABLED_FLAG, false) &&
  getStore().getState().currentUser?.aiChatAccessLevel !==
    AiChatAccessLevels.DISABLED;
