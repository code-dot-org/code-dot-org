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
  // Requests that the AI Gateway token be issued with content-safety checks
  // disabled. The server (AiGatewayAuthController) decides whether to honor
  // this -- it's granted only for levelbuilders, regardless of what's sent.
  disableSafetyChecks?: boolean;
};
