import {ValueOf} from '@cdo/apps/types/utils';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

export type AiChatClientType = ValueOf<typeof AiChatClientTypes>;

/**
 * Context provided to AI chat API endpoints.
 */
export type AichatContext = {
  clientType: AiChatClientType;
  currentLevelId: number | null;
  scriptId: number | null;
  channelId: string | undefined;
  lessonId?: number;
  // Ask for an AI Gateway token that skips the worker's input or output
  // moderation. Rails grants each only to client types on its allowlist.
  disableInputModeration?: boolean;
  disableOutputModeration?: boolean;
};
