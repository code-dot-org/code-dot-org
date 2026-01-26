import {ValueOf} from '@cdo/apps/types/utils';
import {AiChatAccessLevels} from '@cdo/generated-scripts/sharedConstants';

export type AiChatAccessLevel = ValueOf<typeof AiChatAccessLevels>;
