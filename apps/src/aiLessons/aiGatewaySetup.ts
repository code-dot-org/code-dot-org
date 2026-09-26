// Wire up the AichatContextManager for the hackathon AI Lessons surface so
// that calls to the AI Gateway access-token endpoint succeed.  The lesson
// experience is not tied to a level/script/channel, so most context fields
// are null; the AI_LESSONS_HACKATHON client type is configured server-side
// to bypass the usual access checks.

import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

let initialized = false;

export function initAiLessonsGatewayContext() {
  if (initialized) return;
  AichatContextManager.setContext({
    clientType: AiChatClientTypes.AI_LESSONS_HACKATHON,
    currentLevelId: null,
    scriptId: null,
    channelId: undefined,
  });
  initialized = true;
}
