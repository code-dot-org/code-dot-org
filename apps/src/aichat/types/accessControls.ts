import {ValueOf} from '@cdo/apps/types/utils';
import {
  AiChatAccessLevels,
  AiChatDisabledReasons,
  AiChatToolsDependency,
} from '@cdo/generated-scripts/sharedConstants';

export type AiChatAccessLevel = ValueOf<typeof AiChatAccessLevels>;
export type AiChatToolsDependencyValue = ValueOf<typeof AiChatToolsDependency>;
// Why AI chat is disabled for the user, as computed by the server. null when
// access is not disabled at the user level.
export type AiChatDisabledReason = ValueOf<typeof AiChatDisabledReasons>;
