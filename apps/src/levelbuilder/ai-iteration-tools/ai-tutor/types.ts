import {ValueOf} from '@cdo/apps/types/utils';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import {AI_TUTOR_ENDPOINT, LLM_GUARD_ENDPOINT} from './constants';

export type Endpoint =
  | ValueOf<typeof AiChatModelIds>
  | typeof AI_TUTOR_ENDPOINT
  | typeof LLM_GUARD_ENDPOINT;
