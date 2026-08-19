import {
  AiChatAccessLevels,
  AiChatToolsDependency,
} from '@code-dot-org/shared-constants';

import {ValueOf} from '@cdo/apps/types/utils';

export type AiChatAccessLevel = ValueOf<typeof AiChatAccessLevels>;
export type AiChatToolsDependencyValue = ValueOf<typeof AiChatToolsDependency>;
